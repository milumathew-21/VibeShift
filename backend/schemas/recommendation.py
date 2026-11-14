"""
VibeShift - Recommendation Schemas
Defines Pydantic request and response schemas for song recommendations.
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    """
    Request payload for song recommendations.
    """
    current_mood: str = Field(..., description="Current detected or selected mood (e.g., happy, sad, calm)")
    mode: str = Field("match", description="Recommendation mode: 'match' (stay in mood) or 'change' (shift mood)")
    target_mood: Optional[str] = Field(None, description="Desired target mood, required if mode is 'change'")
    language: Optional[str] = Field(None, description="Preferred language (Malayalam, Hindi, English, Tamil)")
    genre: Optional[str] = Field(None, description="Preferred genre (Melody, Pop, Rock, Classical, Dance)")
    context: Optional[str] = Field(None, description="Current context/activity (relax, study, workout, travel, party, sleep)")


class SongResponse(BaseModel):
    """
    Response schema representing a single recommended song.
    """
    id: int
    title: str
    artist: str
    language: str
    genre: str
    mood_tags: List[str]
    audio_url: str

