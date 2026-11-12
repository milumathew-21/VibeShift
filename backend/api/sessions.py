"""
VibeShift - Session & Journey API Routes
Handles session lifecycle, mood recording, and mood journey history for visualization charts.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Path

from database.db import get_db_connection
from schemas.session import (
    SessionCreateRequest,
    SessionResponse,
    RecordMoodRequest,
    RecordMoodResponse,
    JourneyResponse,
    MoodEntry,
)

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

# Allowed mood and source constants
ALLOWED_MOODS = {"happy", "sad", "calm", "energetic", "angry", "neutral"}
ALLOWED_SOURCES = {"manual", "camera_suggested", "recheck"}


@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new listening session",
    description="Initializes a new listening session with optional preferred language, genre, and context.",
)
def create_session(payload: SessionCreateRequest):
    """
    POST /api/sessions
    Creates a new session record and returns the generated session_id and creation timestamp.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute(
        """
        INSERT INTO sessions (language, genre, context, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (payload.language, payload.genre, payload.context, created_at),
    )
    conn.commit()
    session_id = cursor.lastrowid
    conn.close()

    return {
        "session_id": session_id,
        "created_at": created_at,
    }


@router.post(
    "/{id}/mood",
    response_model=RecordMoodResponse,
    summary="Record confirmed mood for a session",
    description="Logs a confirmed mood entry into the session's mood journey.",
)
def record_session_mood(
    payload: RecordMoodRequest,
    id: int = Path(..., description="The unique integer ID of the session"),
):
    """
    POST /api/sessions/{id}/mood
    Validates the session existence, validates the mood tag, and saves the mood entry.
    """
    # 1. Validate mood tag
    mood_clean = payload.mood.strip().lower()
    if mood_clean not in ALLOWED_MOODS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid mood '{payload.mood}'. "
                f"Allowed moods are: {', '.join(sorted(ALLOWED_MOODS))}."
            ),
        )

    # 2. Validate source
    source_clean = (payload.source or "manual").strip().lower()
    if source_clean not in ALLOWED_SOURCES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid source '{payload.source}'. "
                f"Allowed sources are: {', '.join(sorted(ALLOWED_SOURCES))}."
            ),
        )

    # 3. Check if the session exists
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT session_id FROM sessions WHERE session_id = ?", (id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with ID {id} not found.",
        )

    # 4. Insert mood record
    recorded_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """
        INSERT INTO mood_records (session_id, mood, confidence, source, recorded_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (id, mood_clean, payload.confidence or 1.0, source_clean, recorded_at),
    )
    conn.commit()
    conn.close()

    return {
        "message": "Mood recorded successfully",
        "session_id": id,
        "mood": mood_clean,
        "source": source_clean,
        "confidence": payload.confidence,
        "recorded_at": recorded_at,
    }


@router.get(
    "/{id}/journey",
    response_model=JourneyResponse,
    summary="Get mood journey history for a session",
    description="Returns chronological mood entries for rendering frontend mood tracking charts.",
)
def get_session_journey(
    id: int = Path(..., description="The unique integer ID of the session"),
):
    """
    GET /api/sessions/{id}/journey
    Retrieves mood progression for charts, ordered oldest first.
    Returns empty entries list if no moods have been recorded yet.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Verify session exists
    cursor.execute("SELECT session_id FROM sessions WHERE session_id = ?", (id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with ID {id} not found.",
        )

    # 2. Query mood journey entries sorted chronologically (oldest first)
    cursor.execute(
        """
        SELECT mood, source, recorded_at
        FROM mood_records
        WHERE session_id = ?
        ORDER BY id ASC
        """,
        (id,),
    )
    rows = cursor.fetchall()
    conn.close()

    entries = [
        MoodEntry(
            mood=row["mood"],
            source=row["source"],
            recorded_at=str(row["recorded_at"]),
        )
        for row in rows
    ]

    return JourneyResponse(session_id=id, entries=entries)

