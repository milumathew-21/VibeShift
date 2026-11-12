"""
emotion_model.py
================
PyTorch model architecture definition, weight loading interface, and prediction pipeline.

Author: Milu (Member 3 – AI Developer)
Module: backend.ai.emotion_model

IMPORTANT NOTICE:
In adherence to VibeShift AI engineering principles:
1. Facial-expression predictions are estimates based on visual appearance,
   not direct measurements of a person's actual emotional state.
2. Untrained models MUST NOT produce pseudo-predictions. Inference is strictly
   blocked until verified, evaluated pretrained weights are explicitly loaded.
"""

import os
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models

from backend.ai.face_detector import FaceDetector
from backend.ai.preprocess import (
    crop_face,
    decode_image,
    preprocess_face_for_emotieff,
    preprocess_face_for_mobilenet,
)

# Canonical 7 facial expression classes
EXPRESSION_LABELS: Tuple[str, ...] = (
    "angry",
    "disgust",
    "fear",
    "happy",
    "sad",
    "surprise",
    "neutral",
)

NUM_CLASSES: int = len(EXPRESSION_LABELS)

# Ethical & scientific disclaimer
DISCLAIMER_TEXT: str = (
    "Facial-expression predictions are estimates based on visual features and "
    "do not represent a person's actual emotional state."
)

DEFAULT_CONFIDENCE_THRESHOLD: float = 0.40

# Official AffectNet-7 index to VibeShift canonical label mapping
# AffectNet-7 order: 0: Anger, 1: Disgust, 2: Fear, 3: Happiness, 4: Neutral, 5: Sadness, 6: Surprise
AFFECTNET_TO_VIBESHIFT_INDICES: Dict[int, str] = {
    0: "angry",
    1: "disgust",
    2: "fear",
    3: "happy",
    4: "neutral",
    5: "sad",
    6: "surprise",
}


def create_mobilenet_v3_small_fer(num_classes: int = NUM_CLASSES) -> nn.Module:
    """
    Constructs a MobileNetV3-Small architecture adapted for 7-class facial expression recognition.

    Args:
        num_classes: Number of expression classes (default 7).

    Returns:
        A PyTorch nn.Module instance with a customized classification head.
    """
    model = models.mobilenet_v3_small(weights=None)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)
    return model


class EmotionModelInterface:
    """
    Interface for managing MobileNetV3 PyTorch emotion estimation model lifecycle,
    including weight verification, CPU execution, and inference.
    """

    def __init__(
        self,
        weights_path: Optional[str] = None,
        device: str = "cpu",
        confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
    ):
        self.device = torch.device(device)
        self.confidence_threshold = confidence_threshold
        self.model = create_mobilenet_v3_small_fer(num_classes=NUM_CLASSES)
        self.model.to(self.device)
        self.model.eval()

        self._weights_loaded: bool = False
        self._weights_path: Optional[str] = None

        if weights_path is not None:
            self.load_weights(weights_path)

    @property
    def is_weights_loaded(self) -> bool:
        """Indicates whether verified model weights have been loaded."""
        return self._weights_loaded

    @property
    def weights_path(self) -> Optional[str]:
        """Path to loaded weights, if any."""
        return self._weights_path

    def load_weights(self, weights_path: str) -> bool:
        """
        Loads verified model weights from disk.
        Uses weights_only=True with torch.load to prevent arbitrary code execution vulnerabilities.
        """
        if not os.path.isfile(weights_path):
            self._weights_loaded = False
            self._weights_path = None
            return False

        try:
            state_dict = torch.load(
                weights_path,
                map_location=self.device,
                weights_only=True,
            )

            if isinstance(state_dict, dict):
                if "state_dict" in state_dict:
                    state_dict = state_dict["state_dict"]
                elif "model_state_dict" in state_dict:
                    state_dict = state_dict["model_state_dict"]

            self.model.load_state_dict(state_dict, strict=True)
            self.model.eval()
            self._weights_loaded = True
            self._weights_path = weights_path
            return True
        except Exception:
            self._weights_loaded = False
            self._weights_path = None
            return False

    def predict_tensor(
        self,
        tensor: torch.Tensor,
    ) -> Tuple[Optional[str], Optional[float], Optional[Dict[str, float]], str]:
        """
        Runs model inference on a preprocessed PyTorch image tensor.
        Refuses to generate predictions if verified weights are not loaded.
        """
        if not self._weights_loaded:
            return (
                None,
                None,
                None,
                "model_weights_not_loaded: Verified pretrained weights have not yet been provided. "
                "Inference blocked to avoid unvalidated output.",
            )

        if tensor is None or not isinstance(tensor, torch.Tensor):
            return None, None, None, "invalid_tensor"

        try:
            with torch.no_grad():
                tensor = tensor.to(self.device)
                logits = self.model(tensor)
                probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

            scores = {label: float(probs[i]) for i, label in enumerate(EXPRESSION_LABELS)}
            top_idx = int(np.argmax(probs))
            top_label = EXPRESSION_LABELS[top_idx]
            top_confidence = float(probs[top_idx])

            if top_confidence < self.confidence_threshold:
                status = "low_confidence"
            else:
                status = "success"

            return top_label, round(top_confidence, 4), {k: round(v, 4) for k, v in scores.items()}, status
        except Exception as e:
            return None, None, None, f"inference_error: {str(e)}"


