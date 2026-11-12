"""
preprocess.py
=============
Image decoding, face cropping, resizing, and PyTorch tensor preprocessing.

Author: Milu (Member 3 – AI Developer)
Module: backend.ai.preprocess

NOTE ON PREPROCESSING NORMALIZATION:
The preprocessing normalization implemented below (e.g., ImageNet mean and std
for MobileNetV3 and EmotiEffLib, or [-1.0, 1.0] scaling for grayscale models) represents standard
defaults for these architectures.
CRITICAL: The exact normalization protocol (mean, standard deviation, color channel
ordering, and value range) is strictly dependent on the training configuration of
the eventual verified model checkpoint. Once verified model weights are adopted,
these parameters must be aligned with the checkpoint's documented training parameters.
"""

import base64
import binascii
import os
from typing import Optional, Sequence, Tuple, Union
import cv2
import numpy as np
import torch


# Default ImageNet normalization parameters for RGB backbones.
# MUST be reconciled with the training protocol of the verified checkpoint when loaded.
DEFAULT_IMAGENET_MEAN = [0.485, 0.456, 0.406]
DEFAULT_IMAGENET_STD = [0.229, 0.224, 0.225]


def decode_image(image_input: Union[bytes, bytearray, str, np.ndarray]) -> Optional[np.ndarray]:
    """
    Decodes an image from various input representations into a standard BGR NumPy array.

    Supported input types:
      - numpy.ndarray: Validated for shape, dimensions, and channel count.
      - bytes / bytearray: Decoded via OpenCV imdecode.
      - str (Base64): Decodes standard or data-URI base64 (e.g. 'data:image/jpeg;base64,...').
      - str (File path): Reads file from disk if path exists.

    Returns:
        np.ndarray in BGR format with shape (H, W, 3), or None if input is invalid or decoding fails.
    """
    if image_input is None:
        return None

    # Case 1: Already a NumPy array
    if isinstance(image_input, np.ndarray):
        if image_input.size == 0 or image_input.ndim not in (2, 3):
            return None
        h, w = image_input.shape[:2]
        if h <= 0 or w <= 0:
            return None

        try:
            # Convert single-channel (grayscale) to 3-channel BGR
            if image_input.ndim == 2:
                return cv2.cvtColor(image_input, cv2.COLOR_GRAY2BGR)
            # 3-channel BGR
            if image_input.shape[2] == 3:
                return image_input.copy()
            # 4-channel BGRA
            if image_input.shape[2] == 4:
                return cv2.cvtColor(image_input, cv2.COLOR_BGRA2BGR)
        except Exception:
            return None
        return None

    # Case 2: Raw bytes
    if isinstance(image_input, (bytes, bytearray)):
        if len(image_input) == 0:
            return None
        try:
            np_arr = np.frombuffer(image_input, dtype=np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is not None and img.size > 0 and img.ndim == 3 and img.shape[2] == 3:
                return img
            return None
        except Exception:
            return None

    # Case 3: String (File Path or Base64 data)
    if isinstance(image_input, str):
        trimmed = image_input.strip()
        if not trimmed:
            return None

        # Check if it's an existing file path
        if os.path.isfile(trimmed):
            try:
                img = cv2.imread(trimmed, cv2.IMREAD_COLOR)
                if img is not None and img.size > 0:
                    return img
            except Exception:
                pass

        # Attempt Base64 decode
        try:
            # Strip data URI header if present (e.g. "data:image/jpeg;base64,...")
            if "," in trimmed and "base64" in trimmed.split(",", 1)[0].lower():
                payload = trimmed.split(",", 1)[1]
            else:
                payload = trimmed

            decoded_bytes = base64.b64decode(payload, validate=True)
            if not decoded_bytes:
                return None
            np_arr = np.frombuffer(decoded_bytes, dtype=np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is not None and img.size > 0:
                return img
            return None
        except (binascii.Error, ValueError, Exception):
            return None

    return None


def crop_face(
    image: np.ndarray,
    bbox: Union[Sequence[int], Tuple[int, int, int, int]],
    margin_ratio: float = 0.1,
) -> Optional[np.ndarray]:
    """
    Crops a face from an image with an optional proportional margin around the bounding box.
    Ensures crop coordinates stay strictly within image boundaries.

    Args:
        image: Source image as BGR NumPy array.
        bbox: Bounding box sequence (x, y, w, h).
        margin_ratio: Additional margin factor added around each edge (default 0.1 = 10%).

    Returns:
        Cropped face image as BGR NumPy array, or None if invalid or crop is empty.
    """
    if image is None or not isinstance(image, np.ndarray) or image.size == 0 or image.ndim < 2:
        return None

    if not isinstance(bbox, (tuple, list)) or len(bbox) != 4:
        return None

    try:
        x, y, w, h = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
    except (ValueError, TypeError):
        return None

    if w <= 0 or h <= 0:
        return None

    img_h, img_w = image.shape[:2]
    if img_h <= 0 or img_w <= 0:
        return None

    margin_ratio = max(0.0, float(margin_ratio))
    margin_x = int(w * margin_ratio)
    margin_y = int(h * margin_ratio)

    x1 = max(0, x - margin_x)
    y1 = max(0, y - margin_y)
    x2 = min(img_w, x + w + margin_x)
    y2 = min(img_h, y + h + margin_y)

    if x2 <= x1 or y2 <= y1:
        return None

    crop = image[y1:y2, x1:x2]
    if crop.size == 0:
        return None

    return crop.copy()


def preprocess_face_for_mobilenet(
    face_bgr: np.ndarray,
    target_size: Tuple[int, int] = (224, 224),
    mean: Sequence[float] = DEFAULT_IMAGENET_MEAN,
    std: Sequence[float] = DEFAULT_IMAGENET_STD,
) -> Optional[torch.Tensor]:
    """
    Prepares a cropped BGR face image for MobileNetV3 PyTorch inference.

    Pipeline:
      1. Converts BGR to RGB.
      2. Resizes to target resolution (default 224x224).
      3. Scales pixel values from [0, 255] to [0.0, 1.0].
      4. Normalizes using specified mean and standard deviation.
         (Defaults to ImageNet; must be aligned with verified checkpoint parameters).
      5. Transposes shape from (H, W, C) to (C, H, W).
      6. Adds batch dimension -> (1, 3, 224, 224).

    Args:
        face_bgr: Cropped face NumPy array in BGR format.
        target_size: Desired resolution (width, height), default (224, 224).
        mean: Normalization channel means.
        std: Normalization channel standard deviations.

    Returns:
        PyTorch FloatTensor of shape (1, 3, H, W), or None if input is invalid or processing fails.
    """
    if face_bgr is None or not isinstance(face_bgr, np.ndarray) or face_bgr.size == 0:
        return None

    if face_bgr.ndim != 3 or face_bgr.shape[2] != 3:
        return None

    try:
        # Step 1: BGR to RGB
        rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)

        # Step 2: Resize
        resized = cv2.resize(rgb, target_size, interpolation=cv2.INTER_LINEAR)

        # Step 3: Scale to [0.0, 1.0]
        float_img = resized.astype(np.float32) / 255.0

        # Step 4: Normalize
        mean_arr = np.array(mean, dtype=np.float32)
        std_arr = np.array(std, dtype=np.float32)
        normalized = (float_img - mean_arr) / std_arr

        # Step 5: (H, W, C) -> (C, H, W)
        chw = np.transpose(normalized, (2, 0, 1))

        # Step 6: Convert to PyTorch Tensor with batch dimension -> (1, C, H, W)
        tensor = torch.from_numpy(chw).unsqueeze(0).float()
        return tensor
    except Exception:
        return None


def preprocess_face_for_emotieff(
    face_bgr: np.ndarray,
    target_size: Tuple[int, int] = (260, 260),
    mean: Sequence[float] = DEFAULT_IMAGENET_MEAN,
    std: Sequence[float] = DEFAULT_IMAGENET_STD,
) -> Optional[torch.Tensor]:
    """
    Prepares a cropped BGR face image for EmotiEffLib (EfficientNet-B2) PyTorch inference.
    Target resolution defaults to 260x260 with standard ImageNet RGB normalization.

    Args:
        face_bgr: Cropped face NumPy array in BGR format.
        target_size: Desired resolution (width, height), default (260, 260).
        mean: Normalization channel means.
        std: Normalization channel standard deviations.

    Returns:
        PyTorch FloatTensor of shape (1, 3, 260, 260), or None if input is invalid.
    """
    return preprocess_face_for_mobilenet(face_bgr, target_size=target_size, mean=mean, std=std)


def preprocess_face_for_minixception(
    face_bgr: np.ndarray,
    target_size: Tuple[int, int] = (48, 48),
) -> Optional[torch.Tensor]:
    """
    Prepares a cropped BGR face image for Mini-Xception PyTorch inference.

    Pipeline:
      1. Converts BGR to Grayscale.
      2. Resizes to 48x48.
      3. Scales to range [-1.0, 1.0].
      4. Converts to PyTorch FloatTensor of shape (1, 1, 48, 48).

    Args:
        face_bgr: Cropped face NumPy array in BGR format.
        target_size: Desired resolution (width, height), default (48, 48).

    Returns:
        PyTorch FloatTensor of shape (1, 1, H, W), or None if input is invalid.
    """
    if face_bgr is None or not isinstance(face_bgr, np.ndarray) or face_bgr.size == 0:
        return None

    try:
        if face_bgr.ndim == 3 and face_bgr.shape[2] == 3:
            gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
        elif face_bgr.ndim == 2:
            gray = face_bgr
        else:
            return None

        resized = cv2.resize(gray, target_size, interpolation=cv2.INTER_AREA)
        float_img = (resized.astype(np.float32) / 127.5) - 1.0
        tensor = torch.from_numpy(float_img).unsqueeze(0).unsqueeze(0).float()
        return tensor
    except Exception:
        return None
