"""
VibeShift - Feedback Schemas
Defines request and response schemas for song user interactions (like, skip, replay).
"""

from pydantic import BaseModel, Field


class FeedbackRequest(BaseModel):
    """
    User feedback on a song within a session.
    """
    session_id: int = Field(..., description="ID of the listening session")
    song_id: int = Field(..., description="ID of the song being acted upon")
    action: str = Field(..., description="Action taken: 'like', 'skip', or 'replay'")


class FeedbackResponse(BaseModel):
    """
    Confirmation response after recording user feedback.
    """
    message: str
    session_id: int
    song_id: int
    action: str

