"""
VibeShift - Session & Journey Schemas
Defines Pydantic request and response schemas for user sessions and mood journeys.
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class SessionCreateRequest(BaseModel):
    """
    Optional initial preferences when starting a listening session.
    """
    language: Optional[str] = Field(None, description="Preferred language (Malayalam, Hindi, English, Tamil)")
    genre: Optional[str] = Field(None, description="Preferred genre (Melody, Pop, Rock, Classical, Dance)")
    context: Optional[str] = Field(None, description="Current context (relax, study, workout, travel, party, sleep)")


class SessionResponse(BaseModel):
    """
    Response returned when a session is created.
    """
    session_id: int = Field(..., description="Unique integer ID of the created session")
    created_at: str = Field(..., description="Timestamp when the session was created")


class RecordMoodRequest(BaseModel):
    """
    Request to log a confirmed mood for a session.
    """
    mood: str = Field(..., description="Mood to record: happy, sad, calm, energetic, angry, neutral")
    source: Optional[str] = Field("manual", description="Source of mood entry: manual, camera_suggested, recheck")
    confidence: Optional[float] = Field(1.0, description="Optional confidence score between 0.0 and 1.0")


class RecordMoodResponse(BaseModel):
    """
    Confirmation response after recording a mood.
    """
    message: str
    session_id: int
    mood: str
    source: str
    confidence: Optional[float]
    recorded_at: str


class MoodEntry(BaseModel):
    """
    A single mood point in the session journey.
    """
    mood: str
    source: str
    recorded_at: str


class JourneyResponse(BaseModel):
    """
    Full mood journey history for visualization charts.
    """
    session_id: int
    entries: List[MoodEntry]

