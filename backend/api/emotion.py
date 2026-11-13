"""
VibeShift - Emotion API Routes
Accepts optional image upload to estimate facial expression emotion.
Integrates with backend.ai.predict via run_in_threadpool.
Images are processed purely in-memory and never saved to disk.
"""

import os
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.concurrency import run_in_threadpool

from backend.ai import predict
from schemas.emotion import EmotionResponse
from services.emotion import (
    ALLOWED_IMAGE_TYPES,
    ALLOWED_EXTENSIONS,
    process_prediction_result,
)

router = APIRouter(prefix="/api/emotion", tags=["Emotion"])


@router.post(
    "",
    response_model=EmotionResponse,
    summary="Estimate emotion from facial photo",
    description=(
        "Analyzes an uploaded facial photo in-memory to estimate current mood. "
        "Images are never saved to disk. Returns null emotion if detection fails or expression is ambiguous."
    ),
)
async def estimate_emotion(file: UploadFile = File(...)):
    """
    POST /api/emotion
    Accepts an uploaded image file, safely validates the file format,
    calls backend.ai.predict using run_in_threadpool in-memory,
    maps facial expression to music mood, and returns the response safely.
    """
    # 1. Check filename and extension
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

    # 3. Read image contents safely in-memory (never saved to disk)
    try:
        image_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read uploaded file: {str(exc)}",
        )

    # 4. Validate non-empty image content
    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty. Please upload a valid image.",
        )

    # 5. Execute inference via run_in_threadpool with friendly error catching
    try:
        raw_result = await run_in_threadpool(predict, image_bytes)
    except Exception as exc:
        # Friendly error handling: no server crash, no stack trace exposed to user
        return EmotionResponse(
            emotion=None,
            confidence=0.0,
            status="error",
            note="Emotion estimation encountered a temporary issue. Please choose your mood manually.",
        )

    # 6. Map expression to mood and format the response
    formatted_response = process_prediction_result(raw_result)
    return EmotionResponse(**formatted_response)
