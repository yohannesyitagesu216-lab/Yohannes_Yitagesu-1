require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5500";
const DB_PATH = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(DB_PATH);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function asyncDb(statement, params = []) {
  return new Promise((resolve, reject) => {
    db.run(statement, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function queryDb(statement, params = []) {
  return new Promise((resolve, reject) => {
    db.all(statement, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function ensureDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        image_name TEXT NOT NULL,
        crop TEXT NOT NULL,
        disease TEXT NOT NULL,
        confidence REAL NOT NULL,
        treatment TEXT,
        prevention TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  });
}

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.substring(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
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

  return null;
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", async (_, res) => {
  try {
    const aiCheck = await fetch(`${AI_SERVICE_URL}/health`);
    res.json({
      success: true,
      backend: "online",
      database: "connected",
      ai_service: aiCheck.ok ? "online" : "offline",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.json({
      success: true,
      backend: "online",
      database: "connected",
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

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (String(password).length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
  }

  try {
    const existing = await queryDb("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "An account with that email already exists." });
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await bcrypt.hash(String(password), 10);
    await asyncDb(
      "INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, String(name).trim(), normalizedEmail, passwordHash, "user", new Date().toISOString()]
    );

    const rows = await queryDb("SELECT * FROM users WHERE id = ?", [userId]);
    const safeUser = sanitizeUser(rows[0]);
    const token = createToken(safeUser);
    return res.status(201).json({ success: true, message: "Registration successful.", data: { token, user: safeUser } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Registration failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  try {
    const rows = await queryDb("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = rows[0];
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
    const rows = await queryDb("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.json({ success: true, data: sanitizeUser(rows[0]) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load profile." });
  }
});

app.post("/api/auth/logout", (_, res) => res.json({ success: true, message: "Logged out successfully." }));

app.get("/api/users/profile", authMiddleware, async (req, res) => {
  try {
    const rows = await queryDb("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.json({ success: true, data: sanitizeUser(rows[0]) });
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
    await asyncDb("UPDATE users SET name = ? WHERE id = ?", [String(name).trim(), req.user.id]);
    const rows = await queryDb("SELECT * FROM users WHERE id = ?", [req.user.id]);
    return res.json({ success: true, message: "Profile updated.", data: sanitizeUser(rows[0]) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Profile update failed." });
  }
});

app.post("/api/crop/analyze", upload.single("file"), async (req, res) => {
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
    const aiResult = await response.json();

    if (!response.ok || aiResult.success === false) {
      return res.status(502).json({ success: false, message: aiResult.error || "AI prediction failed." });
    }

    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const imageName = `${Date.now()}_${(req.file.originalname || "image").replace(/\s+/g, "_")}`;

    await asyncDb(
      "INSERT INTO predictions (id, user_id, image_name, crop, disease, confidence, treatment, prevention, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        predictionId,
        req.user.id,
        imageName,
        aiResult.crop || "Unknown",
        aiResult.disease || "Unknown",
        Number(aiResult.confidence || 0),
        aiResult.treatment || "",
        aiResult.prevention || "",
        new Date().toISOString(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Prediction successful.",
      data: {
        id: predictionId,
        crop: aiResult.crop || "Unknown",
        disease: aiResult.disease || "Unknown",
        confidence: Number(aiResult.confidence || 0),
        treatment: aiResult.treatment || "",
        prevention: aiResult.prevention || "",
        imageName,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(503).json({ success: false, message: "AI service is unavailable." });
  }
});

app.get("/api/predictions", authMiddleware, async (req, res) => {
  try {
    const rows = await queryDb("SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
    return res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        imageName: row.image_name,
        crop: row.crop,
        disease: row.disease,
        confidence: Number(row.confidence),
        treatment: row.treatment,
        prevention: row.prevention,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load prediction history." });
  }
});

app.get("/api/predictions/:id", authMiddleware, async (req, res) => {
  try {
    const rows = await queryDb("SELECT * FROM predictions WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Prediction not found." });
    }

    const row = rows[0];
    return res.json({
      success: true,
      data: {
        id: row.id,
        crop: row.crop,
        disease: row.disease,
        confidence: Number(row.confidence),
        treatment: row.treatment,
        prevention: row.prevention,
        imageName: row.image_name,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load this prediction." });
  }
});

app.post("/api/chat", (req, res) => {
  const lang = req.body?.lang || "en";
  const message = String(req.body?.message || "").toLowerCase();
  const replies = {
    en: {
      generic: "I can help with crop disease, soil, irrigation, pests, yield, and lessons.",
      disease: "Symptoms can have multiple causes. Use image analysis and confirm important treatment decisions with an agronomist.",
      water: "Check soil moisture and rainfall before irrigation; avoid overwatering.",
      soil: "Use soil testing and local recommendations for fertilizer decisions.",
      pest: "Inspect crops regularly and use integrated pest management (IPM).",
      lesson: "Open Agriculture Academy to study lessons, take quizzes, and track progress."
    },
    am: {
      generic: "ስለ ሰብል በሽታ፣ አፈር፣ መስኖ፣ ተባይ፣ ምርት እና ትምህርት ልረዳህ እችላለሁ።",
      disease: "ምልክቶች ብዙ ምክንያት ሊኖራቸው ይችላል።",
      water: "ከመስኖ በፊት የአፈር እርጥበትን እና የዝናብ ትንበያን ተመልከት።",
      soil: "ለማዳበሪያ ውሳኔ የአፈር ላብራቶሪ ምርመራን ተጠቀም።",
      pest: "እፅዋትን በየጊዜው መርምር እና IPM ተጠቀም።",
      lesson: "Agriculture Academy ውስጥ ትምህርት ተማር፣ quiz ስራ እና progress ተከታተል።"
    },
    om: {
      generic: "Dhukkuba midhaanii, biyyee, jallisii, ilbiisotaa fi oomisha irratti si gargaaruu nan danda'a.",
      disease: "Mallattoon sababoota hedduu qabaachuu danda'a.",
      water: "Jallisuu dura jiidhina biyyee fi rooba ilaali.",
      soil: "Murtii xaa'oo kennuuf qorannoo biyyee fi gorsa naannoo fayyadami.",
      pest: "Midhaan yeroo yeroon ilaali; IPM fayyadami.",
      lesson: "Agriculture Academy keessatti baradhu, quiz hojjedhu, progress hordofi."
    },
    fr: {
      generic: "Je peux aider sur les maladies, le sol, l'irrigation, les ravageurs, le rendement et les leçons.",
      disease: "Un symptôme peut avoir plusieurs causes.",
      water: "Vérifiez l'humidité du sol et la pluie avant l'irrigation.",
      soil: "Utilisez une analyse de sol et les recommandations locales pour les engrais.",
      pest: "Inspectez régulièrement les cultures et utilisez la lutte intégrée.",
      lesson: "Ouvrez Agriculture Academy pour apprendre, faire les quiz et suivre vos progrès."
    },
    ar: {
      generic: "يمكنني المساعدة في أمراض المحاصيل والتربة والري والآفات والإنتاج والدروس.",
      disease: "يمكن أن تكون الأعراض لها عدة أسباب.",
      water: "تحقق من رطوبة التربة والأمطار قبل الري.",
      soil: "استخدم تحليل التربة والتوصيات المحلية للأسمدة.",
      pest: "افحص المحاصيل بانتظام واستخدم الإدارة المتكاملة للآفات.",
      lesson: "افتح Agriculture Academy لتتعلم، وتؤدي الاختبارات، وتتبع تقدمك."
    }
  };

  const text = replies[lang] || replies.en;
  let reply = text.generic;

  if (/water|irrig|rain|moi|eau|ماء|ري/.test(message)) reply = text.water;
  else if (/soil|fertil|nutr|ph|sol|تربة|سماد/.test(message)) reply = text.soil;
  else if (/pest|insect|ravageur|آفة|دودة/.test(message)) reply = text.pest;
  else if (/lesson|learn|quiz|درس|barnoota|leçon/.test(message)) reply = text.lesson;
  else if (/disease|leaf|crop|maladie|feuille|مرض|baala|midhaan/.test(message)) reply = text.disease;

  return res.json({ success: true, data: { reply, language: lang } });
});

ensureDatabase();
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
  console.log(`AI service target: ${AI_SERVICE_URL}`);
  console.log(`Frontend origin: ${FRONTEND_URL}`);
});