class EmotiEffAdapter:
    """
    Adapter for EmotiEffLib (EfficientNet-B2) pretrained on AffectNet-7 (enet_b2_7).
    Converts AffectNet-7 logit outputs to VibeShift canonical expression scores.
    """

    def __init__(
        self,
        weights_path: Optional[str] = None,
        device: str = "cpu",
        confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
    ):
        self.device = torch.device(device)
        self.confidence_threshold = confidence_threshold
        self._weights_loaded: bool = False
        self._weights_path: Optional[str] = None
        self.model = None

        if weights_path is not None:
            self.load_weights(weights_path)

    @property
    def is_weights_loaded(self) -> bool:
        return self._weights_loaded

    @property
    def weights_path(self) -> Optional[str]:
        return self._weights_path

    def load_weights(self, weights_path: str) -> bool:
        """
        Loads verified EmotiEffLib EfficientNet-B2 weights from disk.
        Supports both pure state dictionaries and safe unpickling of full model checkpoints.
        """
        if not os.path.isfile(weights_path):
            self._weights_loaded = False
            self._weights_path = None
            return False

        try:
            import timm
            model = timm.create_model("tf_efficientnet_b2", pretrained=False, num_classes=7)

            # Attempt 1: Safe weights_only load (pure state dict)
            state_dict = None
            try:
                loaded = torch.load(weights_path, map_location=self.device, weights_only=True)
                if isinstance(loaded, dict):
                    state_dict = loaded.get("state_dict", loaded)
            except Exception:
                # Attempt 2: Safe globals load for pickled EfficientNet object
                with torch.serialization.safe_globals([timm.models.efficientnet.EfficientNet]):
                    loaded = torch.load(weights_path, map_location=self.device, weights_only=False)
                    if hasattr(loaded, "state_dict"):
                        state_dict = loaded.state_dict()
                    elif isinstance(loaded, dict):
                        state_dict = loaded.get("state_dict", loaded)

            if state_dict is None or not isinstance(state_dict, dict):
                self._weights_loaded = False
                return False

            model.load_state_dict(state_dict, strict=True)
            model.to(self.device)
            model.eval()

            self.model = model
            self._weights_loaded = True
            self._weights_path = weights_path
            return True
        except Exception:
            self._weights_loaded = False
            self._weights_path = None
            return False

    def predict_tensor(
        self,
        tensor: torch.Tensor,
    ) -> Tuple[Optional[str], Optional[float], Optional[Dict[str, float]], str]:
        """
        Runs model inference on a preprocessed PyTorch image tensor (260x260x3).
        Re-maps AffectNet-7 logit order to VibeShift canonical expressions.
        """
        if not self._weights_loaded or self.model is None:
            return (
                None,
                None,
                None,
                "model_weights_not_loaded: Verified pretrained weights have not yet been provided. "
                "Inference blocked to avoid unvalidated output.",
            )

        if tensor is None or not isinstance(tensor, torch.Tensor):
            return None, None, None, "invalid_tensor"

        try:
            with torch.no_grad():
                tensor = tensor.to(self.device)
                logits = self.model(tensor)
                probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

            # Re-map AffectNet-7 probabilities to VibeShift labels
            scores = {label: 0.0 for label in EXPRESSION_LABELS}
            for affectnet_idx, vibeshift_label in AFFECTNET_TO_VIBESHIFT_INDICES.items():
                scores[vibeshift_label] = float(probs[affectnet_idx])

            # Determine dominant expression from mapped scores
            dominant_label = max(scores, key=scores.get)
            top_confidence = scores[dominant_label]

            if top_confidence < self.confidence_threshold:
                status = "low_confidence"
            else:
                status = "success"

            return dominant_label, round(top_confidence, 4), {k: round(v, 4) for k, v in scores.items()}, status
        except Exception as e:
            return None, None, None, f"inference_error: {str(e)}"


