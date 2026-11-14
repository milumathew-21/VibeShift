/**
 * VibeShift — Song Feedback Service (src/services/feedbackService.js)
 * Connects to POST /api/feedback (`like`, `skip`, `replay`).
 */

import { apiRequest, ApiError } from './api';
import { isValidSessionId } from './sessionService';
import { mockRecordFeedback } from '../mocks/mockEngine';

const ALLOWED_ACTIONS = ['like', 'skip', 'replay'];

export async function submitSongFeedback(
  { sessionId, songId, action },
  { apiMode = 'live' } = {}
) {
  if (!isValidSessionId(sessionId)) {
    throw new ApiError(
      'An active listening session is required before recording song feedback.',
      { status: 400 }
    );
  }

  const numericSongId = Number(songId);
  if (!Number.isInteger(numericSongId) || numericSongId <= 0) {
    throw new ApiError('A valid song ID is required for feedback.', {
      status: 400,
    });
  }

  const cleanAction = String(action || '')
    .trim()
    .toLowerCase();
  if (!ALLOWED_ACTIONS.includes(cleanAction)) {
    throw new ApiError(
      `Invalid feedback action '${action}'. Allowed actions: like, skip, replay.`,
      { status: 400 }
    );
  }

  const payload = {
    session_id: Number(sessionId),
    song_id: numericSongId,
    action: cleanAction,
  };

  if (apiMode === 'mock') {
    const mockRes = await mockRecordFeedback(payload);
    return {
      ...mockRes,
      isMock: true,
    };
  }

  const raw = await apiRequest('/api/feedback', {
    method: 'POST',
    body: payload,
  });

  return {
    ...raw,
    isMock: false,
  };
}

