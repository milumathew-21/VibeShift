"""
backend/ai/test_ai_module.py
============================
Standalone test verification suite for VibeShift AI Module.

Author: Milu (Member 3 – AI Developer)

Validates:
1. Face detector availability and Haar cascade loading.
2. Checkpoint loading with weights_only=True.
3. Geometric face detection on synthetic portrait canvas.
4. End-to-end inference on NumPy arrays.
5. End-to-end inference on raw JPEG bytes.
6. End-to-end inference on Base64 data URIs.
7. End-to-end inference on file paths.
8. Error handling: corrupt bytes (invalid_image) and blank frames (no_face_detected).
9. CPU latency benchmarks.
10. FastAPI integration JSON schema compliance.
11. Diagnostic & detector failure modes (Nethra Integration Test Suite):
    - 11A: Haar Cascade successfully loaded + no face -> no_face_detected
    - 11B: Haar Cascade missing/unavailable -> face_detector_unavailable
    - 11C: Haar Cascade initialization exception -> logged diagnostic
    - 11D: Successful real-face prediction remains functional after error tests

Usage:
    python -m backend.ai.test_ai_module
"""

import base64
import io
import json
import logging
import os
import sys
import tempfile
import time
from pathlib import Path

# Configure logging to capture and display module logs during testing
log_stream = io.StringIO()
handler = logging.StreamHandler(log_stream)
handler.setFormatter(logging.Formatter("%(levelname)s [%(name)s] %(message)s"))
root_logger = logging.getLogger("backend.ai")
root_logger.setLevel(logging.INFO)
root_logger.addHandler(handler)

# Also echo to stdout for visibility
stdout_handler = logging.StreamHandler(sys.stdout)
stdout_handler.setFormatter(logging.Formatter("    LOG: %(levelname)s [%(name)s] %(message)s"))
root_logger.addHandler(stdout_handler)

# Ensure repository root is in sys.path
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

import cv2
import numpy as np

import backend.ai as ai
from backend.ai.face_detector import FaceDetector


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
    print("\n[8] Testing Standard Error Handling:")
    # Case A: Corrupt bytes -> invalid_image
    res_corrupt = ai.predict(b"this is corrupt non-image bytes")
    print(f"    A. Corrupt bytes -> status: '{res_corrupt['status']}', face_detected: {res_corrupt['face_detected']}")
    assert res_corrupt["status"] == "invalid_image"
    assert res_corrupt["face_detected"] is False

    # Case B: Blank frame (no face) -> no_face_detected
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

    # 11. Diagnostic & Detector Failure Modes (Nethra Integration Test Suite)
    print("\n[11] Diagnostic & Detector Failure Modes (Nethra Integration Tests):")

    # 11A. Haar Cascade successfully loaded + image containing no face -> no_face_detected
    print("    [11A] Testing Loaded Detector + No-Face Image...")
    res_noface = ai.predict(blank_canvas, detector=detector)
    print(f"          Result -> status: '{res_noface['status']}', face_detected: {res_noface['face_detected']}")
    assert res_noface["status"] == "no_face_detected"
    assert res_noface["face_detected"] is False
    assert res_noface["expression"] is None
    assert res_noface["confidence"] is None

    # 11B. Haar Cascade missing/unavailable -> face_detector_unavailable
    print("    [11B] Testing Missing/Unavailable Detector...")
    unavailable_detector = FaceDetector.__new__(FaceDetector)
    unavailable_detector.classifier = None
    unavailable_detector.cascade_path = None
    unavailable_detector._is_loaded = False
    unavailable_detector._load_error = "Haar cascade XML file not found at any candidate path"
    assert not unavailable_detector.is_available
    res_unavailable = ai.predict(face_img, detector=unavailable_detector)
    print(f"          Result -> status: '{res_unavailable['status']}', face_detected: {res_unavailable['face_detected']}")
    assert res_unavailable["status"] == "face_detector_unavailable"
    assert res_unavailable["face_detected"] is False

    # 11C. Haar Cascade initialization exception -> logged diagnostic
    print("    [11C] Testing Corrupt/Empty XML Detector Initialization Exception...")
    with tempfile.NamedTemporaryFile(suffix=".xml", delete=False) as tmp_xml:
        tmp_xml.write(b"<invalid_corrupted_xml_content></bad>")
        corrupt_path = tmp_xml.name
    try:
        corrupt_detector = FaceDetector(cascade_path=corrupt_path)
        assert not corrupt_detector.is_available
        print(f"          Corrupt XML detector correctly reported unavailable: '{corrupt_detector.load_error}'")
        res_corrupt_det = ai.predict(face_img, detector=corrupt_detector)
        assert res_corrupt_det["status"] == "face_detector_unavailable"
    finally:
        if os.path.exists(corrupt_path):
            os.remove(corrupt_path)

    # 11D. Successful real-face prediction remains functional after error tests
    print("    [11D] Re-verifying Real Face Prediction with Default Detector...")
    res_recovered = ai.predict(face_img)
    print(f"          Result -> status: '{res_recovered['status']}', face_detected: {res_recovered['face_detected']}, expr: {res_recovered['expression']}")
    assert res_recovered["face_detected"] is True
    assert res_recovered["expression"] is not None

    # 11E. Anti-flooding verification on repeated predict() calls
    print("    [11E] Verifying Anti-Flooding on 50 Rapid predict() calls...")
    init_err_count = log_stream.getvalue().count("Face detector is unavailable")
    for _ in range(50):
        r = ai.predict(face_img, detector=unavailable_detector)
        assert r["status"] == "face_detector_unavailable"
    final_err_count = log_stream.getvalue().count("Face detector is unavailable")
    print(f"          50 rapid predict() calls completed.")
    print(f"          ERROR logs emitted: {final_err_count - init_err_count} (expected exactly 1 on initial transition)")
    assert final_err_count - init_err_count == 1, "Repeated predict() calls flooded the error log!"

    print("\n" + "=" * 65)
    print("ALL 11 VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 65)
    return True


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
