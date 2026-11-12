"""
VibeShift - Emotion API Routes
Accepts optional image upload to estimate facial expression emotion.
Processes image in memory only and makes no medical claims.
"""

import os
from fastapi import APIRouter, File, UploadFile, HTTPException, status

from schemas.emotion import EmotionResponse
from services.emotion import (
    analyze_image_emotion,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_EXTENSIONS,
)

router = APIRouter(prefix="/api/emotion", tags=["Emotion"])


@router.post(
    "",
    response_model=EmotionResponse,
    summary="Estimate emotion from facial photo",
    description=(
        "Analyzes an uploaded facial photo in-memory to estimate current mood. "
        "Images are never saved to disk. Provides an estimate only with no medical or diagnostic claims."
    ),
)
async def estimate_emotion(file: UploadFile = File(...)):
    """
    POST /api/emotion
    Accepts an uploaded image file, safely validates the file format,
    calls the emotion predictor (or temporary stub), and returns the estimation.
    """
    # 1. Check for provided filename and extension
    filename = file.filename or ""
    _, ext = os.path.splitext(filename.lower())

    # 2. Validate file type / MIME type
    is_valid_mime = file.content_type and file.content_type.lower() in ALLOWED_IMAGE_TYPES
    is_valid_ext = ext in ALLOWED_EXTENSIONS

    if not is_valid_mime and not is_valid_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid image file (JPEG, PNG, or WEBP).",
        )

    # 3. Read image contents safely in-memory
    try:
        contents = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read uploaded file: {str(exc)}",
        )

    # 4. Validate non-empty image content
    if not contents or len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty. Please upload a valid image.",
        )

    # 5. Process image with emotion service (never saves to disk)
    try:
        result = analyze_image_emotion(contents)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Emotion analysis encountered an unexpected error: {str(exc)}",
        )

