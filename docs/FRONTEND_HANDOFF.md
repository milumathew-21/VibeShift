# VibeShift — Complete Frontend Integration & Handoff Guide

**Document Version:** `1.0.0`  
**Frontend Scope:** Prapthi (Member 1) + Saakshi (Member 2) Combined Implementation  
**Git Branch:** `feature/frontend-combined`  
**Backend & AI Integration Reference:** [`docs/API_CONTRACT.md`](./API_CONTRACT.md)

---

## 1. Frontend Architecture

The VibeShift frontend is a modular Single-Page Application (SPA) built with **React 18**, **Vite 5**, **React Router 6**, **React Three Fiber / Three.js**, **Framer Motion**, **Recharts**, and a bespoke CSS design system.

```text
VibeShift/
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedMoodOrb.jsx      # Real 3D R3F/Drei orb + WebGL fallback + ErrorBoundary
│   │   │   ├── CameraPanel.jsx          # Explicit webcam capture (640x480 JPEG) & /api/emotion UI
│   │   │   ├── FeedbackControls.jsx     # Like, Skip, and Replay interaction buttons
│   │   │   ├── MoodCard.jsx             # Accessible mood selection card with gradient & icon
│   │   │   ├── MoodChart.jsx            # Categorical Recharts timeline & chronological log
│   │   │   ├── MoodModeSelector.jsx     # Match My Mood vs. Change My Mood selector
│   │   │   ├── MoodRecheckPanel.jsx     # In-session mood recheck drawer (source: "recheck")
│   │   │   ├── MusicPlayer.jsx          # Official Spotify Embed player + Demo Mode HTML5 synth
│   │   │   ├── Navigation.jsx           # Responsive header, mobile drawer & Live/Demo mode toggle
│   │   │   ├── PlaylistCard.jsx         # Recommendation card with metadata, tags & actions
│   │   │   ├── PreferenceForm.jsx       # Language, Genre & Context personalization selectors
│   │   │   ├── ProgressIndicator.jsx    # 5-step interactive workflow stepper
│   │   │   └── TargetMoodSelector.jsx   # Target mood picker for Change My Mood mode
│   │   ├── config/
│   │   │   └── constants.js             # Moods, languages, genres, contexts, Spotify URL parser
│   │   ├── context/
│   │   │   └── VibeShiftContext.jsx     # Centralized session, mood, preferences & player state
│   │   ├── hooks/
│   │   │   ├── useReducedMotion.js      # OS prefers-reduced-motion listener
│   │   │   └── useWebGLSupport.js       # WebGL capability & low-power hardware detector
│   │   ├── mocks/
│   │   │   ├── ambientAudioGenerator.js # Royalty-free procedural WAV synth for Demo Mode
│   │   │   ├── mockData.js              # Deterministic song subset from backend/data/songs.csv
│   │   │   └── mockEngine.js            # Standalone Demo Mode service handlers
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Welcome space, session snapshot & 6 quick actions
│   │   │   ├── Home.jsx                 # Animated 3D hero, How It Works, Bento features & previews
│   │   │   ├── MoodJourney.jsx          # Categorical mood history chart & chronological log
│   │   │   ├── MoodSelection.jsx        # Manual/camera mood selection, confirmation & preferences
│   │   │   └── Recommendations.jsx      # Playlist, Spotify player, feedback & mood recheck
│   │   ├── services/
│   │   │   ├── api.js                   # Centralized fetch wrapper, timeout & FastAPI detail parser
│   │   │   ├── emotionService.js        # POST /api/emotion multipart upload & status normalizer
│   │   │   ├── feedbackService.js       # POST /api/feedback client
│   │   │   ├── recommendationService.js # POST /api/recommendations client & array validator
│   │   │   └── sessionService.js        # POST /api/sessions, /{id}/mood & GET /{id}/journey
│   │   ├── styles/
│   │   │   └── index.css                # Light-themed glacier/mint/blush/navy design system
│   │   ├── test/
│   │   │   ├── setup.js                 # Vitest + Testing Library + jsdom polyfills
│   │   │   └── VibeShift.test.jsx       # Automated verification test suite
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
└── docs/
    └── FRONTEND_HANDOFF.md
```

---

## 2. Frontend Routes

| Route Path | Page Component | Responsibility |
|---|---|---|
| `/` | `Home.jsx` | Landing page with interactive 3D Mood Orb, *How It Works*, Key Features, interactive mood preview, and CTAs |
| `/dashboard` | `Dashboard.jsx` | *Welcome to your space.* Displays active session snapshot (or honest empty state) and 6 workflow action cards |
| `/discover` | `MoodSelection.jsx` | 4-stage guided flow: Manual/Camera Mood Selection → Mood Confirmation → Match/Change Mode & Target Mood → Preferences |
| `/recommendations` | `Recommendations.jsx` | Curated top-10 playlist, sticky Now Playing Spotify Embed player, Like/Skip/Replay feedback, Adaptive Refresh, and Optional Mood Recheck |
| `/journey` | `MoodJourney.jsx` | Session summary cards, Recharts categorical timeline chart, chronological check-in log, and ethical disclaimers |

