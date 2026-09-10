require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const { sendPasswordResetEmail, sendWelcomeEmail, sendPredictionNotification, sendContactEmail } = require("./emailService");
const { generateChatResponse } = require("./services/aiService");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || (IS_PRODUCTION ? "" : "http://localhost:8000");
const FRONTEND_URL = process.env.FRONTEND_URL || (IS_PRODUCTION ? "" : "http://localhost:5500");
const configuredOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = configuredOrigins.length
  ? configuredOrigins
  : IS_PRODUCTION
    ? [FRONTEND_URL]
    : ["http://localhost:5500", "http://localhost:5501", FRONTEND_URL].filter(Boolean);

if (!JWT_SECRET && IS_PRODUCTION) {
  throw new Error("JWT_SECRET must be configured in production.");
}
if ((!AI_SERVICE_URL || !FRONTEND_URL) && IS_PRODUCTION) {
  throw new Error("AI_SERVICE_URL and FRONTEND_URL must be configured in production.");
}

const effectiveJwtSecret = JWT_SECRET || "development-only-secret-change-me";

if (!process.env.AI_API_KEY) {
  console.error("AI_API_KEY is missing");
}
if (!process.env.AI_MODEL) {
  console.error("AI_MODEL is missing");
}
if (process.env.AI_MODEL) {
  console.log(`✓ AI Model configured: ${process.env.AI_MODEL}`);
  console.log(`✓ AI Base URL: ${process.env.AI_BASE_URL || 'https://api.openai.com/v1'}`);
}

// Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Error: SUPABASE_URL and SUPABASE_SECRET_KEY are required in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const rateLimitBuckets = new Map();
function rateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = rateLimitBuckets.get(key);
    if (!bucket || now - bucket.startedAt >= windowMs) {
      rateLimitBuckets.set(key, { startedAt: now, count: 1 });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.setHeader("Retry-After", Math.ceil((windowMs - (now - bucket.startedAt)) / 1000));
      return res.status(429).json({ success: false, message });
    }
    return next();
  };
}

function requestId(req, res, next) {
  const id = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = String(id).slice(0, 100);
  res.setHeader("X-Request-Id", req.requestId);
  next();
}

async function ensureDatabase() {
  try {
    // Create users table
    await supabase.rpc("create_table_if_not_exists_users");
    // Create predictions table
    await supabase.rpc("create_table_if_not_exists_predictions");
    // academy_progress is provisioned by backend/supabase_lms.sql.
    // Keep startup compatible with projects that have not run that migration yet.
    console.log("Database tables ready");
  } catch (error) {
    console.log("Database initialization (tables may already exist):", error.message);
  }
}

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role || "user" }, effectiveJwtSecret, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function detectAiIntent(message, history = []) {
  const text = String(message || "").toLowerCase();
  const recent = history.slice(-4).map((entry) => String(entry?.content || "").toLowerCase()).join(" ");
  const combined = `${text} ${recent}`;
  const matches = {
    PREDICTION: /predict|prediction|analy[sz]e (this|the) (crop|leaf|image)|diagnos|what disease|affected crop|yellow leaves|የሰብል በሽታ|dhukkuba|maladie|enfermedad|مرض/,
    WEATHER: /weather|rain|raining|forecast|temperature|humidity|wind|spray|spraying|qilleensa|rooba|አየር ሁኔታ|ዝናብ|météo|lluvia|طقس|مطر/,
    FARM: /my farm|our farm|farm location|farm status|crops.*have|field|እርሻዬ|qonna koo|ma ferme|mi finca|مزرعتي/,
    DISEASE: /disease|symptom|late blight|rust|scab|leaf spot|treat.*disease|በሽታ|dhukkuba|maladie|enfermedad|مرض/,
    CROP: /crop|plant|tomato|maize|corn|wheat|apple|leaf|ሰብል|midhaan|culture|cultivo|محصول/,
    IRRIGATION: /irrigat|water.*crop|water.*field|drip|ግልበጣ|jallisii|irrigation|riego|ري/,
    SOIL: /soil|\bph\b|nitrogen|phosphorus|potassium|fertility|አፈር|biyyoo|sol|suelo|تربة/,
    FERTILIZER: /fertilizer|fertiliser|nutrient|manure|compost|ዳይናሚት|xaa’oo|engrais|fertilizante|سماد/,
    PEST: /pest|insect|aphid|worm|integrated pest|ipm|ተባይ|ilbiisa|ravageur|plaga|آفة/,
    YIELD: /yield|harvest|production|productivity|increase.*crop|ትርፍ|oomisha|rendement|rendimiento|محصول/,
    ACADEMY: /lesson|unit|quiz|practice|teach me|explain|photosynthesis|soil science|academy|ትምህርት|barumsa|leçon|curso|درس/,
    AGRICULTURE: /farming|agriculture|farm productivity|sustainable|crop rotation|prepare land|planting|weeds|ግብርና|qonna|agriculture|agricultura|زراعة/,
  };
  const precedence = ["PREDICTION", "WEATHER", "FARM", "DISEASE", "CROP", "IRRIGATION", "SOIL", "FERTILIZER", "PEST", "YIELD", "ACADEMY", "AGRICULTURE"];
  const matched = precedence.filter((intent) => matches[intent].test(text));
  const contextual = /^(what about|and|how about|what should i do|how can i fix it|what about tomorrow)\b/i.test(text) ? precedence.find((intent) => matches[intent].test(recent)) : null;
  const explicitAgriculture = /farming productivity|farming practices|what is farming|sustainable agriculture|crop rotation|prepare land/i.test(text);
  const primary = contextual || (explicitAgriculture ? "AGRICULTURE" : matched[0]) || "GENERAL";
  const secondary = matched.filter((intent) => intent !== primary).slice(0, 2);
  return { primary, secondary };
}

