"""
VibeShift - Feedback API Routes
Handles user feedback actions (like, skip, replay) and updates the recommendation scoring pool.
"""

from fastapi import APIRouter, HTTPException, status

from database.db import get_db_connection
from schemas.feedback import FeedbackRequest, FeedbackResponse

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

ALLOWED_ACTIONS = {"like", "skip", "replay"}


@router.post(
    "",
    response_model=FeedbackResponse,
    summary="Record user song feedback",
    description="Records user action ('like', 'skip', or 'replay') to adapt future song recommendation scores.",
)
def record_feedback(payload: FeedbackRequest):
    """
    POST /api/feedback
    Validates the action, ensures session and song exist, and logs the feedback into the database.
    """
    # 1. Validate action
    action_clean = payload.action.strip().lower()
    if action_clean not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid action '{payload.action}'. "
                f"Allowed actions are: {', '.join(sorted(ALLOWED_ACTIONS))}."
            ),
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    # 2. Check if the session exists
    cursor.execute("SELECT session_id FROM sessions WHERE session_id = ?", (payload.session_id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with ID {payload.session_id} not found.",
        )

    # 3. Check if the song exists
    cursor.execute("SELECT id FROM songs WHERE id = ?", (payload.song_id,))
    song = cursor.fetchone()
    if not song:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Song with ID {payload.song_id} not found.",
        )

    # 4. Insert feedback record
    cursor.execute(
        """
        INSERT INTO feedback (session_id, song_id, action)
        VALUES (?, ?, ?)
        """,
        (payload.session_id, payload.song_id, action_clean),
    )
    conn.commit()
    conn.close()

    return {
        "message": "Feedback recorded successfully",
        "session_id": payload.session_id,
        "song_id": payload.song_id,
        "action": action_clean,
    }

