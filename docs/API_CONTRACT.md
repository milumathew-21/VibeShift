# VibeShift API Contract

This document provides the complete API specification for the VibeShift backend. All endpoints are prefixed with `/api` and run on `http://127.0.0.1:8000`.

CORS is enabled for the frontend React/Vite development server (`http://localhost:5173`).

---

## Summary of All Endpoints

| # | Method | URL Path | Purpose |
|---|--------|----------|---------|
| 1 | `GET` | `/api/health` | Server health check |
| 2 | `POST` | `/api/recommendations` | Get weighted song recommendations (Spotify links) |
| 3 | `POST` | `/api/sessions` | Create a new user listening session |
| 4 | `POST` | `/api/sessions/{id}/mood` | Log a confirmed mood in the session journey |
| 5 | `GET` | `/api/sessions/{id}/journey` | Retrieve mood timeline history for charts |
| 6 | `POST` | `/api/feedback` | Record user feedback (like, skip, replay) |
| 7 | `POST` | `/api/emotion` | Estimate emotion from uploaded facial photo |

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

> **Important Note on `audio_url`**:  
> The `audio_url` field provides a **Spotify track link** (e.g. `https://open.spotify.com/track/...`), not an audio file path.  
> The frontend should **open or embed** it (using a Spotify embed iframe or opening the link), **not** play it as a raw audio file.

- **Content-Type**: `application/json`

#### Request Body
```json
{
  "current_mood": "happy",
  "mode": "match",
  "target_mood": null,
  "language": "English",
  "genre": "Pop",
  "context": "workout"
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
    "id": 1,
    "title": "Big Dawgs",
    "artist": "Hanumankind, Kalmi",
    "language": "English",
    "genre": "Pop",
    "mood_tags": [
      "angry",
      "energetic"
    ],
    "audio_url": "https://open.spotify.com/track/0OA00aPt3BV10qeMIs3meW"
  },
  {
    "id": 2,
    "title": "Bye Bye Bye - From Deadpool and Wolverine Soundtrack",
    "artist": "*NSYNC",
    "language": "English",
    "genre": "Pop",
    "mood_tags": [
      "happy",
      "energetic"
    ],
    "audio_url": "https://open.spotify.com/track/62bOmKYxYg7dhrC6gH9vFn"
  }
]
```