function extractFarmLocation(source) {
  if (!source) return null;
  const latitude = Number(source.latitude ?? source.lat ?? source.farm_latitude ?? source.farm_lat);
  const longitude = Number(source.longitude ?? source.lng ?? source.lon ?? source.farm_longitude ?? source.farm_lng);
  const hasCoordinateFields = [source.latitude, source.lat, source.farm_latitude, source.farm_lat, source.longitude, source.lng, source.lon, source.farm_longitude, source.farm_lng].some((value) => value !== undefined && value !== null && value !== "");
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  const location = source.farm_location || source.location || source.address || source.city || source.region || null;
  return { farmId: source.farm_id || source.farmId || source.user_id || null, name: source.farm_name || source.name || null, latitude: hasCoordinates ? latitude : null, longitude: hasCoordinates ? longitude : null, location: location ? String(location) : null, hasCoordinates, hasCoordinateFields, invalidCoordinates: hasCoordinateFields && !hasCoordinates };
}

async function collectAiContext(userId, intent, requestId) {
  const [userResult, farmResult, predictionResult, progressResult] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase.from("farm_profiles").select("user_id,farm_name,farm_location,latitude,longitude,region,city,country,updated_at").eq("user_id", userId).maybeSingle(),
    supabase.from("predictions").select("crop,disease,confidence,treatment,prevention,symptoms,causes,next_actions,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
    supabase.from("academy_progress").select("course_id,lesson_id,completed,quiz_score,last_visited_at").eq("user_id", userId),
  ]);
  const user = userResult.data || {};
  const farm = extractFarmLocation(farmResult.error ? user : (farmResult.data || user));
  const context = {
    user: user.name ? { name: user.name, role: user.role || "user" } : null,
    farm,
    weather: null,
    latestPredictions: predictionResult.error ? [] : (predictionResult.data || []),
    academyProgress: progressResult.error ? [] : (progressResult.data || []),
  };
  console.log("AI context collected", { requestId, userId, intent, hasFarm: Boolean(farm?.farmId || farm?.location || farm?.hasCoordinates), hasFarmLocation: Boolean(farm?.location), hasCoordinates: Boolean(farm?.hasCoordinates), predictionCount: context.latestPredictions.length });
  return context;
}

