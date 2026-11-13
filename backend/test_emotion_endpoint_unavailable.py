# test_emotion_endpoint_unavailable.py
# Calls the real /api/emotion endpoint with a broken face detector.
# Milu's files are NOT changed. We only swap the detector during this test.

from unittest.mock import patch

import cv2
import numpy as np
from fastapi.testclient import TestClient

from backend.main import app


class BrokenDetector:
    """Pretends the face detector failed to load."""
    is_available = False
    load_error = "fake error for testing"
    cascade_path = None


# Make a small black picture and turn it into PNG bytes
image = np.zeros((200, 200, 3), dtype=np.uint8)
ok, png = cv2.imencode(".png", image)

client = TestClient(app)

with patch("backend.ai.emotion_model.get_default_detector",
           return_value=BrokenDetector()):
    response = client.post(
        "/api/emotion",
        files={"file": ("test.png", png.tobytes(), "image/png")},
    )

data = response.json()
print("HTTP code:", response.status_code)
print("Response:", data)
print()
print("1. emotion is null:", data.get("emotion") is None)
print("2. confidence is null:", data.get("confidence") is None)
print("3. status is face_detector_unavailable:",
      data.get("status") == "face_detector_unavailable")
print("4. note asks for manual choice:",
      "manual" in str(data.get("note", "")).lower())