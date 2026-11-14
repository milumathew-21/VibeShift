# test_detector_unavailable.py
# Checks that predict() returns "face_detector_unavailable" when the
# face detector cannot work. Does NOT touch Milu's real files.

import numpy as np
from backend.ai import predict
from backend.ai.face_detector import FaceDetector

# A plain black picture (no face needed, the detector check comes first)
image = np.zeros((200, 200, 3), dtype=np.uint8)

# Test A: Milu's way, a detector with a path that does not exist
detector_a = FaceDetector(cascade_path="nonexistent_test_cascade.xml")
print("A: detector available?", detector_a.is_available)
result_a = predict(image, detector=detector_a)
print("A: status =", result_a["status"])


# Test B: a fake detector that is always unavailable
class BrokenDetector:
    is_available = False
    load_error = "fake error for testing"
    cascade_path = None


result_b = predict(image, detector=BrokenDetector())
print("B: status =", result_b["status"])