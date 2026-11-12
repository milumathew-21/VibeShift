# VibeShift API Contract

This document provides the complete API specification for the VibeShift backend. All endpoints are prefixed with `/api` and run on `http://127.0.0.1:8000`.

CORS is enabled for the frontend React/Vite development server (`http://localhost:5173`).

---

## Summary of All Endpoints

| # | Method | URL Path | Purpose |
|---|--------|----------|---------|
| 1 | `GET` | `/api/health` | Server health check |
| 2 | `POST` | `/api/recommendations` | Get weighted song recommendations |
| 3 | `POST` | `/api/sessions` | Create a new user listening session |
| 4 | `POST` | `/api/sessions/{id}/mood` | Log a confirmed mood in the session journey |
| 5 | `GET` | `/api/sessions/{id}/journey` | Retrieve mood timeline history for charts |
| 6 | `POST` | `/api/feedback` | Record user feedback (like, skip, replay) |
| 7 | `POST` | `/api/emotion` | Estimate emotion from uploaded facial image |

---

## 1. Health Check

### `GET /api/health`
Checks whether the backend server is operational.

- **Request Headers**: None
- **Request Body**: None

#### Success Response (`200 OK`)
```json
{
  "status": "ok"
}
```

---

## 2. Song Recommendations

### `POST /api/recommendations`
Returns the top 10 recommended songs based on user mood, preferences, and feedback history.

- **Content-Type**: `application/json`

