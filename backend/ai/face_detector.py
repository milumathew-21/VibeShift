"""
face_detector.py
================
Face detection module for VibeShift using OpenCV Haar Cascade classifier.

Author: Milu (Member 3 – AI Developer)
Module: backend.ai.face_detector
"""

import os
from pathlib import Path
from typing import Any, List, Optional, Tuple
import cv2
import numpy as np


class FaceDetector:
    """
    Detects human faces in images using OpenCV's Haar Feature-based Cascade Classifier.
    """

    def __init__(self, cascade_path: Optional[str] = None):
        """
        Initialize the FaceDetector.

        Searches candidate locations in order:
          1. User-supplied `cascade_path`
          2. Local module directory: `backend/ai/models/haarcascade_frontalface_default.xml`
          3. OpenCV library bundled data: `cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'`

        Args:
            cascade_path: Optional explicit path to a Haar cascade XML file.
        """
        resolved_path = self._resolve_cascade_path(cascade_path)
        self.cascade_path: Optional[str] = resolved_path
        self.classifier: Optional[Any] = None
        self._is_loaded: bool = False
        self._load_error: Optional[str] = None

        if not hasattr(cv2, "CascadeClassifier"):
            self._load_error = (
                "OpenCV build lacks cv2.CascadeClassifier support. "
                "Ensure an OpenCV version with objdetect (such as opencv-python 4.x) is used."
            )
        elif resolved_path is None or not os.path.isfile(resolved_path):
            self._load_error = "Haar cascade XML file not found."
        else:
            try:
                classifier = cv2.CascadeClassifier(resolved_path)
                if not classifier.empty():
                    self.classifier = classifier
                    self._is_loaded = True
                else:
                    self._load_error = f"CascadeClassifier failed to load from: '{resolved_path}'"
            except Exception as e:
                self._load_error = f"CascadeClassifier error: {str(e)}"

    @staticmethod
    def _resolve_cascade_path(explicit_path: Optional[str]) -> Optional[str]:
        """Resolves candidate paths for the Haar cascade XML."""
        candidates = []
        if explicit_path is not None:
            candidates.append(explicit_path)

        # Local model directory
        module_dir = Path(__file__).resolve().parent
        local_model_path = module_dir / "models" / "haarcascade_frontalface_default.xml"
        candidates.append(str(local_model_path))

        # OpenCV data folder
        if hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
            cv_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
            candidates.append(cv_path)

        for path in candidates:
            if os.path.isfile(path):
                return path

        return None

    @property
    def is_loaded(self) -> bool:
        """Indicates whether the Haar cascade classifier is loaded and operational."""
        return self._is_loaded

    @property
    def is_available(self) -> bool:
        """Alias for is_loaded, indicating if face detection can proceed."""
        return self._is_loaded

    @property
    def load_error(self) -> Optional[str]:
        """Returns the specific reason why the detector is unavailable, if any."""
        return self._load_error

    def detect_faces(
        self,
        image: np.ndarray,
        scale_factor: float = 1.1,
        min_neighbors: int = 4,
        min_size: Tuple[int, int] = (30, 30),
    ) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in a given BGR or grayscale image.

        Args:
            image: Input image as a NumPy array (BGR or Grayscale).
            scale_factor: Parameter specifying how much the image size is reduced at each scale.
            min_neighbors: Number of neighbors each candidate rectangle should have to retain it.
            min_size: Minimum possible face rectangle size (width, height) in pixels.

        Returns:
            List of bounding boxes in (x, y, w, h) format. Returns empty list if
            detector is unavailable, image is invalid, or no faces are found.
        """
        if not self._is_loaded or self.classifier is None:
            return []

        if image is None or not isinstance(image, np.ndarray) or image.size == 0:
            return []

        # Convert to grayscale if image has 3 color channels (BGR)
        if len(image.shape) == 3 and image.shape[2] == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        elif len(image.shape) == 2:
            gray = image
        else:
            return []

        # Equalize histogram to improve contrast in varied lighting conditions
        gray_equalized = cv2.equalizeHist(gray)

        try:
            faces = self.classifier.detectMultiScale(
                gray_equalized,
                scaleFactor=scale_factor,
                minNeighbors=min_neighbors,
                minSize=min_size,
                flags=cv2.CASCADE_SCALE_IMAGE,
            )
            return [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]
        except Exception:
            return []

    def get_primary_face(
        self,
        faces: List[Tuple[int, int, int, int]],
    ) -> Optional[Tuple[int, int, int, int]]:
        """
        Selects the primary face from a list of detected faces.
        Uses the largest bounding box area (w * h) as the primary user face.

        Args:
            faces: List of bounding boxes [(x, y, w, h), ...].

        Returns:
            The primary bounding box (x, y, w, h) or None if the list is empty.
        """
        if not faces:
            return None

        return max(faces, key=lambda f: f[2] * f[3])
