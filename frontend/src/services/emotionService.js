/**
 * VibeShift — Emotion Estimation Service (src/services/emotionService.js)
 * Connects to POST /api/emotion using multipart/form-data (`file` field).
 * Enforces 5 MB client-side upload limit and normalizes all documented AI statuses.
 */

import { apiRequest, ApiError } from './api';
import {
  MAX_UPLOAD_BYTES,
  MOOD_IDS,
  EMOTION_STATUS_META,
} from '../config/constants';
import { mockEstimateEmotion } from '../mocks/mockEngine';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/bmp',
];

/**
 * Normalize raw response from POST /api/emotion so the UI never silently defaults
 * to neutral and always knows whether manual selection is required.
 */
export function normalizeEmotionResponse(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new ApiError('Unexpected response shape from /api/emotion.', {
      status: 500,
    });
  }

  const rawStatus = String(raw.status || 'error').toLowerCase();
  const rawEmotion =
    typeof raw.emotion === 'string' ? raw.emotion.trim().toLowerCase() : null;
  const isValidMood = rawEmotion && MOOD_IDS.includes(rawEmotion);

  const emotion = isValidMood ? rawEmotion : null;
  const confidence =
    typeof raw.confidence === 'number' && !Number.isNaN(raw.confidence)
      ? Math.max(0, Math.min(1, Number(raw.confidence.toFixed(2))))
      : 0.0;

  // Determine effective status metadata key
  let metaKey = rawStatus;
  if (rawStatus === 'success' && !emotion) {
    // Surprise, fear, disgust, or unmapped expression
    metaKey = 'unmapped_expression';
  } else if (!EMOTION_STATUS_META[metaKey]) {
    metaKey = 'error';
  }

  const statusMeta = EMOTION_STATUS_META[metaKey];
  const requiresManualSelection = emotion === null || rawStatus !== 'success';

  return {
    emotion, // 'happy' | 'sad' | 'angry' | 'neutral' | null
    confidence,
    status: rawStatus,
    note:
      typeof raw.note === 'string' && raw.note.trim()
        ? raw.note.trim()
        : statusMeta.guidance,
    requiresManualSelection,
    statusTitle: statusMeta.title,
    statusGuidance: statusMeta.guidance,
    statusTone: statusMeta.tone,
  };
}

/**
 * Upload a camera snapshot or image file to POST /api/emotion
 * @param {Blob|File} imageBlob
 * @param {Object} options
 * @param {'live'|'mock'} options.apiMode
 * @param {string} [options.mockScenarioId]
 */
export async function estimateEmotionFromImage(
  imageBlob,
  { apiMode = 'live', mockScenarioId = 'happy_success' } = {}
) {
  if (!imageBlob) {
    throw new ApiError('No image snapshot provided for emotion estimation.', {
      status: 400,
    });
  }

  if (imageBlob.size === 0) {
    throw new ApiError(
      'The captured image snapshot is empty. Please retake the photo.',
      { status: 400 }
    );
  }

  if (imageBlob.size > MAX_UPLOAD_BYTES) {
    throw new ApiError(
      'Image size exceeds the 5 MB client-side limit. Please use a standard camera snapshot.',
      { status: 400 }
    );
  }

  if (
    imageBlob.type &&
    !ALLOWED_MIME_TYPES.includes(imageBlob.type.toLowerCase())
  ) {
    throw new ApiError(
      'Unsupported image format. Please use JPEG, PNG, WEBP, or BMP.',
      { status: 400 }
    );
  }

  if (apiMode === 'mock') {
    const mockRaw = await mockEstimateEmotion(imageBlob, mockScenarioId);
    return {
      ...normalizeEmotionResponse(mockRaw),
      isMock: true,
    };
  }

  const formData = new FormData();
  const filename =
    imageBlob instanceof File && imageBlob.name
      ? imageBlob.name
      : 'camera_frame.jpg';
  formData.append('file', imageBlob, filename);

  const raw = await apiRequest('/api/emotion', {
    method: 'POST',
    body: formData,
    isMultipart: true,
    timeoutMs: 25000, // CPU PyTorch inference on first run can take several seconds
  });

  return {
    ...normalizeEmotionResponse(raw),
    isMock: false,
  };
}

