import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model import load_model, predict_image


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_model()
    yield


app = FastAPI(title="AgroVision AI Service", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("AI_ALLOWED_ORIGINS", "http://localhost:5000").split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)

MAX_IMAGE_BYTES = 5 * 1024 * 1024


class Soil(BaseModel):
    ph: float = Field(ge=0, le=14)
    nitrogen: float = Field(ge=0)
    phosphorus: float = Field(ge=0)
    potassium: float = Field(ge=0)
    moisture: float = Field(ge=0, le=100)


class Irr(BaseModel):
    soil_moisture: float = Field(ge=0, le=100)
    temperature: float
    rainfall_forecast: float = Field(ge=0)
    crop_stage: str


class Pest(BaseModel):
    temperature: float
    humidity: float = Field(ge=0, le=100)
    rainfall: float = Field(ge=0)
    crop: str


class Yield(BaseModel):
    crop: str
    rainfall: float = Field(ge=0)
    temperature: float
    soil_moisture: float = Field(ge=0, le=100)
    farm_area: float = Field(gt=0)


def _normalized_prediction(payload: dict):
    if not isinstance(payload, dict):
        return {"success": False, "error": {"code": "AI_PREDICTION_FAILED", "message": "Prediction payload was invalid."}}

    prediction = payload.get("prediction", payload)
    if not isinstance(prediction, dict):
        return {"success": False, "error": {"code": "AI_PREDICTION_FAILED", "message": "Prediction payload was invalid."}}

    crop = str(prediction.get("crop") or payload.get("crop") or "Unknown").strip()
    disease = str(prediction.get("disease") or payload.get("disease") or "Unknown").strip()
    confidence = float(prediction.get("confidence") if prediction.get("confidence") is not None else payload.get("confidence") or 0.0)
    is_healthy = bool(prediction.get("is_healthy") if "is_healthy" in prediction else ("healthy" in disease.lower()))

    return {
        "success": True,
        "prediction": {
            "crop": crop,
            "disease": disease,
            "confidence": round(confidence, 2),
            "is_healthy": is_healthy,
            "treatment": prediction.get("treatment") or payload.get("treatment") or "",
            "prevention": prediction.get("prevention") or payload.get("prevention") or "",
            "symptoms": prediction.get("symptoms") or payload.get("symptoms") or "",
            "causes": prediction.get("causes") or payload.get("causes") or "",
            "next_actions": prediction.get("next_actions") or payload.get("next_actions") or "",
            "chemical_safety": prediction.get("chemical_safety") or payload.get("chemical_safety") or "",
            "message": prediction.get("message") or payload.get("message") or "",
        },
    }


@app.get("/health")
def health():
    model_ok = load_model() is not False
    return {"success": True, "status": "healthy" if model_ok else "degraded", "model_loaded": model_ok}


@app.get("/ready")
def ready():
    if load_model() is False:
        raise HTTPException(status_code=503, detail="AI model is not ready.")
    return {"success": True, "status": "ready", "model_loaded": True}


async def _validate_upload(file: UploadFile) -> bytes:
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Image file is required.")
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP images are allowed.")
    image_bytes = await file.read(MAX_IMAGE_BYTES + 1)
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image is too large. Maximum file size is 5MB.")
    return image_bytes


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await _validate_upload(file)
    try:
        result = predict_image(image_bytes)
        if not result.get("success"):
            return {"success": False, "error": {"code": "AI_PREDICTION_FAILED", "message": result.get("error", "Prediction failed.")}}
        return _normalized_prediction(result)
    except Exception:
        return {"success": False, "error": {"code": "AI_PREDICTION_FAILED", "message": "Prediction failed. Please try again with a valid image."}}


@app.post("/api/analyze-crop")
async def crop(file: UploadFile = File(...)):
    return await predict(file)


@app.post("/api/soil-analyze")
def soil(d: Soil):
    score = 0
    score += 25 if 5.5 <= d.ph <= 7.5 else 0
    score += 25 if d.nitrogen >= 40 else 0
    score += 20 if d.phosphorus >= 30 else 0
    score += 20 if d.potassium >= 30 else 0
    score += 10 if 30 <= d.moisture <= 70 else 0
    return {
        "score": score,
        "status": "Good" if score >= 80 else "Needs attention",
        "recommendation": "Use laboratory soil testing before fertilizer decisions."
    }


@app.post("/api/predict-irrigation")
def irr(d: Irr):
    risk = "HIGH" if d.soil_moisture < 25 and d.rainfall_forecast < 5 else "MEDIUM" if d.soil_moisture < 40 else "LOW"
    return {
        "status": "IRRIGATION MAY BE NEEDED" if risk == "HIGH" else "MONITOR" if risk == "MEDIUM" else "NO IRRIGATION NEEDED",
        "risk_level": risk,
        "recommendation": "Check field conditions and crop stage before irrigation."
    }


@app.post("/api/pest-risk")
def pest(d: Pest):
    score = 0
    score += 35 if d.humidity > 70 else 0
    score += 30 if 20 <= d.temperature <= 32 else 0
    score += 25 if d.rainfall > 50 else 0
    risk = "HIGH" if score >= 70 else "MODERATE" if score >= 40 else "LOW"
    return {
        "risk": risk,
        "score": score,
        "recommendation": "Inspect crops regularly and use locally approved IPM practices."
    }


@app.post("/api/predict-yield")
def y(d: Yield):
    base = {"maize": 2.5, "wheat": 2.2, "teff": 1.8, "tomato": 4.0, "potato": 3.5}.get(d.crop.lower(), 2.0)
    if d.soil_moisture < 30:
        base *= 0.75
    if d.temperature > 35:
        base *= 0.85
    if d.rainfall < 300:
        base *= 0.8
    return {
        "estimated_yield_per_hectare": round(base, 2),
        "estimated_total_yield": round(base * d.farm_area, 2),
        "unit": "tons",
        "disclaimer": "Prototype estimate; validate with local historical yield data."
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)