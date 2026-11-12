"""
VibeShift - Emotion Analysis Service
Processes uploaded images for facial expression emotion estimation.
Connects to backend/ai/emotion_model.py if present, or falls back to a clearly marked temporary stub.
"""

from typing import Dict, Any

# Standard disclaimer: Camera emotion detection is approximate and makes no medical claims
EMOTION_ESTIMATE_NOTE = (
    "This is only an estimate of facial expression, not proof of feelings. "
    "Camera emotion estimation is optional and provides visual cues only, with no medical or diagnostic claims."
)

# Allowed image MIME types and file extensions for validation
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def get_emotion_predictor():
    """
    Attempts to dynamically import predict_emotion from backend/ai/emotion_model.py.
    If the file does not exist yet (teammate's deliverable), returns a
    clearly marked TEMPORARY STUB returning neutral emotion safely.
    """
    try:
        from ai.emotion_model import predict_emotion
        return predict_emotion
    except (ImportError, ModuleNotFoundError):
        # ====================================================================
        # TEMPORARY STUB:
        # Used until teammate delivers backend/ai/emotion_model.py.
        # Safely returns a default neutral estimate without crashing.
        # ====================================================================
        def temporary_stub(image_bytes: bytes) -> Dict[str, Any]:
            return {"emotion": "neutral", "confidence": 0.0}

        return temporary_stub


def analyze_image_emotion(image_bytes: bytes) -> Dict[str, Any]:
    """
    Safely analyzes image bytes using the emotion predictor.
    The image is processed strictly in-memory and NEVER saved to disk.
    """
    predictor = get_emotion_predictor()

    try:
        raw_result = predictor(image_bytes)
        if not isinstance(raw_result, dict):
            raw_result = {"emotion": "neutral", "confidence": 0.0}

        emotion = str(raw_result.get("emotion", "neutral")).lower()
        confidence = float(raw_result.get("confidence", 0.0))
    except Exception as exc:
        # Safely handle any AI execution errors and provide a fallback
        print(f"[EmotionService] Error in predictor execution: {exc}")
        emotion = "neutral"
        confidence = 0.0

    return {
        "emotion": emotion,
        "confidence": round(confidence, 2),
        "note": EMOTION_ESTIMATE_NOTE,
    }

