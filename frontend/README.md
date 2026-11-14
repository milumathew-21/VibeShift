# VibeShift — Adaptive Music Recommendation Frontend

**Developers:** Prapthi (Member 1) & Saakshi (Member 2)  
**Branch:** `feature/frontend-combined`  
**Stack:** React 18 · Vite 5 · React Router 6 · React Three Fiber & Drei · Framer Motion · Recharts · Lucide React

---

## 1. Overview

This directory contains the complete frontend application for **VibeShift**, an AI-powered adaptive music recommendation platform that curates songs across **English, Malayalam, Hindi, and Tamil** based on user-confirmed moods, vibe direction (**Match My Mood** vs. **Change My Mood**), and listening preferences.

### Key Capabilities
- **Interactive 3D Mood Resonance Orb:** Built with React Three Fiber (`@react-three/fiber` & `@react-three/drei`) with pointer-responsive movement, mood-reactive color harmonies, reduced-motion compliance, and an automatic WebGL fallback.
- **Dual Mood Input (Manual & Optional Webcam):** Supports six backend-validated moods (`happy`, `sad`, `calm`, `energetic`, `angry`, `neutral`) plus an optional, privacy-first webcam capture (`640×480` JPEG in-memory upload to `POST /api/emotion`).
- **Explicit Mood Confirmation:** Users always review and confirm or override their mood before recommendations are requested. Unmapped expressions (`surprise`, `fear`, `disgust`) or detection issues (`no_face_detected`, `low_confidence`, etc.) never silently default to `neutral`.
- **Match or Shift Vibe Direction:** Supports `match` and `change` modes, requiring a target mood in `change` mode and automatically clearing `target_mood` when switching back to `match`.
- **Multilingual & Contextual Personalization:** Supports `English`, `Malayalam`, `Hindi`, and `Tamil` (with `Kannada` and `Telugu` visibly marked as upcoming catalogue expansions so invalid filters are never sent), five genres (`Melody`, `Pop`, `Rock`, `Classical`, `Dance`), and six listening contexts (`relax`, `study`, `workout`, `travel`, `party`, `sleep`).
- **Official Spotify Embed Playback:** Parses and validates Spotify track URLs (`https://open.spotify.com/track/<ID>`) into official Spotify Embed iframes plus an **Open in Spotify** action. Never passes Spotify URLs into an HTML `<audio>` element.
- **Interactive Feedback & Mood Rechecks:** Connects `like`, `skip`, and `replay` actions to `POST /api/feedback`, supports in-session mood rechecks (`source: "recheck"`), and visualizes chronological categorical mood history on the **Mood Journey** page (`GET /api/sessions/{id}/journey`).
- **Explicit Standalone Demo Mode:** Includes a toggleable **Demo Mode** powered by deterministic songs from `backend/data/songs.csv` and a royalty-free procedural WAV synth for local HTML5 audio testing when the FastAPI backend is offline.

---

## 2. Quick Start

### Prerequisites
- **Node.js** `v18+` (tested with `v24.11.1`) and **npm** `v9+`
- *(Optional for Live API Mode)* Python FastAPI backend running at `http://127.0.0.1:8000`

### Installation & Development Server

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite development server at `http://localhost:5173` |
| `npm run build` | Builds production bundle into `frontend/dist` |
| `npm run preview` | Previews production bundle at `http://localhost:4173` |
| `npm test` | Runs automated Vitest + React Testing Library suite |

---

## 3. Environment Variables (`.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Base URL of Nethra's FastAPI backend |
| `VITE_API_MODE` | `live` | Initial mode: `live` (real FastAPI backend) or `mock` (Standalone Demo Mode) |

For full architectural and API integration details, see [`../docs/FRONTEND_HANDOFF.md`](../docs/FRONTEND_HANDOFF.md).

