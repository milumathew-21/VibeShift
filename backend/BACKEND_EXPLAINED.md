# VibeShift Backend - Architecture & Viva Guide

**Author:** Nethra (Member 4 - Backend Lead)  
**Project:** VibeShift - AI Adaptive Music Recommendation Web Application  
**Tech Stack:** Python 3.12 / 3.13, FastAPI, SQLite (`sqlite3`), Pandas, Uvicorn, Pydantic  

---

## 1. High-Level Backend Architecture

The VibeShift backend is built using a clean, modular layer architecture:
1. **API Layer (`backend/api/`)**: Declares FastAPI REST routes, validates HTTP inputs, and maps status codes.
2. **Schemas Layer (`backend/schemas/`)**: Pydantic models ensuring strict data validation and automated OpenAPI/Swagger documentation.
3. **Services Layer (`backend/services/`)**: Core business logic (recommendation ranking engine and safe emotion analysis wrapper).
4. **Database Layer (`backend/database/`)**: SQLite connection manager, table DDL schemas, and Pandas CSV seed loader.
5. **Data Layer (`backend/data/`)**: Initial song catalog (`songs.csv`) with 30 diverse sample tracks.

---

## 2. File-by-File Summary

| File | Purpose | Key Functions / Responsibilities |
|---|---|---|
| `main.py` | Application entry point | Configures FastAPI app, CORS middleware for Vite (`localhost:5173`), registers all 4 API routers, and defines the `lifespan` handler that auto-creates database tables and loads seed data on startup. |
| `database/db.py` | SQLite database manager | Provides `get_db_connection()`, executes table creation DDL (`songs`, `sessions`, `mood_records`, `feedback`), and uses Pandas to load `backend/data/songs.csv` into SQLite if empty. |
| `data/songs.csv` | Initial song repository | 30 non-copyrighted sample tracks in Malayalam, Hindi, English, and Tamil covering genres (Melody, Pop, Rock, Classical, Dance) with pipe-separated mood and context tags. |
| `services/recommendation.py` | Recommendation engine | Implements weighted scoring algorithm. Inspects mood, language, genre, context, and feedback history to calculate a total score for each song and returns the top 10 ranked tracks. |
| `services/emotion.py` | Emotion analysis service | Handles image processing in-memory (no files written to disk). Dynamically imports `predict_emotion` from `backend/ai/emotion_model.py`; if not yet provided by teammates, safely falls back to a temporary neutral stub with full disclaimer notes. |
| `schemas/recommendation.py` | Recommendation schemas | `RecommendationRequest` and `SongResponse` Pydantic models. |
| `schemas/session.py` | Session & journey schemas | `SessionCreateRequest`, `SessionResponse`, `RecordMoodRequest`, `RecordMoodResponse`, and `JourneyResponse`. |
| `schemas/feedback.py` | Feedback schemas | `FeedbackRequest` and `FeedbackResponse` Pydantic models. |
| `schemas/emotion.py` | Emotion schemas | `EmotionResponse` Pydantic model with disclaimer note. |
| `api/recommendations.py` | Recommendations route | `POST /api/recommendations`: Validates modes (`match` vs `change`), enforces presence of `target_mood`, and calls recommendation service. |
| `api/sessions.py` | Session & journey routes | `POST /api/sessions`: creates session.<br>`POST /api/sessions/{id}/mood`: validates and logs mood point.<br>`GET /api/sessions/{id}/journey`: fetches chronological mood history for UI charts. |
| `api/feedback.py` | User feedback route | `POST /api/feedback`: logs `like`, `skip`, or `replay` actions for a song in a session. |
| `api/emotion.py` | Emotion detection route | `POST /api/emotion`: validates uploaded photo format, verifies non-empty payload, and calls emotion estimation service. |

---

## 3. How the Recommendation Scoring Works

The recommendation engine uses a **multi-factor weighted scoring algorithm**. Every song in the database starts with a base score of `0` and gains or loses points based on how closely it matches the user's current situation:

### The Weights (Named Constants in `services/recommendation.py`)
```python
MOOD_MATCH_WEIGHT = 3       # Song matches the active mood (+3)
LANGUAGE_MATCH_WEIGHT = 2   # Song matches user preferred language (+2)
GENRE_MATCH_WEIGHT = 2      # Song matches user preferred genre (+2)
CONTEXT_MATCH_WEIGHT = 1    # Song matches activity context (+1)

LIKE_WEIGHT = 2             # Song previously liked (+2)
REPLAY_WEIGHT = 1           # Song previously replayed (+1)
SKIP_PENALTY = -2           # Song previously skipped (-2)
```

### The Formula:
$$\text{Total Score} = S_{\text{mood}} + S_{\text{lang}} + S_{\text{genre}} + S_{\text{context}} + S_{\text{feedback}}$$