#### Request Body
```json
{
  "current_mood": "happy",
  "mode": "match",
  "target_mood": null,
  "language": "Malayalam",
  "genre": "Pop",
  "context": "travel"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `current_mood` | string | Yes | Current detected or chosen mood (`happy`, `sad`, `calm`, `energetic`, `angry`, `neutral`) |
| `mode` | string | No (default: `"match"`) | `"match"` (stay in mood) or `"change"` (shift towards target mood) |
| `target_mood` | string / null | Required if mode is `"change"` | Desired target mood when mode is `"change"` |
| `language` | string / null | No | Preferred language filter (`Malayalam`, `Hindi`, `English`, `Tamil`) |
| `genre` | string / null | No | Preferred genre filter (`Melody`, `Pop`, `Rock`, `Classical`, `Dance`) |
| `context` | string / null | No | Activity context (`relax`, `study`, `workout`, `travel`, `party`, `sleep`) |

#### Success Response (`200 OK`)
```json
[
  {
    "id": 5,
    "title": "Coastal Breeze",
    "artist": "Ananya Menon",
    "language": "Malayalam",
    "genre": "Pop",
    "mood_tags": [
      "happy",
      "energetic"
    ],
    "audio_url": "/audio/sample5.mp3"
  },
  {
    "id": 1,
    "title": "Morning Dew",
    "artist": "Arun Kumar",
    "language": "Malayalam",
    "genre": "Melody",
    "mood_tags": [
      "calm",
      "happy"
    ],
    "audio_url": "/audio/sample1.mp3"
  }
]
```

#### Error Responses
- **`400 Bad Request`**: When `mode` is not `"match"` or `"change"`, or when `mode` is `"change"` and `target_mood` is missing.
  ```json
  {
    "detail": "target_mood is required when mode is 'change'."
  }
  ```

---

## 3. Create Session

### `POST /api/sessions`
Initializes a new listening session for tracking mood transitions and feedback.

- **Content-Type**: `application/json`

#### Request Body (All fields optional)
```json
{
  "language": "Malayalam",
  "genre": "Melody",
  "context": "relax"
}
```

#### Success Response (`201 Created`)
```json
{
  "session_id": 1,
  "created_at": "2026-11-12 11:20:00"
}
```

---

## 4. Record Session Mood

### `POST /api/sessions/{id}/mood`
Records a confirmed mood entry into the session journey.

- **Path Parameter**: `id` (integer, required) - Session ID
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "mood": "sad",
  "source": "manual",
  "confidence": 0.95
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `mood` | string | Yes | One of: `happy`, `sad`, `calm`, `energetic`, `angry`, `neutral` |
| `source` | string | No (default: `"manual"`) | One of: `manual`, `camera_suggested`, `recheck` |
| `confidence` | float | No (default: `1.0`) | Value between `0.0` and `1.0` |

#### Success Response (`200 OK`)
```json
{
  "message": "Mood recorded successfully",
  "session_id": 1,
  "mood": "sad",
  "source": "manual",
  "confidence": 0.95,
  "recorded_at": "2026-11-12 11:21:15"
}
```

#### Error Responses
- **`400 Bad Request`**: Invalid mood or invalid source.
  ```json
  {
    "detail": "Invalid mood 'excited'. Allowed moods are: angry, calm, energetic, happy, neutral, sad."
  }
  ```
- **`404 Not Found`**: Session ID does not exist.
  ```json
  {
    "detail": "Session with ID 99 not found."
  }
  ```

---

## 5. Get Session Mood Journey

### `GET /api/sessions/{id}/journey`
Retrieves the chronological mood timeline for a session (oldest first), designed for frontend progress charts.

- **Path Parameter**: `id` (integer, required) - Session ID
- **Request Body**: None

#### Success Response (`200 OK`)
```json
{
  "session_id": 1,
  "entries": [
    {
      "mood": "sad",
      "source": "manual",
      "recorded_at": "2026-11-12 11:20:10"
    },
    {
      "mood": "neutral",
      "source": "recheck",
      "recorded_at": "2026-11-12 11:35:00"
    },
    {
      "mood": "calm",
      "source": "camera_suggested",
      "recorded_at": "2026-11-12 11:50:30"
    }
  ]
}
```
*Note: If no moods have been recorded yet for an existing session, an empty list `{"session_id": 1, "entries": []}` is returned.*

#### Error Responses
- **`404 Not Found`**: Session ID does not exist.
  ```json
  {
    "detail": "Session with ID 99 not found."
  }
  ```

---

## 6. Record Song Feedback

### `POST /api/feedback`
Records user interactions on a song (`like`, `skip`, or `replay`). These actions immediately influence subsequent recommendation scoring.

- **Content-Type**: `application/json`

#### Request Body
```json
{
  "session_id": 1,
  "song_id": 5,
  "action": "like"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | integer | Yes | ID of the active session |
| `song_id` | integer | Yes | ID of the song |
| `action` | string | Yes | One of: `"like"`, `"skip"`, `"replay"` |

#### Success Response (`200 OK`)
```json
{
  "message": "Feedback recorded successfully",
  "session_id": 1,
  "song_id": 5,
  "action": "like"
}
```

#### Error Responses
- **`400 Bad Request`**: Action is not `"like"`, `"skip"`, or `"replay"`.
  ```json
  {
    "detail": "Invalid action 'love'. Allowed actions are: like, replay, skip."
  }
  ```
- **`404 Not Found`**: Session or song does not exist.
  ```json
  {
    "detail": "Session with ID 99 not found."
  }
  ```
  or
  ```json
  {
    "detail": "Song with ID 999 not found."
  }
  ```

---

## 7. Estimate Emotion from Facial Image

### `POST /api/emotion`
Uploads a user photo in-memory to estimate current facial expression. Images are never saved to disk.

- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: Image binary (`.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`)

#### Success Response (`200 OK`)
```json
{
  "emotion": "neutral",
  "confidence": 0.0,
  "note": "This is only an estimate of facial expression, not proof of feelings. Camera emotion estimation is optional and provides visual cues only, with no medical or diagnostic claims."
}
```

#### Error Responses
- **`400 Bad Request`**: Uploaded file is not an image or is an empty file.
  ```json
  {
    "detail": "Invalid file format. Please upload a valid image file (JPEG, PNG, or WEBP)."
  }
  ```
- **`500 Internal Server Error`**: Unexpected error during processing.