---

## 3. Setup Commands

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Create local environment config (optional; defaults are preconfigured)
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Run development server at http://localhost:5173
npm run dev

# 5. Run automated tests
npm test

# 6. Build production bundle
npm run build
```

---

## 4. Environment Variables

Defined in `frontend/.env.example`:

- `VITE_API_BASE_URL=http://127.0.0.1:8000` — FastAPI backend base URL (all requests target `${VITE_API_BASE_URL}/api/...`).
- `VITE_API_MODE=live` — Default connection mode (`live` or `mock`). Users can also toggle between **Live API** and **Demo Mode** at any time from the top navigation bar.

---

## 5. API Endpoints Used & Exact Request/Response Formats

All network calls are centralized under `frontend/src/services/`.

### 5.1 Health Check (`GET /api/health`)
- **Response (`200 OK`):** `{"status": "ok"}`

### 5.2 Facial Expression Estimation (`POST /api/emotion`)
- **Request:** `multipart/form-data` with field `file` containing a JPEG/PNG/WEBP/BMP image (`<= 5 MB`).
- **Response (`200 OK`):**
  ```json
  {
    "emotion": "happy",
    "confidence": 0.88,
    "status": "success",
    "note": "This is only an estimate of facial expression, not proof of feelings."
  }
  ```

### 5.3 Create Listening Session (`POST /api/sessions`)
- **Request (`application/json`):**
  ```json
  {
    "language": "English",
    "genre": "Melody",
    "context": "relax"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "session_id": 1,
    "created_at": "2026-11-13 14:00:00"
  }
  ```

### 5.4 Record Confirmed Session Mood (`POST /api/sessions/{id}/mood`)
- **Request (`application/json`):**
  ```json
  {
    "mood": "calm",
    "source": "manual",
    "confidence": 1.0
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Mood recorded successfully",
    "session_id": 1,
    "mood": "calm",
    "source": "manual",
    "confidence": 1.0,
    "recorded_at": "2026-11-13 14:01:15"
  }
  ```

### 5.5 Fetch Song Recommendations (`POST /api/recommendations`)
- **Request (`application/json`):**
  ```json
  {
    "current_mood": "sad",
    "mode": "change",
    "target_mood": "calm",
    "language": "Malayalam",
    "genre": "Melody",
    "context": "relax"
  }
  ```
- **Response (`200 OK` — Top-level JSON Array):**
  ```json
  [
    {
      "id": 84,
      "title": "Akamalar (From \"PS-2\") [Malayalam]",
      "artist": "A.R. Rahman, Rafeeq Ahamed, Shakthisree Gopalan",
      "language": "Malayalam",
      "genre": "Melody",
      "mood_tags": ["calm"],
      "audio_url": "https://open.spotify.com/track/0xi39iiwgnflcUCx5E8IuR"
    }
  ]
  ```

### 5.6 Submit Song Feedback (`POST /api/feedback`)
- **Request (`application/json`):**
  ```json
  {
    "session_id": 1,
    "song_id": 84,
    "action": "like"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Feedback recorded successfully",
    "session_id": 1,
    "song_id": 84,
    "action": "like"
  }
  ```

### 5.7 Get Session Mood Journey (`GET /api/sessions/{id}/journey`)
- **Response (`200 OK`):**
  ```json
  {
    "session_id": 1,
    "entries": [
      {
        "mood": "sad",
        "source": "manual",
        "recorded_at": "2026-11-13 14:00:10"
      },
      {
        "mood": "calm",
        "source": "recheck",
        "recorded_at": "2026-11-13 14:15:00"
      }
    ]
  }
  ```

---

## 6. Camera Upload Format & Privacy Controls