# Singleton/cached instances for lightweight reuse in FastAPI
_DEFAULT_DETECTOR: Optional[FaceDetector] = None
_DEFAULT_MODEL: Optional[Union[EmotionModelInterface, EmotiEffAdapter]] = None


def get_default_detector() -> FaceDetector:
    """Returns or lazily creates a shared FaceDetector instance."""
    global _DEFAULT_DETECTOR
    if _DEFAULT_DETECTOR is None:
        _DEFAULT_DETECTOR = FaceDetector()
    return _DEFAULT_DETECTOR


def get_default_model(weights_path: Optional[str] = None) -> Union[EmotionModelInterface, EmotiEffAdapter]:
    """
    Returns or lazily creates a shared model instance.
    Automatically detects and loads EmotiEffLib checkpoints (enet_b2_7) if present.
    """
    global _DEFAULT_MODEL
    if weights_path is not None:
        if "enet_b2" in os.path.basename(weights_path).lower():
            _DEFAULT_MODEL = EmotiEffAdapter(weights_path=weights_path)
        else:
            _DEFAULT_MODEL = EmotionModelInterface(weights_path=weights_path)
        return _DEFAULT_MODEL

    if _DEFAULT_MODEL is None:
        module_dir = Path(__file__).resolve().parent
        candidate_state_dict = module_dir / "models" / "enet_b2_7_state_dict.pt"
        candidate_pt = module_dir / "models" / "enet_b2_7.pt"

        if candidate_state_dict.is_file():
            adapter = EmotiEffAdapter(weights_path=str(candidate_state_dict))
            if adapter.is_weights_loaded:
                _DEFAULT_MODEL = adapter
                return _DEFAULT_MODEL

        if candidate_pt.is_file():
            adapter = EmotiEffAdapter(weights_path=str(candidate_pt))
            if adapter.is_weights_loaded:
                _DEFAULT_MODEL = adapter
                return _DEFAULT_MODEL

        # Fall back to base MobileNetV3 interface (weights pending)
        _DEFAULT_MODEL = EmotionModelInterface()

    return _DEFAULT_MODEL


