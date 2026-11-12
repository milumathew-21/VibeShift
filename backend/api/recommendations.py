"""
VibeShift - Recommendation API Routes
Handles endpoint for generating personalized song recommendations.
"""

from typing import List
from fastapi import APIRouter, HTTPException, status

from schemas.recommendation import RecommendationRequest, SongResponse
from services.recommendation import get_recommendations

router = APIRouter(prefix="/api", tags=["Recommendations"])


@router.post(
    "/recommendations",
    response_model=List[SongResponse],
    summary="Get personalized song recommendations",
    description="Recommends top songs based on mood matching/changing, preferences, and feedback history.",
)
def recommend_songs(payload: RecommendationRequest):
    """
    POST /api/recommendations
    Validates request payload and returns the top 10 recommended songs.
    """
    # 1. Validate mode
    valid_modes = ["match", "change"]
    if payload.mode not in valid_modes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid mode '{payload.mode}'. Mode must be either 'match' or 'change'.",
        )

    # 2. Validate target_mood when mode is 'change'
    if payload.mode == "change":
        if not payload.target_mood or not payload.target_mood.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_mood is required when mode is 'change'.",
            )

    # 3. Calculate and retrieve recommendations
    try:
        recommendations = get_recommendations(
            current_mood=payload.current_mood,
            mode=payload.mode,
            target_mood=payload.target_mood,
            language=payload.language,
            genre=payload.genre,
            context=payload.context,
            limit=10,
        )
        return recommendations
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating recommendations: {str(exc)}",
        )