Where:
1. **Mood Matching ($S_{\text{mood}}$)**:
   - In **"match"** mode: Active mood = `current_mood`. If the song contains this mood tag $\rightarrow +3$.
   - In **"change"** mode: Active mood = `target_mood`. If the song contains the target mood tag $\rightarrow +3$ (guiding the user towards their desired emotional state).
2. **Metadata Matching**:
   - Matches preferred language $\rightarrow +2$.
   - Matches preferred genre $\rightarrow +2$.
   - Matches activity context (e.g., `study`, `workout`, `relax`) $\rightarrow +1$.
3. **Adaptive Feedback Loop ($S_{\text{feedback}}$)**:
   - For every prior `like` on that song $\rightarrow +2$.
   - For every prior `replay` on that song $\rightarrow +1$.
   - For every prior `skip` on that song $\rightarrow -2$.
4. **Ranking & Output**:
   - All songs are sorted in descending order of total score.
   - The top 10 songs are returned to the user.

---

## 4. How Sessions, Feedback, and Journey Connect

Here is how the user flow and data loop operate together:

```
                  +--------------------------------+
                  |  1. POST /api/sessions         |
                  |     (Initializes Session ID)   |
                  +---------------+----------------+
                                  |
                                  v
+---------------------------------+---------------------------------+
|  2. POST /api/sessions/{id}/mood                                  |
|     (User logs initial mood, e.g. "sad" from camera or manual)    |
+---------------------------------+---------------------------------+
                                  |
                                  v
+---------------------------------+---------------------------------+
|  3. POST /api/recommendations                                     |
|     (mode="change", target="happy" -> recommends uplift songs)    |
+---------------------------------+---------------------------------+
                                  |
                                  v
+---------------------------------+---------------------------------+
|  4. POST /api/feedback                                            |
|     (User likes/skips songs -> immediately updates song scores)   |
+---------------------------------+---------------------------------+
                                  |
                                  v
+---------------------------------+---------------------------------+
|  5. POST /api/sessions/{id}/mood (Recheck mood, e.g. "calm")      |
|     GET /api/sessions/{id}/journey                                |
|     (Retrieves timeline: sad -> neutral -> calm for chart)        |
+-------------------------------------------------------------------+
```

1. **Session Lifecycle**: When a listener opens the app, `POST /api/sessions` issues a clean integer `session_id`.
2. **Mood Tracking**: As the listener starts listening or checks in periodically, `POST /api/sessions/{id}/mood` logs their emotional status (`sad` $\rightarrow$ `neutral` $\rightarrow$ `happy`) tagged with the source (`manual`, `camera_suggested`, `recheck`).
3. **Visual Journey**: The frontend calls `GET /api/sessions/{id}/journey` to retrieve the entire mood history in chronological order, feeding directly into chart libraries (e.g., Chart.js or Recharts).
4. **Adaptive Personalization**: Each time the user interacts with a song (`like`, `skip`, or `replay`), `POST /api/feedback` stores the action in SQLite. The recommendation engine immediately reads these records, ensuring skipped tracks are penalized and liked songs are promoted.

---

## 5. Viva Preparation: Questions & Ready Answers

### Q1: Why did you choose SQLite and Pandas for the backend?
> *"SQLite is lightweight, serverless, self-contained, and built directly into Python standard library, making it ideal for our college project without requiring external database servers. We used Pandas to cleanly parse and validate the initial song catalog CSV and seed it into SQLite during application startup."*

### Q2: How does the recommendation system adapt to the user?
> *"It uses a hybrid weighted scoring system. Static features like genre, language, and context provide baseline relevance, while dynamic mood tags and user feedback (likes, skips, replays) adjust song weights in real-time. Skips apply a negative penalty, while likes and replays boost scores."*

### Q3: What is the difference between 'match' and 'change' modes?
> *"In 'match' mode, the user wants music that resonates with their current feeling (e.g., feeling calm and wanting calm ambient music). In 'change' mode, the user wants music to shift their state (e.g., feeling sad and wanting to transition to energetic music). The algorithm shifts its target mood tag accordingly."*

### Q4: How is camera emotion handled safely and ethically?
> *"Emotion detection is strictly optional and processed purely in-memory—no facial images are ever written to disk or stored. We also include a mandatory disclaimer that facial expression analysis is only an estimate and makes no psychological or medical claims."*

### Q5: How did you ensure your backend doesn't break your teammates' frontend and AI code?
> *"We adhered strictly to an API Contract (`docs/API_CONTRACT.md`) with explicit JSON schemas and CORS headers for Vite (`localhost:5173`). For the AI emotion component, we built a modular service that imports their `predict_emotion` function when available and gracefully defaults to a safe stub if their file hasn't been merged yet."*

