"""
VibeShift - Emotion Analysis Schemas
Defines schemas for AI facial emotion estimation results.
"""

from typing import Optional
from pydantic import BaseModel, Field


class EmotionResponse(BaseModel):
    """
    Response schema for image emotion estimation.
    """
    emotion: Optional[str] = Field(
        None,
        description="Estimated music mood ('happy', 'sad', 'angry', 'neutral'), or null if unmapped / failed",
    )
    confidence: float = Field(
        0.0,
        description="Estimated confidence score (0.0 to 1.0)",
    )
    note: str = Field(
        ...,
        description="Explanation note, disclaimer, or prompt to choose mood manually",
    )
    status: Optional[str] = Field(
        None,
        description="Detection status from AI model (e.g., success, no_face_detected, low_confidence)",
    )