def predict(
    image_input: Union[bytes, bytearray, str, np.ndarray],
    detector: Optional[FaceDetector] = None,
    model: Optional[Union[EmotionModelInterface, EmotiEffAdapter]] = None,
) -> Dict[str, Any]:
    """
    High-level end-to-end facial expression estimation function.
    Designed for clean, direct integration with Nethra's FastAPI backend endpoints.

    Contract:
      Always returns a dictionary with the consistent keys:
        - face_detected (bool)
        - expression (Optional[str])
        - confidence (Optional[float])
        - status (str)
        - disclaimer (str)
      Plus optional diagnostics:
        - bbox (Optional[List[int]])
        - expression_scores (Optional[Dict[str, float]])
        - latency_ms (float)

    Possible status values:
      - 'invalid_image': Input could not be decoded or was malformed.
      - 'face_detector_unavailable': Haar cascade XML or detector classifier is missing/unsupported.
      - 'no_face_detected': Detector is operational, but no human face was found in the image.
      - 'preprocessing_failed': Face bounding box could not be cropped or converted to tensor.
      - 'model_weights_not_loaded': Verified weights are pending; inference safely blocked.
      - 'low_confidence': Prediction confidence is below confidence_threshold.
      - 'success': Normal decisive prediction with verified weights.

    Args:
        image_input: Raw image bytes, base64 string, filepath, or NumPy array.
        detector: Optional FaceDetector instance (defaults to shared instance).
        model: Optional EmotionModelInterface/EmotiEffAdapter instance (defaults to shared instance).

    Returns:
        Structured prediction dictionary.
    """
    start_time = time.perf_counter()

    # Step 1: Decode image
    image = decode_image(image_input)
    if image is None:
        latency = (time.perf_counter() - start_time) * 1000.0
        return {
            "face_detected": False,
            "expression": None,
            "confidence": None,
            "status": "invalid_image",
            "disclaimer": DISCLAIMER_TEXT,
            "bbox": None,
            "expression_scores": None,
            "latency_ms": round(latency, 2),
        }

    # Step 2: Initialize / check face detector
    if detector is None:
        detector = get_default_detector()

    if not detector.is_available:
        latency = (time.perf_counter() - start_time) * 1000.0
        return {
            "face_detected": False,
            "expression": None,
            "confidence": None,
            "status": "face_detector_unavailable",
            "disclaimer": DISCLAIMER_TEXT,
            "bbox": None,
            "expression_scores": None,
            "latency_ms": round(latency, 2),
        }

    # Step 3: Detect face
    faces = detector.detect_faces(image)
    primary_face = detector.get_primary_face(faces)

    if primary_face is None:
        latency = (time.perf_counter() - start_time) * 1000.0
        return {
            "face_detected": False,
            "expression": None,
            "confidence": None,
            "status": "no_face_detected",
            "disclaimer": DISCLAIMER_TEXT,
            "bbox": None,
            "expression_scores": None,
            "latency_ms": round(latency, 2),
        }

    # Step 4: Crop face
    face_crop = crop_face(image, primary_face)
    if face_crop is None:
        latency = (time.perf_counter() - start_time) * 1000.0
        return {
            "face_detected": True,
            "expression": None,
            "confidence": None,
            "status": "preprocessing_failed",
            "disclaimer": DISCLAIMER_TEXT,
            "bbox": list(primary_face),
            "expression_scores": None,
            "latency_ms": round(latency, 2),
        }

    # Step 5: Resolve model & preprocess tensor
    if model is None:
        model = get_default_model()

    if isinstance(model, EmotiEffAdapter):
        tensor = preprocess_face_for_emotieff(face_crop)
    else:
        tensor = preprocess_face_for_mobilenet(face_crop)

    if tensor is None:
        latency = (time.perf_counter() - start_time) * 1000.0
        return {
            "face_detected": True,
            "expression": None,
            "confidence": None,
            "status": "preprocessing_failed",
            "disclaimer": DISCLAIMER_TEXT,
            "bbox": list(primary_face),
            "expression_scores": None,
            "latency_ms": round(latency, 2),
        }

    # Step 6: Run inference
    expression, confidence, scores, status = model.predict_tensor(tensor)
    latency = (time.perf_counter() - start_time) * 1000.0

    return {
        "face_detected": True,
        "expression": expression,
        "confidence": confidence,
        "status": status,
        "disclaimer": DISCLAIMER_TEXT,
        "bbox": list(primary_face),
        "expression_scores": scores,
        "latency_ms": round(latency, 2),
    }
