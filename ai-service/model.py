import io
import json
import os
from typing import List, Tuple

import numpy as np
from PIL import Image

MODEL = None
CLASSES: List[str] = []
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "agrovision_model.keras")
CLASSES_PATH = os.path.join(os.path.dirname(__file__), "models", "classes.txt")


def _split_label(label: str) -> Tuple[str, str]:
    if "___" in label:
        crop, disease = label.split("___", 1)
        return crop.replace("_", " ").strip(), disease.replace("_", " ").strip()
    return "Unknown", label.replace("_", " ").strip()


def _load_class_names() -> List[str]:
    if not os.path.exists(CLASSES_PATH):
        return []
    with open(CLASSES_PATH, "r", encoding="utf-8") as handle:
        return [line.strip() for line in handle if line.strip()]


def _treatment_for(label: str) -> str:
    lower = label.lower()
    if "early blight" in lower or "late blight" in lower:
        return "Remove infected leaves, improve airflow, and apply a crop-appropriate fungicide according to local agronomy guidance."
    if "rust" in lower:
        return "Prune infected tissue, avoid overhead irrigation, and use a registered fungicide when disease pressure is high."
    if "scab" in lower:
        return "Remove fallen debris and apply preventive fungicide during wet weather periods."
    if "mildew" in lower:
        return "Improve spacing for airflow, reduce humidity around the canopy, and apply a mildew-control spray if symptoms worsen."
    if "healthy" in lower:
        return "No disease symptoms identified. Maintain regular monitoring and standard crop management."
    return "Confirm the diagnosis with a local agronomist and follow crop-specific disease management guidance."


def _prevention_for(label: str) -> str:
    lower = label.lower()
    if "healthy" in lower:
        return "Keep routine crop monitoring, balanced nutrition, and field sanitation practices in place."
    if "blight" in lower or "rust" in lower or "scab" in lower:
        return "Improve sanitation, rotate crops where possible, and limit excess moisture on leaves."
    if "mildew" in lower:
        return "Ensure spacing, avoid dense canopy layers, and reduce periods of leaf wetness."
    return "Use disease-resistant varieties, field sanitation, and careful irrigation scheduling to reduce risk."


def _symptoms_for(label: str) -> str:
    lower = label.lower()
    if "early blight" in lower:
        return "Dark target-like spots on older leaves, yellowing, and progressive leaf drop."
    if "late blight" in lower:
        return "Water-soaked dark lesions on leaves or stems that can expand quickly in cool, wet conditions."
    if "rust" in lower:
        return "Orange, brown, or rust-colored pustules or spots on leaf surfaces."
    if "mildew" in lower:
        return "White or gray powdery growth with leaf distortion or yellowing."
    if "healthy" in lower:
        return "No disease pattern was identified by the model. Continue routine scouting."
    return "The model did not provide a disease-specific symptom description. Confirm symptoms in the field."


def _cause_for(label: str) -> str:
    lower = label.lower()
    if "fungal" in lower or any(term in lower for term in ("blight", "rust", "scab", "mildew")):
        return "Likely associated with a plant pathogen and favorable moisture or humidity; field confirmation is required."
    if "healthy" in lower:
        return "No disease cause was indicated by the model."
    return "The cause cannot be confirmed from the image alone. Consider pathogens, pests, nutrition, and environmental stress."


def load_model():
    global MODEL, CLASSES
    if MODEL is not None and CLASSES:
        return True
    if not os.path.exists(MODEL_PATH):
        return False

    try:
        import tensorflow as tf
    except Exception as exc:  # pragma: no cover - runtime dependency may be absent
        print(f"TensorFlow unavailable: {exc}")
        return False

    try:
        MODEL = tf.keras.models.load_model(MODEL_PATH)
        CLASSES = _load_class_names()
        return True
    except Exception as exc:  # pragma: no cover - model file may be invalid or missing
        print(f"Unable to load disease model: {exc}")
        MODEL = None
        CLASSES = []
        return False


def predict_image(image_bytes: bytes):
    if MODEL is None:
        if not load_model():
            return {"success": False, "error": "AI model is not trained yet"}

    try:
        import tensorflow as tf
    except Exception as exc:
        return {"success": False, "error": f"TensorFlow is not available: {exc}"}

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
    except Exception:
        return {"success": False, "error": "Invalid image file. Please upload a readable JPG, PNG, or WEBP image."}

    if not CLASSES:
        return {"success": False, "error": "AI model is not trained yet"}

    image_array = np.asarray(image, dtype=np.float32)
    image_batch = np.expand_dims(image_array, axis=0)
    image_batch = tf.keras.applications.mobilenet_v2.preprocess_input(image_batch)

    probabilities = MODEL.predict(image_batch, verbose=0)[0]
    index = int(np.argmax(probabilities))
    label = CLASSES[index] if index < len(CLASSES) else "Unknown"
    crop_name, disease_name = _split_label(label)
    confidence = float(probabilities[index])

    status = "healthy" if "healthy" in disease_name.lower() else "disease"
    if confidence < 0.5:
        return {
            "success": True,
            "prediction": {
                "crop": crop_name if crop_name != "Unknown" else "Plant",
                "disease": "Unclear",
                "confidence": round(confidence * 100, 2),
                "is_healthy": False,
                "treatment": "Unable to confidently identify the condition. Please upload a clearer image of the affected plant.",
                "prevention": "Use a clear image with visible symptoms and avoid relying on uncertain classifications.",
                "symptoms": "Insufficient visual evidence for a reliable symptom description.",
                "causes": "Unknown. Image-only screening cannot establish a cause at this confidence level.",
                "next_actions": "Retake a well-lit close image showing the whole plant and affected areas; consult an agronomist before treatment.",
                "chemical_safety": "Do not apply pesticide based on this uncertain result. Follow local agricultural guidance and product labels.",
                "message": "Unable to confidently identify the condition. Please upload a clearer image.",
            },
            "status": "low_confidence",
        }

    return {
        "success": True,
        "prediction": {
            "crop": crop_name,
            "disease": disease_name,
            "confidence": round(confidence * 100, 2),
            "is_healthy": status == "healthy",
            "treatment": _treatment_for(disease_name),
            "prevention": _prevention_for(disease_name),
            "symptoms": _symptoms_for(disease_name),
            "causes": _cause_for(disease_name),
            "next_actions": "Isolate or mark affected plants, inspect nearby plants, document progression, and confirm the result locally before applying any chemical.",
            "chemical_safety": "If a registered chemical is recommended locally, use only the label-listed active ingredient and rate for this crop and disease. Wear required protective equipment, observe re-entry and pre-harvest intervals, and never assume a product is universally safe.",
            "message": "Screening result only; validate treatment decisions with a local agronomist."
        },
        "status": status,
    }