async function fetchWeatherForFarm(context, requestId, userId) {
  if (context.farm?.invalidCoordinates) return { context, status: "invalid_coordinates" };
  if (!context.farm?.hasCoordinates && !context.farm?.location) return { context, status: "location_required" };
  if (!context.farm?.hasCoordinates && context.farm?.location) {
    try {
      const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
      geocodeUrl.search = new URLSearchParams({ name: context.farm.location, count: "1", language: "en", format: "json" }).toString();
      const geocodeResponse = await fetch(geocodeUrl, { signal: AbortSignal.timeout(10000) });
      const geocodePayload = geocodeResponse.ok ? await geocodeResponse.json() : null;
      const result = geocodePayload?.results?.[0];
      if (!result || !Number.isFinite(Number(result.latitude)) || !Number.isFinite(Number(result.longitude))) return { context, status: "invalid_coordinates" };
      context.farm.latitude = Number(result.latitude); context.farm.longitude = Number(result.longitude); context.farm.hasCoordinates = true;
    } catch (error) {
      console.error("AI farm location geocoding failed", { requestId, userId, error: error?.name || "request_failed" });
      return { context, status: "weather_unavailable" };
    }
  }
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({ latitude: String(context.farm.latitude), longitude: String(context.farm.longitude), current: "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m", hourly: "precipitation_probability,temperature_2m", forecast_days: "2", timezone: "auto" }).toString();
  console.log("AI weather request started", { requestId, userId, farmId: context.farm.farmId, hasCoordinates: true });
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  } catch (error) {
    console.error("AI weather provider unavailable", { requestId, userId, error: error?.name || "request_failed" });
    return { context, status: "weather_unavailable" };
  }
  console.log("AI weather provider response", { requestId, userId, status: response.status });
  if (!response.ok) return { context, status: "weather_unavailable" };
  const payload = await response.json();
  context.weather = { location: context.farm.location, current: payload.current || null, hourly: payload.hourly || null, timezone: payload.timezone || null, source: "Open-Meteo" };
  console.log("AI weather parsed", { requestId, userId, hasCurrent: Boolean(payload.current), hasForecast: Boolean(payload.hourly) });
  return { context, status: "ok" };
}

function calculateLearningStreak(progressRows) {
  const visitedDays = new Set(
    progressRows
      .map((row) => row.last_visited_at)
      .filter(Boolean)
      .map((value) => new Date(value).toISOString().slice(0, 10))
  );
  const today = new Date();
  let streak = 0;

  for (let offset = 0; offset <= visitedDays.size; offset += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    if (!visitedDays.has(date.toISOString().slice(0, 10))) break;
    streak += 1;
  }

  return streak;
}

function normalizePredictionPayload(rawResult) {
  const prediction = rawResult?.prediction ?? rawResult ?? {};
  const crop = prediction.crop || rawResult?.crop || "Unknown";
  const disease = prediction.disease || rawResult?.disease || "Unknown";
  const confidence = Number(prediction.confidence ?? rawResult?.confidence ?? 0);
  const treatment = prediction.treatment || rawResult?.treatment || "";
  const prevention = prediction.prevention || rawResult?.prevention || "";
  const symptoms = prediction.symptoms || rawResult?.symptoms || "";
  const causes = prediction.causes || rawResult?.causes || "";
  const nextActions = prediction.next_actions || rawResult?.next_actions || "";
  const chemicalSafety = prediction.chemical_safety || rawResult?.chemical_safety || "";
  const isHealthy = typeof prediction.is_healthy === "boolean" ? prediction.is_healthy : /healthy/i.test(String(disease));

  return {
    crop: String(crop),
    disease: String(disease),
    confidence,
    treatment: String(treatment),
    prevention: String(prevention),
    symptoms: String(symptoms),
    causes: String(causes),
    nextActions: String(nextActions),
    chemicalSafety: String(chemicalSafety),
    is_healthy: Boolean(isHealthy),
    message: prediction.message || rawResult?.message || "",
  };
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.substring(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, effectiveJwtSecret);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

function validateImageFile(file) {
  if (!file) return "An image file is required.";
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const originalName = (file.originalname || "").toLowerCase();

  if (!allowedTypes.includes(file.mimetype)) return "Unsupported image type. Use JPG, PNG, or WEBP.";
  if (!allowedExtensions.some((ext) => originalName.endsWith(ext))) return "Image extension is invalid.";
  if (file.size > 5 * 1024 * 1024) return "Image is too large. Maximum file size is 5MB.";

  const signature = file.buffer.subarray(0, 12);
  const isJpeg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  const isPng = signature.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = signature.subarray(0, 4).toString("ascii") === "RIFF" && signature.subarray(8, 12).toString("ascii") === "WEBP";
  if ((file.mimetype === "image/jpeg" && !isJpeg) || (file.mimetype === "image/png" && !isPng) || (file.mimetype === "image/webp" && !isWebp)) {
    return "The uploaded file is not a valid image.";
  }

  return null;
}

app.disable("x-powered-by");
app.use(requestId);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: false, limit: "256kb" }));

