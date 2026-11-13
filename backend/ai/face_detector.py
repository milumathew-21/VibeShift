"""
face_detector.py
================
Face detection module for VibeShift using OpenCV Haar Cascade classifier.

Author: Milu (Member 3 – AI Developer)
Module: backend.ai.face_detector
"""

import logging
import os
from pathlib import Path
from typing import Any, List, Optional, Tuple
import cv2
import numpy as np

logger = logging.getLogger(__name__)


class FaceDetector:
    """
    Detects human faces in images using OpenCV's Haar Feature-based Cascade Classifier.
    """

    def __init__(self, cascade_path: Optional[str] = None):
        """
        Initialize the FaceDetector.

        Searches candidate locations in order:
          1. User-supplied `cascade_path` (resolved to absolute path)
          2. Local module directory: `backend/ai/models/haarcascade_frontalface_default.xml`
          3. OpenCV library bundled data: `cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'`

        Args:
            cascade_path: Optional explicit path to a Haar cascade XML file.
        """
        self.classifier: Optional[Any] = None
        self._is_loaded: bool = False
        self._load_error: Optional[str] = None

        if not hasattr(cv2, "CascadeClassifier"):
            self._load_error = (
                "OpenCV build lacks cv2.CascadeClassifier support. "
                "Ensure an OpenCV version with objdetect (such as opencv-python 4.x) is used."
            )
            logger.error("FaceDetector initialization failed: %s", self._load_error)
            self.cascade_path: Optional[str] = None
            return

        resolved_path, candidates = self._resolve_cascade_path_candidates(cascade_path)
        self.cascade_path: Optional[str] = resolved_path

        if resolved_path is None or not os.path.isfile(resolved_path):
            self._load_error = f"Haar cascade XML file not found. Candidates checked: {candidates}"
            logger.error("FaceDetector initialization failed: %s", self._load_error)
            return

        try:
            classifier = cv2.CascadeClassifier(resolved_path)
            if not classifier.empty():
                self.classifier = classifier
                self._is_loaded = True
                logger.info("FaceDetector successfully loaded Haar Cascade classifier from: '%s'", resolved_path)
            else:
                self._load_error = f"CascadeClassifier failed to load from: '{resolved_path}' (classifier.empty() is True)"
                logger.error("FaceDetector initialization failed: %s", self._load_error)
        except Exception as e:
            self._load_error = f"CascadeClassifier error: {str(e)}"
            logger.exception("FaceDetector initialization raised an exception for path '%s':", resolved_path)

    @classmethod
    def _resolve_cascade_path_candidates(cls, explicit_path: Optional[str] = None) -> Tuple[Optional[str], List[str]]:
        """
        Resolves candidate paths for the Haar cascade XML to absolute, verified file paths.
        Returns a tuple of (resolved_path, candidate_paths_checked).
        """
        candidates: List[str] = []
        if explicit_path is not None:
            candidates.append(str(Path(explicit_path).resolve()))

        # Local model directory (always absolute relative to this module)
        module_dir = Path(__file__).resolve().parent
        local_model_path = (module_dir / "models" / "haarcascade_frontalface_default.xml").resolve()
        candidates.append(str(local_model_path))

        # OpenCV bundled data folder
        if hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
            cv_path = (Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml").resolve()
            candidates.append(str(cv_path))

        for path in candidates:
            if os.path.isfile(path):
                return path, candidates

        return None, candidates

    @classmethod
    def _resolve_cascade_path(cls, explicit_path: Optional[str] = None) -> Optional[str]:
        """
        Resolves candidate paths for the Haar cascade XML.
        Maintains backward compatibility with original method signature returning Optional[str].
        """
        path, _ = cls._resolve_cascade_path_candidates(explicit_path)
        return path

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
            logger.warning(
                "detect_faces() called but Haar Cascade classifier is not operational (error: %s)",
                self._load_error,
            )
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
            result = [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]
            logger.debug("Haar cascade detectMultiScale found %d face(s)", len(result))
            return result
        except Exception as e:
            logger.exception("Exception during detectMultiScale execution:")
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
