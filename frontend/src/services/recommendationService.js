/**
 * VibeShift — Recommendation Service (src/services/recommendationService.js)
 * Connects to POST /api/recommendations and validates top-level JSON array response.
 */

import { apiRequest, ApiError } from './api';
import {
  MOOD_IDS,
  SUPPORTED_LANGUAGE_VALUES,
  SUPPORTED_GENRE_VALUES,
  SUPPORTED_CONTEXT_VALUES,
} from '../config/constants';
import { mockGetRecommendations } from '../mocks/mockEngine';

/**
 * Validate and build clean payload for POST /api/recommendations
 */
export function buildRecommendationPayload({
  currentMood,
  mode = 'match',
  targetMood = null,
  language = null,
  genre = null,
  context = null,
}) {
  const cleanMood = String(currentMood || '')
    .trim()
    .toLowerCase();
  if (!MOOD_IDS.includes(cleanMood)) {
    throw new ApiError(
      `Please select a valid current mood (${MOOD_IDS.join(', ')}).`,
      { status: 400 }
    );
  }

  const cleanMode = String(mode || 'match')
    .trim()
    .toLowerCase();
  if (!['match', 'change'].includes(cleanMode)) {
    throw new ApiError("Mode must be either 'match' or 'change'.", {
      status: 400,
    });
  }

  let cleanTarget = null;
  if (cleanMode === 'change') {
    cleanTarget = String(targetMood || '')
      .trim()
      .toLowerCase();
    if (!MOOD_IDS.includes(cleanTarget)) {
      throw new ApiError(
        'Please select a valid target mood when Change My Mood mode is active.',
        { status: 400 }
      );
    }
  }

  const cleanLanguage =
    language && SUPPORTED_LANGUAGE_VALUES.includes(language) ? language : null;
  const cleanGenre =
    genre && SUPPORTED_GENRE_VALUES.includes(genre) ? genre : null;
  const cleanContext =
    context && SUPPORTED_CONTEXT_VALUES.includes(context) ? context : null;

  return {
    current_mood: cleanMood,
    mode: cleanMode,
    target_mood: cleanMode === 'change' ? cleanTarget : null,
    language: cleanLanguage,
    genre: cleanGenre,
    context: cleanContext,
  };
}

/**
 * Normalize and validate the top-level JSON array returned by POST /api/recommendations
 */
export function normalizeRecommendationList(rawArray) {
  if (!Array.isArray(rawArray)) {
    throw new ApiError(
      'Unexpected response format from /api/recommendations: expected a top-level JSON array.',
      { status: 500 }
    );
  }

  return rawArray
    .filter((item) => item && typeof item === 'object' && item.id !== undefined)
    .map((item) => ({
      id: Number(item.id),
      title: String(item.title || 'Untitled Track'),
      artist: String(item.artist || 'Unknown Artist'),
      language: String(item.language || 'English'),
      genre: String(item.genre || 'Pop'),
      mood_tags: Array.isArray(item.mood_tags)
        ? item.mood_tags.map((t) => String(t).trim().toLowerCase())
        : [],
      audio_url: String(item.audio_url || ''),
    }));
}

/**
 * Fetch top recommended songs from POST /api/recommendations
 */
export async function fetchRecommendations(params, { apiMode = 'live' } = {}) {
  const payload = buildRecommendationPayload(params);

  if (apiMode === 'mock') {
    const mockArray = await mockGetRecommendations(payload);
    return {
      songs: normalizeRecommendationList(mockArray),
      payload,
      isMock: true,
    };
  }

  const rawArray = await apiRequest('/api/recommendations', {
    method: 'POST',
    body: payload,
  });

  return {
    songs: normalizeRecommendationList(rawArray),
    payload,
    isMock: false,
  };
}