// Handle .well-known requests silently
app.use(/^\/\.well-known/, (req, res) => {
  res.status(404).end();
});

app.get("/api/health", async (_, res) => {
  try {
    const aiCheck = await fetch(`${AI_SERVICE_URL}/health`);
    const dbCheck = await supabase.from("users").select("count", { count: "exact", head: true });
    res.json({
      success: true,
      backend: "online",
      database: dbCheck.error ? "offline" : "connected",
      ai_service: aiCheck.ok ? "online" : "offline",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.json({
      success: true,
      backend: "online",
      database: "offline",
      ai_service: "offline",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/api/weather", (_, res) => {
  res.json({
    location: "Demo Farm",
    temperature: 24,
    humidity: 61,
    rainfallMm: 12,
    windKmh: 14,
    source: "Demo data",
  });
});

app.get("/api/farm", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from("farm_profiles").select("user_id,farm_name,farm_location,latitude,longitude,region,city,country,updated_at").eq("user_id", req.user.id).maybeSingle();
    if (error) {
      console.error("Farm profile lookup failed", { requestId: req.requestId, userId: req.user.id, code: error.code });
      return res.status(503).json({ success: false, message: "Farm profiles are not configured. Run backend/supabase_lms.sql." });
    }
    return res.json({ success: true, data: data || null });
  } catch (error) {
    console.error("Farm profile request failed", { requestId: req.requestId, userId: req.user.id, name: error?.name });
    return res.status(500).json({ success: false, message: "Unable to load your farm profile." });
  }
});

app.put("/api/farm", authMiddleware, async (req, res) => {
  const farmName = String(req.body?.farmName || "").trim();
  const farmLocation = String(req.body?.farmLocation || "").trim();
  const latitude = Number(req.body?.latitude);
  const longitude = Number(req.body?.longitude);
  if (!farmName || !farmLocation) return res.status(400).json({ success: false, message: "Farm name and farm location are required." });
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return res.status(422).json({ success: false, message: "Your farm location appears to be invalid. Please provide valid coordinates." });
  }
  try {
    const { data, error } = await supabase.from("farm_profiles").upsert({ user_id: req.user.id, farm_name: farmName, farm_location: farmLocation, latitude, longitude, region: req.body?.region || null, city: req.body?.city || null, country: req.body?.country || null, updated_at: new Date().toISOString() }, { onConflict: "user_id" }).select().single();
    if (error) {
      console.error("Farm profile save failed", { requestId: req.requestId, userId: req.user.id, code: error.code });
      return res.status(503).json({ success: false, message: "Farm profiles are not configured. Run backend/supabase_lms.sql." });
    }
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Farm profile save request failed", { requestId: req.requestId, userId: req.user.id, name: error?.name });
    return res.status(500).json({ success: false, message: "Unable to save your farm profile." });
  }
});

app.get("/api/dashboard/summary", authMiddleware, async (req, res) => {
  try {
    const [userRes, predictionRes, progressRes] = await Promise.all([
      supabase.from("users").select("id, created_at").eq("id", req.user.id).maybeSingle(),
      supabase.from("predictions").select("id, confidence, created_at").eq("user_id", req.user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("academy_progress").select("course_id, lesson_id, completed, quiz_score, last_visited_at").eq("user_id", req.user.id),
    ]);

    const progressRows = progressRes.error ? [] : (progressRes.data || []);
    const completedRows = progressRows.filter((row) => row.completed);
    const coursesCompleted = new Set(completedRows.map((row) => row.course_id)).size;
    const lessonsCompleted = completedRows.length;
    const quizScores = progressRows.filter((row) => Number.isFinite(Number(row.quiz_score))).map((row) => Number(row.quiz_score));
    const quizAverage = quizScores.length ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length) : 0;
    const cropAnalyses = predictionRes.data?.length || 0;
    const lastVisitedLesson = progressRows.sort((a, b) => new Date(b.last_visited_at).getTime() - new Date(a.last_visited_at).getTime())[0]?.lesson_id || null;
    const learningStreak = calculateLearningStreak(progressRows);

    res.json({
      success: true,
      data: {
        coursesCompleted,
        lessonsCompleted,
        quizAverage,
        cropAnalyses,
        learningStreak,
        user: userRes.data ? { id: userRes.data.id, createdAt: userRes.data.created_at } : null,
        recentAnalyses: (predictionRes.data || []).map((row) => ({
          id: row.id,
          confidence: Number(row.confidence || 0),
          createdAt: row.created_at,
        })),
        lastVisitedLesson,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load dashboard summary." });
  }
});

app.get("/api/education/catalog", async (_, res) => {
  res.json({
    success: true,
    data: [
      {
        id: "intro-agriculture",
        title: "Introduction to Agriculture",
        units: 3,
        lessons: 12,
        level: "Beginner",
        description: "Build a practical understanding of farming systems, crop production, and agricultural planning.",
      },
      {
        id: "crop-disease-management",
        title: "Crop Disease Management",
        units: 4,
        lessons: 16,
        level: "Intermediate",
        description: "Learn how to identify, prevent, and manage crop diseases under field conditions.",
      },
      {
        id: "soil-science",
        title: "Soil Science",
        units: 3,
        lessons: 10,
        level: "Intermediate",
        description: "Understand soil health, fertility, and nutrient management for better yields.",
      },
      {
        id: "irrigation-management",
        title: "Irrigation Management",
        units: 3,
        lessons: 9,
        level: "Intermediate",
        description: "Plan irrigation schedules and water-use efficiency for different crops.",
      },
      {
        id: "sustainable-agriculture",
        title: "Sustainable Agriculture",
        units: 3,
        lessons: 11,
        level: "Advanced",
        description: "Explore resilient farming, soil conservation, and climate-smart agriculture.",
      },
    ],
  });
});

app.get("/api/academy/progress", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from("academy_progress").select("*").eq("user_id", req.user.id);
    if (error) return res.status(503).json({ success: false, message: "Academy progress storage is not configured. Run backend/supabase_lms.sql." });
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(503).json({ success: false, message: "Unable to load Academy progress." });
  }
});

app.put("/api/academy/progress/:lessonId", authMiddleware, async (req, res) => {
  const lessonId = String(req.params.lessonId || "").trim();
  const courseId = String(req.body?.courseId || "").trim();
  if (!lessonId || !courseId) return res.status(400).json({ success: false, message: "courseId is required." });

  const completed = Boolean(req.body?.completed);
  const quizScore = req.body?.quizScore === null || req.body?.quizScore === undefined ? null : Number(req.body.quizScore);
  if (quizScore !== null && (!Number.isInteger(quizScore) || quizScore < 0 || quizScore > 100)) {
    return res.status(400).json({ success: false, message: "quizScore must be an integer from 0 to 100." });
  }

  try {
    const { data, error } = await supabase.from("academy_progress").upsert({
      user_id: req.user.id,
      lesson_id: lessonId,
      course_id: courseId,
      completed,
      quiz_score: quizScore,
      last_visited_at: new Date().toISOString(),
      completed_at: completed ? new Date().toISOString() : null,
    }, { onConflict: "user_id,lesson_id" }).select().single();
    if (error) return res.status(503).json({ success: false, message: "Academy progress storage is not configured. Run backend/supabase_lms.sql." });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(503).json({ success: false, message: "Unable to save Academy progress." });
  }
});

app.post("/api/auth/register", rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many registration attempts. Please try again later." }), async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
  }

  try {
    const { data: existing, error: lookupError } = await supabase.from("users").select("id").eq("email", normalizedEmail).limit(1);
    if (lookupError) {
      console.error("Registration user lookup failed", { requestId: req.requestId, code: lookupError.code });
      return res.status(503).json({ success: false, message: "Registration service is temporarily unavailable." });
    }
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: "An account with that email already exists." });
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await bcrypt.hash(String(password), 10);

    const { data, error } = await supabase.from("users").insert({
      id: userId,
      name: String(name).trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: "user",
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ success: false, message: "An account with that email already exists." });
      }
      console.error("Registration insert failed", { requestId: req.requestId, code: error.code });
      return res.status(503).json({ success: false, message: "Registration service is temporarily unavailable." });
    }

    const safeUser = sanitizeUser(data);
    const token = createToken(safeUser);
    
    // Send welcome email asynchronously (don't wait for it)
    sendWelcomeEmail(normalizedEmail, String(name).trim()).catch(err => 
      console.error("Welcome email failed:", err)
    );

    return res.status(201).json({ success: true, message: "Registration successful.", data: { token, user: safeUser } });
  } catch (error) {
    console.error("Registration request failed", { requestId: req.requestId, name: error?.name });
    return res.status(503).json({ success: false, message: "Registration service is temporarily unavailable." });
  }
});

