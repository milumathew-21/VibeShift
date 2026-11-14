/**
 * VibeShift — Session & Mood Journey Service (src/services/sessionService.js)
 * Connects to:
 * - POST /api/sessions
 * - POST /api/sessions/{id}/mood
 * - GET /api/sessions/{id}/journey
 */

import { apiRequest, ApiError } from './api';
import {
  MOOD_IDS,
  SUPPORTED_LANGUAGE_VALUES,
  SUPPORTED_GENRE_VALUES,
  SUPPORTED_CONTEXT_VALUES,
} from '../config/constants';
import {
  mockCreateSession,
  mockRecordSessionMood,
  mockGetSessionJourney,
} from '../mocks/mockEngine';

export function isValidSessionId(sessionId) {
  const num = Number(sessionId);
  return Number.isInteger(num) && num > 0;
}

/**
 * Initialize a new listening session (`POST /api/sessions`)
 */
export async function createListeningSession(
  { language = null, genre = null, context = null } = {},
  { apiMode = 'live' } = {}
) {
  const payload = {
    language:
      language && SUPPORTED_LANGUAGE_VALUES.includes(language) ? language : null,
    genre: genre && SUPPORTED_GENRE_VALUES.includes(genre) ? genre : null,
    context:
      context && SUPPORTED_CONTEXT_VALUES.includes(context) ? context : null,
  };

  if (apiMode === 'mock') {
    const mockRes = await mockCreateSession(payload);
    return {
      session_id: Number(mockRes.session_id),
      created_at: String(mockRes.created_at),
      isMock: true,
    };
  }

  const raw = await apiRequest('/api/sessions', {
    method: 'POST',
    body: payload,
  });

  if (!raw || !isValidSessionId(raw.session_id)) {
    throw new ApiError('Invalid session response from server.', { status: 500 });
  }

  return {
    session_id: Number(raw.session_id),
    created_at: String(raw.created_at || ''),
    isMock: false,
  };
}

/**
 * Record a user-confirmed mood entry (`POST /api/sessions/{id}/mood`)
 */
export async function recordSessionMood(
  sessionId,
  { mood, source = 'manual', confidence = 1.0 },
  { apiMode = 'live' } = {}
) {
  if (!isValidSessionId(sessionId)) {
    throw new ApiError('A valid session ID is required to record mood.', {
      status: 400,
    });
  }

  const cleanMood = String(mood || '')
    .trim()
    .toLowerCase();
  if (!MOOD_IDS.includes(cleanMood)) {
    throw new ApiError(
      `Invalid mood '${mood}'. Allowed moods: ${MOOD_IDS.join(', ')}.`,
      { status: 400 }
    );
  }

  const cleanSource = ['manual', 'camera_suggested', 'recheck'].includes(source)
    ? source
    : 'manual';

  const cleanConfidence =
    typeof confidence === 'number' && !Number.isNaN(confidence)
      ? Math.max(0, Math.min(1, confidence))
      : 1.0;

  const payload = {
    mood: cleanMood,
    source: cleanSource,
    confidence: cleanConfidence,
  };

  if (apiMode === 'mock') {
    const mockRes = await mockRecordSessionMood(Number(sessionId), payload);
    return {
      ...mockRes,
      isMock: true,
    };
  }

  const raw = await apiRequest(`/api/sessions/${Number(sessionId)}/mood`, {
    method: 'POST',
    body: payload,
  });

  return {
    ...raw,
    isMock: false,
  };
}

/**
 * Retrieve chronological mood journey (`GET /api/sessions/{id}/journey`)
 */
export async function fetchSessionJourney(
  sessionId,
  { apiMode = 'live' } = {}
) {
  if (!isValidSessionId(sessionId)) {
    throw new ApiError(
      'No active session ID found. Start a session to view your Mood Journey.',
      { status: 400 }
    );
  }

  if (apiMode === 'mock') {
    const mockRes = await mockGetSessionJourney(Number(sessionId));
    return {
      session_id: Number(mockRes.session_id),
      entries: Array.isArray(mockRes.entries) ? mockRes.entries : [],
      isMock: true,
    };
  }

  const raw = await apiRequest(`/api/sessions/${Number(sessionId)}/journey`, {
    method: 'GET',
  });

  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.entries)) {
    throw new ApiError('Unexpected response shape from /api/sessions/journey.', {
      status: 500,
    });
  }

  return {
    session_id: Number(raw.session_id),
    entries: raw.entries.map((entry) => ({
      mood: String(entry.mood || '').toLowerCase(),
      source: String(entry.source || 'manual').toLowerCase(),
      recorded_at: String(entry.recorded_at || ''),
    })),
    isMock: false,
  };
}

