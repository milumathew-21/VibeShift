"""
backend/ai/test_ai_module.py
============================
Standalone test verification suite for VibeShift AI Module.

Author: Milu (Member 3 – AI Developer)

Validates:
1. Face detection on synthetic face canvas.
2. Prediction output schema and data types.
3. Pretrained EmotiEffLib EfficientNet-B2 checkpoint inference and AffectNet-7 label remapping.
4. Input format decodings: ndarray, JPEG bytes, base64 data URI, file path.
5. Error handling: corrupt bytes, blank frame (no face).
6. Latency benchmarks (cold run vs warm runs).
7. FastAPI contract compliance.

Usage:
    python -m backend.ai.test_ai_module
"""

import base64
import json
import os
import sys
import tempfile
import time
from pathlib import Path

# Ensure repository root is in sys.path
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

import cv2
import numpy as np

import backend.ai as ai


def create_synthetic_face() -> np.ndarray:
    """Creates a synthetic face image that triggers OpenCV Haar Cascade."""
    canvas = np.full((400, 400, 3), 220, dtype=np.uint8)
    # Head oval
    cv2.ellipse(canvas, (200, 200), (90, 120), 0, 0, 360, (180, 150, 130), -1)
    # Eyes (darker areas)
    cv2.ellipse(canvas, (165, 170), (18, 10), 0, 0, 360, (50, 40, 30), -1)
    cv2.ellipse(canvas, (235, 170), (18, 10), 0, 0, 360, (50, 40, 30), -1)
    # Eyebrows
    cv2.ellipse(canvas, (165, 150), (25, 5), 0, 0, 360, (40, 30, 20), -1)
    cv2.ellipse(canvas, (235, 150), (25, 5), 0, 0, 360, (40, 30, 20), -1)
    # Nose line & nostril shadow
    cv2.line(canvas, (200, 175), (200, 220), (140, 110, 90), 3)
    cv2.ellipse(canvas, (200, 225), (15, 6), 0, 0, 360, (140, 110, 90), -1)
    # Mouth
    cv2.ellipse(canvas, (200, 260), (35, 12), 0, 0, 360, (70, 50, 150), -1)
    return canvas


def run_tests() -> bool:
    print("=" * 65)
    print("VIBESHIFT AI MODULE INFERENCE & INTEGRATION TEST SUITE")
    print("=" * 65)

    # 1. Detector Verification
    detector = ai.get_default_detector()
    print(f"[1] FaceDetector: is_loaded={detector.is_loaded}")
    print(f"    cascade_path={detector.cascade_path}")
    assert detector.is_loaded, f"Detector failed to load: {detector.load_error}"

    # 2. Model Verification
    model = ai.get_default_model()
    print(f"[2] Emotion Model: type={type(model).__name__}, is_weights_loaded={model.is_weights_loaded}")
    print(f"    weights_path={model.weights_path}")
    assert model.is_weights_loaded, "Model weights not loaded!"

    # 3. Face Detection on Synthetic Face
    face_img = create_synthetic_face()
    faces = detector.detect_faces(face_img)
    primary_bbox = detector.get_primary_face(faces)
    print(f"[3] Face Detection: detected {len(faces)} face(s), primary bbox={primary_bbox}")
    assert primary_bbox is not None, "Face detection failed on synthetic face!"

    # 4. End-to-End Prediction on ndarray
    print("\n[4] Running predict(ndarray)...")
    res_ndarray = ai.predict(face_img)
    print("    Result:")
    for k, v in res_ndarray.items():
        print(f"      {k}: {v}")
    assert res_ndarray["face_detected"] is True
    assert res_ndarray["expression"] in ai.EXPRESSION_LABELS
    assert isinstance(res_ndarray["confidence"], float)
    assert res_ndarray["status"] in ("success", "low_confidence")
    assert res_ndarray["disclaimer"] == ai.DISCLAIMER_TEXT
    assert res_ndarray["bbox"] == list(primary_bbox)
    assert set(res_ndarray["expression_scores"].keys()) == set(ai.EXPRESSION_LABELS)
    total_score = sum(res_ndarray["expression_scores"].values())
    print(f"    Sum of expression_scores: {total_score:.4f} (expected ~1.000)")
    assert abs(total_score - 1.0) < 0.05

    # 5. End-to-End Prediction on Raw JPEG Bytes
    print("\n[5] Running predict(bytes)...")
    success, jpeg_buf = cv2.imencode(".jpg", face_img)
    assert success
    jpeg_bytes = jpeg_buf.tobytes()
    res_bytes = ai.predict(jpeg_bytes)
    print(f"    Status: {res_bytes['status']}, Expression: {res_bytes['expression']}, Conf: {res_bytes['confidence']}")
    assert res_bytes["face_detected"] is True
    assert res_bytes["expression"] == res_ndarray["expression"]

    # 6. End-to-End Prediction on Base64 Data URI
    print("\n[6] Running predict(base64 data URI)...")
    b64_str = "data:image/jpeg;base64," + base64.b64encode(jpeg_bytes).decode("ascii")
    res_b64 = ai.predict(b64_str)
    print(f"    Status: {res_b64['status']}, Expression: {res_b64['expression']}, Conf: {res_b64['confidence']}")
    assert res_b64["face_detected"] is True

    # 7. End-to-End Prediction on File Path
    print("\n[7] Running predict(filepath)...")
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
        tmp_path = tmp_file.name
    try:
        cv2.imwrite(tmp_path, face_img)
        res_file = ai.predict(tmp_path)
        print(f"    Status: {res_file['status']}, Expression: {res_file['expression']}, Conf: {res_file['confidence']}")
        assert res_file["face_detected"] is True
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    # 8. Error Handling Edge Cases
    print("\n[8] Testing Error Handling:")
    # Case A: Corrupt bytes
    res_corrupt = ai.predict(b"this is corrupt non-image bytes")
    print(f"    A. Corrupt bytes -> status: '{res_corrupt['status']}', face_detected: {res_corrupt['face_detected']}")
    assert res_corrupt["status"] == "invalid_image"
    assert res_corrupt["face_detected"] is False

    # Case B: Blank frame (no face)
    blank_canvas = np.zeros((400, 400, 3), dtype=np.uint8)
    res_blank = ai.predict(blank_canvas)
    print(f"    B. Blank frame -> status: '{res_blank['status']}', face_detected: {res_blank['face_detected']}")
    assert res_blank["status"] == "no_face_detected"
    assert res_blank["face_detected"] is False

    # 9. Latency Benchmark
    print("\n[9] Latency Benchmark (10 iterations on CPU):")
    latencies = []
    for _ in range(10):
        t0 = time.perf_counter()
        _ = ai.predict(face_img)
        dt = (time.perf_counter() - t0) * 1000.0
        latencies.append(dt)
    print(f"    Cold latency: {latencies[0]:.2f} ms")
    print(f"    Warm avg (runs 2-10): {np.mean(latencies[1:]):.2f} ms (min: {np.min(latencies[1:]):.2f} ms, max: {np.max(latencies[1:]):.2f} ms)")

    # 10. FastAPI Integration JSON Schema Validation
    print("\n[10] FastAPI Integration JSON Schema Validation:")
    expected_keys = {
        "face_detected",
        "expression",
        "confidence",
        "status",
        "disclaimer",
        "bbox",
        "expression_scores",
        "latency_ms",
    }
    assert set(res_ndarray.keys()) == expected_keys
    json_output = json.dumps(res_ndarray, indent=2)
    print("    Sample JSON Payload for FastAPI:")
    print(json_output)

    print("\n" + "=" * 65)
    print("ALL 10 VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 65)
    return True


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