app.post("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many login attempts. Please try again later." }), async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  try {
    const { data: users, error } = await supabase.from("users").select("*").eq("email", normalizedEmail).limit(1);

    if (error || !users || users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = users[0];
    const valid = await bcrypt.compare(String(password), user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const safeUser = sanitizeUser(user);
    return res.json({ success: true, message: "Login successful.", data: { token: createToken(safeUser), user: safeUser } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed." });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase.from("users").select("*").eq("id", req.user.id).single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load profile." });
  }
});

app.post("/api/auth/logout", (_, res) => res.json({ success: true, message: "Logged out successfully." }));

app.post("/api/email/test", authMiddleware, async (req, res) => {
  const email = String(req.body?.email || "").trim();
  if (!email) {
    return res.status(400).json({ success: false, message: "Email address is required." });
  }

  const sent = await sendWelcomeEmail(email, "Test User");
  if (!sent) {
    return res.status(500).json({ success: false, message: "Failed to send test email. Check EMAIL_USER and EMAIL_PASSWORD in backend/.env." });
  }

  return res.json({ success: true, message: "Test email sent successfully." });
});

// Password Reset - Request
app.post("/api/auth/forgot-password", rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: "Too many reset requests. Please try again later." }), async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  try {
    const { data: users } = await supabase.from("users").select("id").eq("email", normalizedEmail).limit(1);

    if (!users || users.length === 0) {
      // Return success anyway for security (don't reveal if email exists)
      return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = jwt.sign({ email: normalizedEmail }, effectiveJwtSecret, { expiresIn: "1h" });
    const emailSent = await sendPasswordResetEmail(normalizedEmail, resetToken);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: "Failed to send reset email. Try again later." });
    }

    return res.json({ success: true, message: "Password reset email sent. Check your inbox." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Password reset request failed." });
  }
});

