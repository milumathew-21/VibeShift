/**
 * VibeShift — Centralized HTTP Client (src/services/api.js)
 * Handles base URL configuration, timeouts, JSON parsing, FastAPI detail error extraction,
 * and network failure normalization. Never silently falls back to mock data.
 */

import { API_BASE_URL } from '../config/constants';

export class ApiError extends Error {
  constructor(message, { status = 0, detail = null, isNetworkError = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Extract human-readable error message from FastAPI error payload (`{ detail: ... }`)
 */
export function extractFastApiDetail(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;
  if (typeof payload === 'string') return payload;
  if (typeof payload.detail === 'string') return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => {
        const loc = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : '';
        return loc ? `${loc}: ${item.msg}` : item.msg || JSON.stringify(item);
      })
      .join('; ');
  }
  if (typeof payload.message === 'string') return payload.message;
  return fallbackMessage;
}

/**
 * Core HTTP request wrapper with timeout and structured error handling
 */
export async function apiRequest(
  endpoint,
  {
    method = 'GET',
    body = undefined,
    headers = {},
    timeoutMs = 15000,
    isMultipart = false,
  } = {}
) {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders = { ...headers };
  let requestBody = body;

  if (!isMultipart && body !== undefined && body !== null) {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let parsedData = null;

    if (contentType.includes('application/json')) {
      try {
        parsedData = await response.json();
      } catch {
        parsedData = null;
      }
    } else {
      const text = await response.text();
      try {
        parsedData = text ? JSON.parse(text) : null;
      } catch {
        parsedData = text;
      }
    }

    if (!response.ok) {
      const message = extractFastApiDetail(
        parsedData,
        `Request failed with HTTP ${response.status}`
      );
      throw new ApiError(message, {
        status: response.status,
        detail: parsedData?.detail ?? parsedData,
        isNetworkError: false,
      });
    }

    return parsedData;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err?.name === 'AbortError') {
      throw new ApiError(
        'The request timed out while waiting for the VibeShift backend. Please verify the server is running at ' +
          API_BASE_URL,
        { status: 408, isNetworkError: true }
      );
    }

    throw new ApiError(
      `Unable to reach the VibeShift backend at ${API_BASE_URL}. Ensure the FastAPI server is running or switch to Standalone Demo Mode.`,
      { status: 0, isNetworkError: true }
    );
  }
}

/**
 * Check backend health (`GET /api/health`)
 */
export async function checkBackendHealth() {
  return apiRequest('/api/health', { method: 'GET', timeoutMs: 5000 });
}

