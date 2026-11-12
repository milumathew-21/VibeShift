# VibeShift AI Module: Facial Expression Estimation

**Developer:** Milu (Member 3 – AI Developer & Team Lead)  
**Package:** `backend.ai`  
**Target Environment:** Python 3.14+ | PyTorch 2.13.0+ (CPU) | OpenCV 4.11+ | timm 1.0+

---

## 1. Overview & Ethical Disclaimer

The `backend.ai` module detects human faces in user camera frames or uploaded images, preprocesses face crops, and produces **estimates of visible facial expressions**.

> [!IMPORTANT]
> **Scientific & Ethical Boundary:**
> Facial-expression predictions are estimates based on visual appearance and **do not** represent a person's actual emotional state or internal feelings. In accordance with VibeShift engineering policies, all predictions are marked with this mandatory disclaimer.

---

## 2. Directory Structure

```text
backend/
  ai/
    __init__.py              # Public API exports
    face_detector.py         # OpenCV Haar Cascade face detector
    preprocess.py            # Image decoding, face crop, resizing & PyTorch tensor conversion
    emotion_model.py         # PyTorch MobileNetV3 and EmotiEffLib (EfficientNet-B2) inference interface
    evaluate_model.py        # Batched offline evaluation harness for standardized datasets
    test_ai_module.py        # 10-point end-to-end integration test suite
    README.md                # Module documentation, integration rules, and test guide
    models/
      .gitkeep                               # Directory tracker
      haarcascade_frontalface_default.xml    # Official OpenCV Haar cascade (930 KB)
      enet_b2_7_state_dict.pt                # Pure PyTorch state_dict for safe weights_only loading (31.3 MB)
```

---

## 3. Module Roles & API Reference

### A. `face_detector.py` (`FaceDetector`)
Detects human faces using OpenCV's Haar Cascade classifier (`haarcascade_frontalface_default.xml`).
* `is_available -> bool`: Reports `True` when Haar cascade XML and `cv2.CascadeClassifier` are loaded.
* `detect_faces(image, scale_factor=1.1, min_neighbors=4) -> List[Tuple[int, int, int, int]]`: Returns all detected face bounding boxes in `(x, y, w, h)` format. Configured with `min_neighbors=4` to reliably detect faces in compressed camera streams.
* `get_primary_face(faces) -> Optional[Tuple[int, int, int, int]]`: Returns the primary face bounding box with the largest area (`w * h`), representing the user in front of the camera.

### B. `preprocess.py`
Provides robust multi-format image input handling, cropping, and PyTorch tensor preparation:
* `decode_image(image_input) -> Optional[np.ndarray]`: Decodes images from raw bytes, bytearrays, base64 data URIs (`data:image/jpeg;base64,...`), filepaths, or NumPy arrays into standard BGR format.
* `crop_face(image, bbox, margin_ratio=0.1) -> Optional[np.ndarray]`: Crops the detected face with boundary clamping to prevent out-of-bounds errors.
* `preprocess_face_for_emotieff(face_bgr, target_size=(260, 260)) -> Optional[torch.Tensor]`: Converts BGR to RGB, resizes to $260 \times 260$, normalizes with ImageNet parameters, and returns shape `(1, 3, 260, 260)`.
* `preprocess_face_for_mobilenet(face_bgr, target_size=(224, 224)) -> Optional[torch.Tensor]`: Normalizes for MobileNetV3 to shape `(1, 3, 224, 224)`.
* `preprocess_face_for_minixception(face_bgr, target_size=(48, 48)) -> Optional[torch.Tensor]`: Normalizes to grayscale `[-1.0, 1.0]` with shape `(1, 1, 48, 48)`.

### C. `emotion_model.py` (`EmotiEffAdapter`, `EmotionModelInterface`, `predict`)
* **EmotiEffAdapter:** Integrates EmotiEffLib (`tf_efficientnet_b2`) fine-tuned on AffectNet-7. Automatically handles AffectNet-to-VibeShift canonical label re-mapping:
  ```python
  {
      0: "angry",     # AffectNet Anger
      1: "disgust",   # AffectNet Disgust
      2: "fear",      # AffectNet Fear
      3: "happy",     # AffectNet Happiness
      4: "neutral",   # AffectNet Neutral
      5: "sad",       # AffectNet Sadness
      6: "surprise",  # AffectNet Surprise
  }
  ```
* **Weight Security:** Loads pure tensor weights safely via `torch.load(..., weights_only=True)`.
* **FastAPI Entrypoint:** `predict(image_input) -> Dict[str, Any]` provides a zero-setup, consistent response:
  ```python
  {
      "face_detected": bool,
      "expression": Optional[str],
      "confidence": Optional[float],
      "status": str,  # 'success', 'low_confidence', 'no_face_detected', 'face_detector_unavailable', 'invalid_image', 'preprocessing_failed'
      "disclaimer": str,
      "bbox": Optional[List[int]],
      "expression_scores": Optional[Dict[str, float]],
      "latency_ms": float
  }
  ```