// Password Reset - Verify Token and Reset
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: "Token and new password are required." });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
  }

  try {
    const decoded = jwt.verify(token, effectiveJwtSecret);
    const email = decoded.email;

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    const { error } = await supabase.from("users").update({ password_hash: passwordHash }).eq("email", email);

    if (error) {
      return res.status(500).json({ success: false, message: "Password reset failed." });
    }

    return res.json({ success: true, message: "Password reset successfully. You can now login." });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired reset token." });
  }
});

app.get("/api/users/profile", authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase.from("users").select("*").eq("id", req.user.id).single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Profile load failed." });
  }
});

app.put("/api/users/profile", authMiddleware, async (req, res) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: "Name is required." });
  }

  try {
    const { data: user, error } = await supabase
      .from("users")
      .update({ name: String(name).trim() })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error || !user) {
      return res.status(500).json({ success: false, message: "Profile update failed." });
    }

    return res.json({ success: true, message: "Profile updated.", data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Profile update failed." });
  }
});

app.post("/api/crop/analyze", authMiddleware, rateLimit({ windowMs: 60 * 1000, max: 10, message: "Too many crop analysis requests. Please try again shortly." }), upload.single("file"), async (req, res) => {
  const validationError = validateImageFile(req.file);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const formData = new FormData();
    formData.append("file", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);

    const response = await fetch(`${AI_SERVICE_URL}/predict`, { method: "POST", body: formData });
    const result = await response.json();

    if (!response.ok || result.success === false) {
      return res.status(502).json({ success: false, message: result.error || "AI prediction failed." });
    }

    return res.json({ success: true, message: "Prediction successful.", data: result });
  } catch (error) {
    return res.status(503).json({ success: false, message: "AI service unavailable." });
  }
});

