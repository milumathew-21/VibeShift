"""
backend.ai
==========
VibeShift Facial-Expression Estimation Module.

Author: Milu (Member 3 – AI Developer)

This package provides face detection (OpenCV Haar Cascade), image preprocessing,
and PyTorch-based facial expression estimation interfaces (MobileNetV3 and EmotiEffLib EfficientNet-B2).

Public API:
  - FaceDetector: OpenCV Haar Cascade face detector
  - decode_image: Multi-format image decoder (bytes, base64, ndarray, filepath)
  - crop_face: Bounding-box face cropper with margin clamping
  - preprocess_face_for_mobilenet: PyTorch tensor normalization (1, 3, 224, 224)
  - preprocess_face_for_emotieff: PyTorch tensor normalization (1, 3, 260, 260)
  - preprocess_face_for_minixception: PyTorch tensor normalization (1, 1, 48, 48)
  - EmotionModelInterface: PyTorch MobileNetV3 model management and weight loader
  - EmotiEffAdapter: PyTorch EmotiEffLib EfficientNet-B2 adapter with AffectNet-7 remapping
  - predict: Unified prediction function for FastAPI backend integration
  - EXPRESSION_LABELS: Canonical tuple of 7 expression categories
  - DISCLAIMER_TEXT: Mandatory ethical disclaimer for all prediction outputs
"""

from backend.ai.emotion_model import (
    DISCLAIMER_TEXT,
    EXPRESSION_LABELS,
    EmotiEffAdapter,
    EmotionModelInterface,
    create_mobilenet_v3_small_fer,
    get_default_detector,
    get_default_model,
    predict,
)
from backend.ai.face_detector import FaceDetector
from backend.ai.preprocess import (
    crop_face,
    decode_image,
    preprocess_face_for_emotieff,
    preprocess_face_for_minixception,
    preprocess_face_for_mobilenet,
)

__all__ = [
    "FaceDetector",
    "decode_image",
    "crop_face",
    "preprocess_face_for_mobilenet",
    "preprocess_face_for_emotieff",
    "preprocess_face_for_minixception",
    "EmotionModelInterface",
    "EmotiEffAdapter",
    "create_mobilenet_v3_small_fer",
    "get_default_detector",
    "get_default_model",
    "predict",
    "EXPRESSION_LABELS",
    "DISCLAIMER_TEXT",
]