### D. `evaluate_model.py`
Evaluation script supporting batched parallel inference to benchmark model accuracy against real test splits (e.g. FER-2013 test set):
```bash
python -m backend.ai.evaluate_model --dataset-dir path/to/test_set --weights-path backend/ai/models/enet_b2_7_state_dict.pt --batch-size 32
```

---

## 4. How to Test the AI Module

Run the complete 10-point test suite from the repository root:
```bash
python -m backend.ai.test_ai_module
```

The test suite validates:
1. Face detector availability and Haar cascade loading.
2. Checkpoint loading with `weights_only=True`.
3. Geometric face detection on synthetic portrait canvas.
4. End-to-end inference on NumPy arrays.
5. End-to-end inference on raw JPEG bytes.
6. End-to-end inference on Base64 data URIs.
7. End-to-end inference on file paths.
8. Error handling: corrupt bytes (`invalid_image`) and blank frames (`no_face_detected`).
9. CPU latency benchmarks (steady-state $\sim 60-80\text{ ms}$).
10. JSON schema compatibility with FastAPI endpoints.

---

## 5. Integration Agreement with Nethra's FastAPI Backend

In accordance with the finalized AI/Backend compatibility agreement:

### 1. Canonical Expression Labels
The 7 canonical expression labels remain strictly unchanged:
`"angry"`, `"disgust"`, `"fear"`, `"happy"`, `"sad"`, `"surprise"`, `"neutral"`.

### 2. Mood Mapping Logic (Backend Side)
* **Direct Music Mood Matches:**
  * `"happy"` $\rightarrow$ **Happy**
  * `"sad"` $\rightarrow$ **Sad**
  * `"angry"` $\rightarrow$ **Energetic / Angry**
  * `"neutral"` $\rightarrow$ **Calm / Neutral**
* **Ambiguous Expressions (Manual Mood Selection Required):**
  * `"surprise"`, `"fear"`, `"disgust"` $\rightarrow$ Prompt the user for manual mood selection on the frontend.
* **Safety & Fallback Policy:**
  * Predictions with `status == "low_confidence"` or `status == "no_face_detected"` **must never silently default to `"neutral"`**.
  * The backend must return the specific status so the UI can gently prompt the user to adjust lighting, face the camera, or choose their mood manually.

### 3. Non-Blocking Threadpool Execution
Because PyTorch and OpenCV inference are CPU-bound, the FastAPI route must run `predict` inside Starlette's threadpool:

```python
from fastapi import APIRouter, File, UploadFile
from starlette.concurrency import run_in_threadpool
from backend.ai import predict

router = APIRouter()

@router.post("/estimate")
async def estimate_expression(file: UploadFile = File(...)):
    image_bytes = await file.read()
    # Runs CPU-bound inference non-blockingly
    result = await run_in_threadpool(predict, image_bytes)
    return result
```

### 4. API Contract Schema
The API maintains the core fields while exposing the `status` diagnostics:
```json
{
  "face_detected": true,
  "expression": "happy",
  "confidence": 0.8845,
  "status": "success",
  "disclaimer": "Facial-expression predictions are estimates based on visual features and do not represent a person's actual emotional state.",
  "bbox": [114, 103, 172, 172],
  "expression_scores": {
    "angry": 0.0121,
    "disgust": 0.0045,
    "fear": 0.0098,
    "happy": 0.8845,
    "sad": 0.0112,
    "surprise": 0.0354,
    "neutral": 0.0425
  },
  "latency_ms": 68.4
}
```

---

## 6. Model Weight Setup & Verified Sources

* **Haar Cascade Face Detector:**  
  Official OpenCV frontal face Haar Cascade (`haarcascade_frontalface_default.xml`, 930 KB).  
  Source: [OpenCV GitHub Repository](https://github.com/opencv/opencv/tree/4.x/data/haarcascades).

* **EmotiEffLib Checkpoint:**  
  EfficientNet-B2 fine-tuned on AffectNet-7 (`enet_b2_7_state_dict.pt`, 31.3 MB).  
  Source: [EmotiEffLib / HSEmotion GitHub](https://github.com/HSE-asavchenko/face-emotion-recognition).  
  Direct download link:
  `https://raw.githubusercontent.com/HSE-asavchenko/face-emotion-recognition/main/models/affectnet_emotions/enet_b2_7.pt`
  
  To re-generate `enet_b2_7_state_dict.pt` from the raw `enet_b2_7.pt` file:
  ```python
  import torch, timm
  with torch.serialization.safe_globals([timm.models.efficientnet.EfficientNet]):
      model = torch.load("backend/ai/models/enet_b2_7.pt", map_location="cpu", weights_only=False)
  torch.save(model.state_dict(), "backend/ai/models/enet_b2_7_state_dict.pt")
  ```