app.post("/api/predictions", authMiddleware, upload.single("image"), async (req, res) => {
  const validationError = validateImageFile(req.file);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const formData = new FormData();
    formData.append("file", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);

    const response = await fetch(`${AI_SERVICE_URL}/predict`, { method: "POST", body: formData });
    const rawAiResult = await response.json();
    const aiResult = rawAiResult?.prediction ? rawAiResult : { prediction: normalizePredictionPayload(rawAiResult) };
    const prediction = aiResult.prediction ?? normalizePredictionPayload(rawAiResult);

    if (!response.ok || rawAiResult?.success === false || prediction?.crop === undefined) {
      const message = rawAiResult?.error?.message || rawAiResult?.error || "AI prediction failed.";
      return res.status(502).json({ success: false, error: { code: "AI_PREDICTION_FAILED", message } });
    }

    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const imageName = `${Date.now()}_${(req.file.originalname || "image").replace(/\s+/g, "_")}`;

    const predictionRow = {
      id: predictionId,
      user_id: req.user.id,
      image_name: imageName,
      crop: prediction.crop || "Unknown",
      disease: prediction.disease || "Unknown",
      confidence: Number(prediction.confidence || 0),
      treatment: prediction.treatment || "",
      prevention: prediction.prevention || "",
      symptoms: prediction.symptoms || "",
      causes: prediction.causes || "",
      next_actions: prediction.nextActions || "",
      chemical_safety: prediction.chemicalSafety || "",
      created_at: new Date().toISOString(),
    };
    let { data, error } = await supabase.from("predictions").insert(predictionRow).select().single();

    if (error?.code === "42703" || error?.code === "PGRST204") {
      const legacyRow = { ...predictionRow };
      delete legacyRow.symptoms;
      delete legacyRow.causes;
      delete legacyRow.next_actions;
      delete legacyRow.chemical_safety;
      ({ data, error } = await supabase.from("predictions").insert(legacyRow).select().single());
    }

    if (error) {
      console.error("Prediction save failed:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "PREDICTION_SAVE_FAILED",
          message: error.message || "Failed to save prediction.",
        },
      });
    }

    sendPredictionNotification(req.user.email, prediction.crop || "Unknown", prediction.disease || "Unknown").catch(err =>
      console.error("Prediction email failed:", err)
    );

    return res.status(201).json({
      success: true,
      message: "Prediction successful.",
      data: {
        id: data.id,
        crop: data.crop,
        disease: data.disease,
        confidence: Number(data.confidence),
        treatment: data.treatment,
        prevention: data.prevention,
        symptoms: data.symptoms,
        causes: data.causes,
        nextActions: data.next_actions,
        chemicalSafety: data.chemical_safety,
        imageName: data.image_name,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error("Prediction request failed:", error);
    return res.status(503).json({
      success: false,
      error: {
        code: "AI_SERVICE_UNAVAILABLE",
        message: "AI service is unavailable.",
      },
    });
  }
});

