/**
 * VibeShift — Standalone Demo Mode Engine
 * Used ONLY when the user explicitly enables Standalone Demo / Mock Mode.
 * Never invoked silently on live API failure.
 */

import { MOCK_SONGS, MOCK_EMOTION_SCENARIOS } from './mockData';
import { MOOD_IDS } from '../config/constants';

let mockSessionCounter = 100;
const mockSessions = new Map();
const mockJourneyEntries = new Map();
const mockFeedbackRecords = [];

function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

export function resetMockState() {
  mockSessionCounter = 100;
  mockSessions.clear();
  mockJourneyEntries.clear();
  mockFeedbackRecords.length = 0;
}

export async function mockCreateSession(payload = {}) {
  mockSessionCounter += 1;
  const session_id = mockSessionCounter;
  const created_at = formatTimestamp();

  mockSessions.set(session_id, {
    session_id,
    language: payload.language || null,
    genre: payload.genre || null,
    context: payload.context || null,
    created_at,
  });
  mockJourneyEntries.set(session_id, []);

  return {
    session_id,
    created_at,
  };
}

export async function mockRecordSessionMood(sessionId, payload) {
  const numericId = Number(sessionId);
  const moodClean = String(payload?.mood || '')
    .trim()
    .toLowerCase();

  if (!MOOD_IDS.includes(moodClean)) {
    const err = new Error(
      `Invalid mood '${payload?.mood}'. Allowed moods are: ${MOOD_IDS.slice()
        .sort()
        .join(', ')}.`
    );
    err.status = 400;
    throw err;
  }

  if (!mockSessions.has(numericId)) {
    // Auto-initialize in mock mode if user restored session ID from state
    mockSessions.set(numericId, {
      session_id: numericId,
      created_at: formatTimestamp(),
    });
    mockJourneyEntries.set(numericId, []);
  }

  const sourceClean = String(payload?.source || 'manual')
    .trim()
    .toLowerCase();
  const confidence =
    payload?.confidence === undefined || payload?.confidence === null
      ? 1.0
      : Number(payload.confidence);
  const recorded_at = formatTimestamp();

  const entry = {
    mood: moodClean,
    source: sourceClean,
    recorded_at,
  };

  const existing = mockJourneyEntries.get(numericId) || [];
  existing.push(entry);
  mockJourneyEntries.set(numericId, existing);

  return {
    message: 'Mood recorded successfully (Demo Mode)',
    session_id: numericId,
    mood: moodClean,
    source: sourceClean,
    confidence,
    recorded_at,
  };
}

export async function mockGetSessionJourney(sessionId) {
  const numericId = Number(sessionId);
  if (!mockSessions.has(numericId)) {
    const err = new Error(`Session with ID ${numericId} not found.`);
    err.status = 404;
    throw err;
  }

  const entries = mockJourneyEntries.get(numericId) || [];
  return {
    session_id: numericId,
    entries: [...entries],
  };
}

export async function mockRecordFeedback(payload) {
  const numericSessionId = Number(payload?.session_id);
  const numericSongId = Number(payload?.song_id);
  const actionClean = String(payload?.action || '')
    .trim()
    .toLowerCase();

  if (!['like', 'skip', 'replay'].includes(actionClean)) {
    const err = new Error(
      `Invalid action '${payload?.action}'. Allowed actions are: like, replay, skip.`
    );
    err.status = 400;
    throw err;
  }

  mockFeedbackRecords.push({
    session_id: numericSessionId,
    song_id: numericSongId,
    action: actionClean,
    timestamp: formatTimestamp(),
  });

  return {
    message: 'Feedback recorded successfully (Demo Mode)',
    session_id: numericSessionId,
    song_id: numericSongId,
    action: actionClean,
  };
}

export async function mockGetRecommendations(payload) {
  const mode = payload?.mode || 'match';
  if (!['match', 'change'].includes(mode)) {
    const err = new Error(
      `Invalid mode '${mode}'. Mode must be either 'match' or 'change'.`
    );
    err.status = 400;
    throw err;
  }

  if (mode === 'change' && (!payload?.target_mood || !payload.target_mood.trim())) {
    const err = new Error("target_mood is required when mode is 'change'.");
    err.status = 400;
    throw err;
  }

  const effectiveMood = String(
    mode === 'change' ? payload.target_mood : payload.current_mood || 'happy'
  )
    .trim()
    .toLowerCase();
  const preferredLang = (payload?.language || '').trim().toLowerCase();
  const preferredGenre = (payload?.genre || '').trim().toLowerCase();
  const preferredContext = (payload?.context || '').trim().toLowerCase();

  // Compute deterministic demo ranking (skips pushed down, likes boosted)
  const feedbackMap = new Map();
  for (const fb of mockFeedbackRecords) {
    const prev = feedbackMap.get(fb.song_id) || 0;
    if (fb.action === 'like') feedbackMap.set(fb.song_id, prev + 2);
    else if (fb.action === 'replay') feedbackMap.set(fb.song_id, prev + 1);
    else if (fb.action === 'skip') feedbackMap.set(fb.song_id, prev - 2);
  }

  const ranked = MOCK_SONGS.map((song) => {
    let rank = 0;
    if (song.mood_tags.some((t) => t.toLowerCase() === effectiveMood)) rank += 3;
    if (preferredLang && song.language.toLowerCase() === preferredLang) rank += 2;
    if (preferredGenre && song.genre.toLowerCase() === preferredGenre) rank += 2;
    if (
      preferredContext &&
      song.context_tags?.some((c) => c.toLowerCase() === preferredContext)
    ) {
      rank += 1;
    }
    rank += feedbackMap.get(song.id) || 0;

    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      language: song.language,
      genre: song.genre,
      mood_tags: [...song.mood_tags],
      audio_url: song.audio_url,
      _rank: rank,
    };
  });

  ranked.sort((a, b) => {
    if (b._rank !== a._rank) return b._rank - a._rank;
    return a.id - b.id;
  });

  return ranked.slice(0, 10).map(({ _rank, ...rest }) => rest);
}

export async function mockEstimateEmotion(_file, scenarioId = 'happy_success') {
  const found =
    MOCK_EMOTION_SCENARIOS.find((s) => s.id === scenarioId) ||
    MOCK_EMOTION_SCENARIOS[0];
  return { ...found.response };
}