#### Response Item Fields
| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique song ID |
| `title` | string | Song title |
| `artist` | string | Artist name |
| `language` | string | Song language |
| `genre` | string | Song genre |
| `mood_tags` | array of strings | Mood tags associated with the song (e.g. `["happy", "energetic"]`) |
| `audio_url` | string | **Spotify track link** (`https://open.spotify.com/track/...`). Open or embed in Spotify player. |

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
  "language": "English",
  "genre": "Pop",
  "context": "workout"
}
```

#### Success Response (`201 Created`)
```json
{
  "session_id": 1,
  "created_at": "2026-11-13 07:20:00"
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
  "recorded_at": "2026-11-13 07:21:15"
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
      "recorded_at": "2026-11-13 07:20:10"
    },
    {
      "mood": "neutral",
      "source": "recheck",
      "recorded_at": "2026-11-13 07:35:00"
    },
    {
      "mood": "calm",
      "source": "camera_suggested",
      "recorded_at": "2026-11-13 07:50:30"
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
Uploads a user facial photo in-memory to estimate current facial expression using `backend.ai.predict`. Images are processed entirely in memory and **never saved to disk**.

- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: Image binary (`.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`)

---

### Expression-to-Mood Mapping Table (`EXPRESSION_TO_MOOD`)

Only clear, unambiguous expressions automatically map to a music mood. Ambiguous or high-arousal expressions (`surprise`, `fear`, `disgust`) have **no automatic mood**.

> **Frontend Rule**:  
> Whenever `emotion` is `null`, the frontend **must show the manual mood picker**. The system **never returns neutral silently**.

| AI Expression | Mapped Mood (`emotion`) | Automatic? | Note / Frontend Action |
|---|---|---|---|
| `happy` | `"happy"` | Yes | Mapped automatically with standard disclaimer |
| `sad` | `"sad"` | Yes | Mapped automatically with standard disclaimer |
| `angry` | `"angry"` | Yes | Mapped automatically with standard disclaimer |
| `neutral` | `"neutral"` | Yes | Mapped automatically with standard disclaimer |
| `surprise` | `null` | **No** | No automatic mood. Frontend must show manual mood picker. |
| `fear` | `null` | **No** | No automatic mood. Frontend must show manual mood picker. |
| `disgust` | `null` | **No** | No automatic mood. Frontend must show manual mood picker. |
| *`calm`* | — | — | **Manual choice only** (not detected from camera facial expressions). |
| *`energetic`* | — | — | **Manual choice only** (not detected from camera facial expressions). |

---

### Detection Status Values (`status`)

The `status` field returns the exact status string from the AI detection pipeline:

| Status Value | Meaning | Resulting `emotion` | Frontend Requirement |
|---|---|---|---|
| `success` | Face detected and decisive prediction made | Mapped mood, or `null` if surprise/fear/disgust | If `emotion` is `null`, show manual mood picker |
| `no_face_detected` | Detector is operational, but no human face was found | `null` | Show manual mood picker |
| `low_confidence` | Face found, but prediction confidence is below threshold | `null` | Show manual mood picker |
| `model_weights_not_loaded` | Pretrained AI model weights are not loaded; inference safely blocked | `null` | Show manual mood picker |
| `face_detector_unavailable` | OpenCV Haar cascade or detector classifier missing | `null` | Show manual mood picker |
| `preprocessing_failed` | Face bounding box could not be cropped or normalized | `null` | Show manual mood picker |
| `invalid_image` | Image input could not be decoded or was malformed | `null` | Show manual mood picker |
| `error` | Unexpected exception caught during processing | `null` | Show manual mood picker |

---

#### Response Schema

| Field | Type | Description |
|---|---|---|
| `emotion` | string or `null` | Detected music mood (`"happy"`, `"sad"`, `"angry"`, `"neutral"`), or `null` if unmapped, low confidence, or failed |
| `confidence` | float | Confidence score between `0.0` and `1.0` (rounded to 2 decimal places) |
| `status` | string | Exact status value from AI pipeline (see table above) |
| `note` | string | Disclaimer or user guidance prompt (asks user to choose mood manually when `emotion` is `null`) |

---

#### Sample Responses (`200 OK`)

**1. Successful Mapping (`happy`):**
```json
{
  "emotion": "happy",
  "confidence": 0.88,
  "status": "success",
  "note": "This is only an estimate of facial expression, not proof of feelings."
}
```

**2. Ambiguous Expression (`surprise` -> unmapped, returns `null`):**
```json
{
  "emotion": null,
  "confidence": 0.76,
  "status": "success",
  "note": "Detected facial expression is 'surprise', which has no direct music mood mapping. Please choose your mood manually."
}
```

**3. No Face Detected (`no_face_detected` -> returns `null`):**
```json
{
  "emotion": null,
  "confidence": 0.0,
  "status": "no_face_detected",
  "note": "No face was detected in the photo. Please choose your mood manually."
}
```

**4. Low Confidence (`low_confidence` -> returns `null`):**
```json
{
  "emotion": null,
  "confidence": 0.28,
  "status": "low_confidence",
  "note": "Facial expression confidence is low. Please choose your mood manually."
}
```

---

#### Error Responses
- **`400 Bad Request`**: Uploaded file is not an image or is an empty file.
  ```json
  {
    "detail": "Invalid file format. Please upload a valid image file (JPEG, PNG, or WEBP)."
  }
  ```
  or
  ```json
  {
    "detail": "The uploaded image file is empty. Please upload a valid image."
  }
  ```