app.get("/api/predictions", authMiddleware, async (req, res) => {
  try {
    const { data: predictions, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: "Unable to load prediction history." });
    }

    return res.json({
      success: true,
      data: (predictions || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        imageName: row.image_name,
        crop: row.crop,
        disease: row.disease,
        confidence: Number(row.confidence),
        treatment: row.treatment,
        prevention: row.prevention,
        symptoms: row.symptoms,
        causes: row.causes,
        nextActions: row.next_actions,
        chemicalSafety: row.chemical_safety,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load prediction history." });
  }
});

app.get("/api/predictions/:id", authMiddleware, async (req, res) => {
  try {
    const { data: predictions, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .limit(1);

    if (error || !predictions || predictions.length === 0) {
      return res.status(404).json({ success: false, message: "Prediction not found." });
    }

    const row = predictions[0];
    return res.json({
      success: true,
      data: {
        id: row.id,
        crop: row.crop,
        disease: row.disease,
        confidence: Number(row.confidence),
        treatment: row.treatment,
        prevention: row.prevention,
        symptoms: row.symptoms,
        causes: row.causes,
        nextActions: row.next_actions,
        chemicalSafety: row.chemical_safety,
        imageName: row.image_name,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load this prediction." });
  }
});

async function handleAiChatRequest(req, res) {
  const lang = String(req.body?.lang || "en");
  const message = String(req.body?.message || "").trim();
  const historyInput = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!message) {
    return res.status(400).json({ success: false, message: "Message is required." });
  }
  if (message.length > 4000) {
    return res.status(400).json({ success: false, message: "Message is too long." });
  }

  try {
    const detected = detectAiIntent(message, historyInput);
    const intent = detected.primary;
    console.log("AI request received", { requestId: req.requestId, userId: req.user.id, intent, secondaryIntent: detected.secondary });
    const contextResult = await collectAiContext(req.user.id, intent, req.requestId);
    let context = contextResult;

    if (intent === "WEATHER") {
      const weatherResult = await fetchWeatherForFarm(context, req.requestId, req.user.id);
      context = weatherResult.context;
      if (weatherResult.status === "location_required") {
        const reply = "Please add your farm location first so I can provide accurate weather information for your farm.";
        console.log("AI response completed", { requestId: req.requestId, userId: req.user.id, intent, status: weatherResult.status });
        return res.json({ success: true, message: reply, data: { reply, language: lang, intent, secondaryIntent: detected.secondary, context, locationRequired: true } });
      }
      if (weatherResult.status === "invalid_coordinates") {
        const reply = "Your farm location appears to be invalid. Please update it in My Farm.";
        return res.status(422).json({ success: false, message: reply, intent, secondaryIntent: detected.secondary });
      }
      if (weatherResult.status !== "ok") {
        const reply = "I couldn't retrieve the latest weather data right now. Please try again shortly.";
        console.log("AI response completed", { requestId: req.requestId, userId: req.user.id, intent, status: weatherResult.status });
        return res.status(503).json({ success: false, message: reply, intent });
      }
    }

    const history = historyInput
      .slice(-12)
      .map((entry) => ({
        role: entry?.role === "assistant" ? "assistant" : "user",
        content: String(entry?.content || "").trim(),
      }))
      .filter((entry) => entry.content);

    if (intent === "FARM" && !context.farm?.farmId && !context.farm?.location && !context.farm?.hasCoordinates) {
      const reply = "Please add your farm first so I can use your farm information.";
      return res.json({ success: true, message: reply, data: { reply, language: lang, intent, secondaryIntent: detected.secondary, context } });
    }
    const reply = await generateChatResponse({ message, history, lang, intent, context });
    console.log("AI response completed", { requestId: req.requestId, userId: req.user.id, intent, secondaryIntent: detected.secondary, toolsUsed: context.weather ? ["weather"] : [], status: "ok" });
    return res.json({ success: true, message: reply, data: { reply, language: lang, intent, secondaryIntent: detected.secondary, context } });
  } catch (error) {
    const providerMessage = error instanceof Error ? error.message : "";
    const messageText = /timed out|timeout/i.test(providerMessage)
      ? "The AI service timed out. Please try again shortly."
      : /AI_API_KEY|provider request failed|AI provider|fetch failed/i.test(providerMessage)
        ? "The AI service is temporarily unavailable. Please try again shortly."
        : "The AI assistant could not complete that request.";
    console.error("AI request failed", { requestId: req.requestId, userId: req.user.id, error: providerMessage || "unknown_error" });
    return res.status(502).json({ success: false, message: messageText, intent: detectAiIntent(message, historyInput).primary });
  }
}

const aiChatProtection = [
  authMiddleware,
  rateLimit({ windowMs: 60 * 1000, max: 20, message: "Too many AI requests. Please try again shortly." }),
];
app.post("/api/chat", ...aiChatProtection, handleAiChatRequest);
app.post("/api/ai/chat", ...aiChatProtection, handleAiChatRequest);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "Image is too large. Maximum file size is 5MB." : "Invalid file upload.";
    return res.status(400).json({ success: false, message, requestId: req.requestId });
  }
  console.error(`[${req.requestId}] request failed:`, error instanceof Error ? error.message : "Unknown error");
  return res.status(500).json({ success: false, message: "An unexpected server error occurred.", requestId: req.requestId });
});

ensureDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
    console.log(`AI service target: ${AI_SERVICE_URL}`);
    console.log(`Frontend origin: ${FRONTEND_URL}`);
    console.log(`Supabase URL: ${SUPABASE_URL}`);
  });
});