- **Explicit Permission:** The camera never activates automatically on page load. Users must click **Enable Camera**.
- **Capture Resolution & Format:** Frames are drawn to an offscreen `<canvas>` at `640 × 480` and encoded via `canvas.toBlob(..., 'image/jpeg', 0.82)`.
- **Client-Side Upload Guard:** `emotionService.js` enforces a `5 MB` maximum file size and validates MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/bmp`) before sending `FormData` with field name `file`.
- **Track Cleanup:** All `MediaStream` tracks are stopped immediately after snapshot capture, when clicking **Turn Off Camera**, when switching to manual selection, or when unmounting `CameraPanel`.

---

## 7. Mood Labels, Facial Expression Mapping & Fallback Rules

- **Supported Backend Music Moods (`ALLOWED_MOODS`):**
  - `happy`, `sad`, `calm`, `energetic`, `angry`, `neutral`
- **AI Facial Expression Mappings (`EXPRESSION_TO_MOOD`):**
  - Automatically mapped by backend: `happy → happy`, `sad → sad`, `angry → angry`, `neutral → neutral`
  - Unmapped ambiguous expressions (`surprise`, `fear`, `disgust`): Backend returns `emotion: null`, `status: "success"`. Frontend prompts user to choose their mood manually.
  - Musical-only moods (`calm`, `energetic`): Selected manually by the user.
- **Strict Null & Confidence Handling:**
  - Whenever `emotion === null` or `status !== "success"` (`no_face_detected`, `low_confidence`, `face_detector_unavailable`, `model_weights_not_loaded`, `preprocessing_failed`, `invalid_image`, `error`), the frontend **never defaults silently to `neutral`** and never treats `confidence > 0` as proof of a valid music mood.

---

## 8. Supported Language, Genre & Context Values

- **Languages:**
  - Functional API values: `English`, `Malayalam`, `Hindi`, `Tamil` (or `null` for all supported languages).
  - Upcoming languages: `Kannada` and `Telugu` are visibly shown in the UI as *"Upcoming — awaiting backend catalogue support"* and disabled so users cannot accidentally send an unsupported filter.
- **Genres:** `Melody`, `Pop`, `Rock`, `Classical`, `Dance` (or `null`).
- **Listening Contexts:**
  - UI Labels → API Values: `Relaxing → relax`, `Studying → study`, `Workout → workout`, `Traveling → travel`, `Party → party`, `Sleeping → sleep` (or `null`).

---

## 9. Session Handling

- A session is created via `POST /api/sessions` once when the user launches their recommendations (or records an interaction) and stored in `VibeShiftContext` (`sessionId`).
- A promise lock (`sessionCreationPromiseRef`) prevents duplicate sessions under React 18 StrictMode double-invocations.
- Switching between **Live API** and **Demo Mode** resets `sessionId` so mock session IDs are never sent to the real SQLite database or vice versa.

---

## 10. Spotify Playback Behavior

- `parseSpotifyTrackUrl()` validates `https://open.spotify.com/track/<TRACK_ID>` URLs and rejects placeholder links such as `https://open.spotify.com/track/EXAMPLE`.
- Valid track IDs are rendered inside Spotify's official embed iframe (`https://open.spotify.com/embed/track/<TRACK_ID>?utm_source=generator`) alongside an **Open in Spotify** external link.
- Spotify URLs are **never** passed to an HTML5 `<audio>` element, and no fake play/pause/seek/volume sliders are overlaid on top of the Spotify iframe.
- In **Standalone Demo Mode**, users can also switch to the **Demo Ambient Synth (HTML5)** tab in `MusicPlayer`, which synthesizes a royalty-free mood chord pad WAV in memory to demonstrate genuine HTML5 `<audio>` controls (`play`, `pause`, `seek`, `duration`, `volume`, `mute`, and `replay`).

---

## 11. Mood Journey Data Format & Scientific Accuracy

- `MoodChart.jsx` consumes `{ session_id, entries: [{ mood, source, recorded_at }] }` from `GET /api/sessions/{id}/journey`.
- Moods are plotted on six categorical horizontal lanes (`Happy`, `Energetic`, `Calm`, `Neutral`, `Sad`, `Angry`) rather than fabricating numerical emotional scores.
- Prominent disclaimers clarify that entries represent user-confirmed categorical check-ins (`manual`, `camera_suggested`, `recheck`), not clinical measurements or proof that music caused an emotional change.

---

## 12. Standalone Mock / Demo Mode Instructions

- Click **Demo Mode** in the top navigation bar (or set `VITE_API_MODE=mock` in `.env`).
- Demo Mode enables the complete 15-step user journey offline using deterministic songs from `backend/data/songs.csv` and explicit simulated `/api/emotion` status scenarios (`happy_success`, `surprise_unmapped`, `no_face_detected`, `low_confidence`, etc.).
- Live API failures **never** silently fall back to Demo Mode; instead, an error alert informs the user and offers an explicit **Switch to Standalone Demo Mode** button.

---

## 13. Backend Integration Testing Status

- Automated unit & integration tests (`src/test/VibeShift.test.jsx`), production Vite bundle compilation (`npm run build`), and live end-to-end API verification status are documented in the Final Delivery Report.

---

## 14. Remaining Coordination Notes (Milu & Nethra)

- **No blocking discrepancies found** between `docs/API_CONTRACT.md`, `backend/api/*`, and `backend/ai/*`.
- **Optional Future Enhancements (Non-blocking):**
  - **COMMUNICATION NOTE — NETHRA:** When `Kannada` and `Telugu` tracks are added to `backend/data/songs.csv`, let the frontend team know so we can flip `supported: true` on those two entries in `frontend/src/config/constants.js`.
  - **COMMUNICATION NOTE — NETHRA:** `POST /api/recommendations` currently scores feedback globally across all sessions (`get_feedback_scores(session_id=None)`). If `session_id` is added to `RecommendationRequest` in a future iteration, the frontend already tracks `sessionId` in `VibeShiftContext` and can pass it immediately.

