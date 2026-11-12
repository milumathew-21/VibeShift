"""
VibeShift - Emotion Analysis Schemas
Defines schemas for AI facial emotion estimation results.
"""

from pydantic import BaseModel, Field


class EmotionResponse(BaseModel):
    """
    Response schema for image emotion estimation.
    """
    emotion: str = Field(..., description="Estimated emotion tag (e.g., neutral, happy, calm)")
    confidence: float = Field(..., description="Estimated confidence score (0.0 to 1.0)")
    note: str = Field(..., description="Disclaimer noting this is an estimate, not a medical or emotional proof")

