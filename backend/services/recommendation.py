"""
VibeShift - Recommendation Service
Calculates weighted recommendation scores based on user mood, preferences, and feedback.
"""

from typing import List, Dict, Any, Optional
from database.db import get_db_connection

# ============================================================================
# RECOMMENDATION SCORING WEIGHTS
# ============================================================================
MOOD_MATCH_WEIGHT = 3       # Bonus points if the song matches the selected mood
LANGUAGE_MATCH_WEIGHT = 2   # Bonus points if the song matches user's preferred language
GENRE_MATCH_WEIGHT = 2      # Bonus points if the song matches user's preferred genre
CONTEXT_MATCH_WEIGHT = 1    # Bonus points if the song fits the user's activity context

# Feedback history weights (retrieved from the feedback table)
LIKE_WEIGHT = 2             # Bonus points for previously liked songs
REPLAY_WEIGHT = 1           # Bonus points for previously replayed songs
SKIP_PENALTY = -2           # Penalty deducted for skipped songs


def get_feedback_scores(session_id: Optional[str] = None) -> Dict[int, int]:
    """
    Queries the feedback table and calculates the net feedback score for each song.
    If session_id is provided, calculates feedback for that specific session;
    otherwise calculates overall feedback across all sessions.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    if session_id:
        cursor.execute(
            "SELECT song_id, action FROM feedback WHERE session_id = ?",
            (session_id,),
        )
    else:
        cursor.execute("SELECT song_id, action FROM feedback")

    rows = cursor.fetchall()
    conn.close()

    feedback_scores: Dict[int, int] = {}
    for row in rows:
        song_id = row["song_id"]
        action = (row["action"] or "").lower()

        current_score = feedback_scores.get(song_id, 0)
        if action == "like":
            current_score += LIKE_WEIGHT
        elif action == "replay":
            current_score += REPLAY_WEIGHT
        elif action == "skip":
            current_score += SKIP_PENALTY

        feedback_scores[song_id] = current_score

    return feedback_scores


def get_recommendations(
    current_mood: str,
    mode: str = "match",
    target_mood: Optional[str] = None,
    language: Optional[str] = None,
    genre: Optional[str] = None,
    context: Optional[str] = None,
    session_id: Optional[str] = None,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    Generates top recommended songs based on weighted score:
    - Mode 'match': aims to match current_mood.
    - Mode 'change': aims to guide user towards target_mood.
    """
    # Determine the effective mood to match based on the chosen mode
    effective_mood = target_mood if mode == "change" else current_mood
    effective_mood = (effective_mood or "").strip().lower()

    target_lang = (language or "").strip().lower()
    target_genre = (genre or "").strip().lower()
    target_context = (context or "").strip().lower()

    # Load net feedback score modifiers per song
    feedback_scores = get_feedback_scores(session_id=session_id)

    # Fetch all songs from the database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM songs")
    all_songs = cursor.fetchall()
    conn.close()

    scored_songs = []

    for song_row in all_songs:
        song = dict(song_row)
        score = 0

        # Parse pipe-separated tags into lowercase lists
        mood_tags_raw = song.get("mood_tags", "") or ""
        song_moods = [m.strip().lower() for m in mood_tags_raw.split("|") if m.strip()]

        context_tags_raw = song.get("context_tags", "") or ""
        song_contexts = [c.strip().lower() for c in context_tags_raw.split("|") if c.strip()]

        song_lang = (song.get("language") or "").strip().lower()
        song_genre = (song.get("genre") or "").strip().lower()

        # 1. Mood scoring
        if effective_mood and effective_mood in song_moods:
            score += MOOD_MATCH_WEIGHT

        # 2. Language scoring
        if target_lang and song_lang == target_lang:
            score += LANGUAGE_MATCH_WEIGHT

        # 3. Genre scoring
        if target_genre and song_genre == target_genre:
            score += GENRE_MATCH_WEIGHT

        # 4. Context scoring
        if target_context and target_context in song_contexts:
            score += CONTEXT_MATCH_WEIGHT

        # 5. User feedback scoring
        song_id = song["id"]
        score += feedback_scores.get(song_id, 0)

        # Prepare formatted song dictionary (mood_tags converted to a list)
        formatted_song = {
            "id": song["id"],
            "title": song["title"],
            "artist": song["artist"],
            "language": song["language"],
            "genre": song["genre"],
            "mood_tags": [tag.strip() for tag in mood_tags_raw.split("|") if tag.strip()],
            "audio_url": song["audio_url"],
            "score": score,  # Kept internally for sorting
        }
        scored_songs.append(formatted_song)

    # Sort descending by score; if tied, sort by id ascending for consistent ordering
    scored_songs.sort(key=lambda x: (x["score"], -x["id"]), reverse=True)

    # Select top N songs and remove internal 'score' before returning
    top_songs = []
    for item in scored_songs[:limit]:
        item.pop("score", None)
        top_songs.append(item)

    return top_songs

