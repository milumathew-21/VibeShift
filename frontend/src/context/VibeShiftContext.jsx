import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  DEFAULT_API_MODE,
  MOOD_IDS,
  SUPPORTED_LANGUAGE_VALUES,
  SUPPORTED_GENRE_VALUES,
  SUPPORTED_CONTEXT_VALUES,
} from '../config/constants';
import { checkBackendHealth } from '../services/api';
import {
  createListeningSession,
  recordSessionMood,
  fetchSessionJourney,
} from '../services/sessionService';
import { fetchRecommendations } from '../services/recommendationService';
import { submitSongFeedback } from '../services/feedbackService';

const VibeShiftContext = createContext(null);

const INITIAL_PREFERENCES = {
  language: 'English',
  genre: 'Melody',
  context: 'relax',
};

export function VibeShiftProvider({ children, initialApiMode = DEFAULT_API_MODE }) {
  // API Mode ('live' | 'mock') and backend connectivity state
  const [apiMode, setApiMode] = useState(initialApiMode);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  // Mood discovery state
  const [selectedMoodDraft, setSelectedMoodDraft] = useState(null);
  const [currentMood, setCurrentMood] = useState(null);
  const [moodConfirmed, setMoodConfirmed] = useState(false);
  const [moodSource, setMoodSource] = useState('manual'); // 'manual' | 'camera_suggested' | 'recheck'
  const [moodConfidence, setMoodConfidence] = useState(1.0);
  const [cameraEstimate, setCameraEstimate] = useState(null);

  // Mood direction state ('match' | 'change')
  const [mode, setModeState] = useState('match');
  const [targetMood, setTargetMoodState] = useState(null);

  // Music preferences state
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);

  // Session & Journey state
  const [sessionId, setSessionId] = useState(null);
  const [sessionCreatedAt, setSessionCreatedAt] = useState(null);
  const [sessionApiMode, setSessionApiMode] = useState(null);
  const [journeyEntries, setJourneyEntries] = useState([]);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState(null);

  // Recommendations & playback state
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [activeSongId, setActiveSongId] = useState(null);
  const [feedbackBySong, setFeedbackBySong] = useState({});
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [replayTriggerCount, setReplayTriggerCount] = useState(0);

  // Guard ref to prevent duplicate concurrent session creations on strict-mode double renders
  const sessionCreationPromiseRef = useRef(null);
  const lastLoggedMoodSignatureRef = useRef(null);

  // Check backend health without silently changing apiMode
  const probeBackendHealth = useCallback(async () => {
    setBackendStatus('checking');
    try {
      const res = await checkBackendHealth();
      if (res && res.status === 'ok') {
        setBackendStatus('online');
        return true;
      }
      setBackendStatus('offline');
      return false;
    } catch {
      setBackendStatus('offline');
      return false;
    }
  }, []);

  useEffect(() => {
    if (apiMode === 'live') {
      probeBackendHealth();
    } else {
      setBackendStatus('offline');
    }
  }, [apiMode, probeBackendHealth]);

  // Switch API mode explicitly (clears incompatible session ID so live & mock never collide)
  const switchApiMode = useCallback((nextMode) => {
    const cleanMode = nextMode === 'mock' ? 'mock' : 'live';
    setApiMode((prev) => {
      if (prev !== cleanMode) {
        setSessionId(null);
        setSessionCreatedAt(null);
        setSessionApiMode(null);
        sessionCreationPromiseRef.current = null;
        lastLoggedMoodSignatureRef.current = null;
        setRecommendationsError(null);
        setJourneyError(null);
      }
      return cleanMode;
    });
  }, []);

  // Select a mood draft before final confirmation
  const selectMoodDraft = useCallback(
    (moodId, source = 'manual', confidence = 1.0) => {
      const clean = String(moodId || '')
        .trim()
        .toLowerCase();
      if (!MOOD_IDS.includes(clean)) return;
      setSelectedMoodDraft(clean);
      setMoodSource(source);
      setMoodConfidence(
        typeof confidence === 'number' && !Number.isNaN(confidence)
          ? confidence
          : 1.0
      );
      setMoodConfirmed(false);
    },
    []
  );

  // Confirm the selected mood
  const confirmMood = useCallback(
    (moodOverride = null, sourceOverride = null, confidenceOverride = null) => {
      const target = String(moodOverride || selectedMoodDraft || currentMood || '')
        .trim()
        .toLowerCase();
      if (!MOOD_IDS.includes(target)) return false;

      const finalSource = sourceOverride || moodSource || 'manual';
      const finalConfidence =
        confidenceOverride !== null && confidenceOverride !== undefined
          ? confidenceOverride
          : moodConfidence;

      setSelectedMoodDraft(target);
      setCurrentMood(target);
      setMoodSource(finalSource);
      setMoodConfidence(finalConfidence);
      setMoodConfirmed(true);
      return true;
    },
    [selectedMoodDraft, currentMood, moodSource, moodConfidence]
  );

  // Allow user to un-confirm and edit mood without restarting whole workflow
  const reopenMoodConfirmation = useCallback(() => {
    setMoodConfirmed(false);
  }, []);

  // Set Match / Change mode — CRITICAL RULE: switching to 'match' clears targetMood
  const setMoodMode = useCallback((nextMode) => {
    const clean = nextMode === 'change' ? 'change' : 'match';
    setModeState(clean);
    if (clean === 'match') {
      setTargetMoodState(null);
    }
  }, []);

  const setTargetMood = useCallback((moodId) => {
    if (!moodId) {
      setTargetMoodState(null);
      return;
    }
    const clean = String(moodId).trim().toLowerCase();
    if (MOOD_IDS.includes(clean)) {
      setTargetMoodState(clean);
    }
  }, []);

  const updatePreferences = useCallback((partial) => {
    setPreferences((prev) => {
      const next = { ...prev, ...partial };
      // Validate against supported backend values
      if (
        next.language !== null &&
        next.language !== '' &&
        !SUPPORTED_LANGUAGE_VALUES.includes(next.language)
      ) {
        next.language = prev.language;
      }
      if (
        next.genre !== null &&
        next.genre !== '' &&
        !SUPPORTED_GENRE_VALUES.includes(next.genre)
      ) {
        next.genre = prev.genre;
      }
      if (
        next.context !== null &&
        next.context !== '' &&
        !SUPPORTED_CONTEXT_VALUES.includes(next.context)
      ) {
        next.context = prev.context;
      }
      return next;
    });
  }, []);

  // Ensure an active session exists (reuses existing sessionId, prevents duplicate creation)
  const ensureSession = useCallback(
    async (prefsOverride = null) => {
      if (sessionId && sessionApiMode === apiMode) {
        return sessionId;
      }

      if (sessionCreationPromiseRef.current) {
        return sessionCreationPromiseRef.current;
      }

      const activePrefs = prefsOverride || preferences;
      const promise = createListeningSession(activePrefs, { apiMode })
        .then((res) => {
          setSessionId(res.session_id);
          setSessionCreatedAt(res.created_at);
          setSessionApiMode(apiMode);
          sessionCreationPromiseRef.current = null;
          if (apiMode === 'live') setBackendStatus('online');
          return res.session_id;
        })
        .catch((err) => {
          sessionCreationPromiseRef.current = null;
          if (apiMode === 'live' && err?.isNetworkError) {
            setBackendStatus('offline');
          }
          throw err;
        });

      sessionCreationPromiseRef.current = promise;
      return promise;
    },
    [sessionId, sessionApiMode, apiMode, preferences]
  );

  // Start or update session, log confirmed mood, and fetch recommendations
  const startSessionAndFetchRecommendations = useCallback(
    async (overrides = {}) => {
      const effectiveCurrentMood = overrides.currentMood || currentMood || selectedMoodDraft;
      const effectiveMode = overrides.mode || mode;
      const effectiveTargetMood =
        effectiveMode === 'change'
          ? overrides.targetMood !== undefined
            ? overrides.targetMood
            : targetMood
          : null;
      const effectivePrefs = overrides.preferences || preferences;
      const effectiveSource = overrides.source || moodSource || 'manual';
      const effectiveConfidence =
        overrides.confidence !== undefined ? overrides.confidence : moodConfidence;

      setRecommendationsLoading(true);
      setRecommendationsError(null);

      try {
        // 1. Ensure session exists
        const activeSessionId = await ensureSession(effectivePrefs);

        // 2. Log mood entry into session if not already logged with identical signature
        const moodSignature = `${activeSessionId}:${effectiveCurrentMood}:${effectiveSource}:${journeyEntries.length}`;
        if (
          effectiveCurrentMood &&
          lastLoggedMoodSignatureRef.current !== moodSignature
        ) {
          const moodRecord = await recordSessionMood(
            activeSessionId,
            {
              mood: effectiveCurrentMood,
              source: effectiveSource,
              confidence: effectiveConfidence,
            },
            { apiMode }
          );

          setJourneyEntries((prev) => {
            const nextEntry = {
              mood: moodRecord.mood || effectiveCurrentMood,
              source: moodRecord.source || effectiveSource,
              recorded_at:
                moodRecord.recorded_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
            };
            const updated = [...prev, nextEntry];
            lastLoggedMoodSignatureRef.current = `${activeSessionId}:${effectiveCurrentMood}:${effectiveSource}:${updated.length}`;
            return updated;
          });
        }

        // 3. Fetch recommendations from POST /api/recommendations
        const recResult = await fetchRecommendations(
          {
            currentMood: effectiveCurrentMood,
            mode: effectiveMode,
            targetMood: effectiveTargetMood,
            language: effectivePrefs.language || null,
            genre: effectivePrefs.genre || null,
            context: effectivePrefs.context || null,
          },
          { apiMode }
        );

        setRecommendations(recResult.songs);
        if (recResult.songs.length > 0) {
          setActiveSongId((prevId) => {
            const stillExists = recResult.songs.some((s) => s.id === prevId);
            return stillExists ? prevId : recResult.songs[0].id;
          });
        } else {
          setActiveSongId(null);
        }

        if (apiMode === 'live') setBackendStatus('online');
        return recResult.songs;
      } catch (err) {
        if (apiMode === 'live' && err?.isNetworkError) {
          setBackendStatus('offline');
        }
        setRecommendationsError(
          err?.message || 'Unable to load music recommendations.'
        );
        throw err;
      } finally {
        setRecommendationsLoading(false);
      }
    },
    [
      currentMood,
      selectedMoodDraft,
      mode,
      targetMood,
      preferences,
      moodSource,
      moodConfidence,
      ensureSession,
      journeyEntries.length,
      apiMode,
    ]
  );

  // Refresh recommendations without duplicating the session or mood entry
  const refreshRecommendations = useCallback(async () => {
    const effectiveCurrentMood = currentMood || selectedMoodDraft;
    if (!effectiveCurrentMood) return [];

    setRecommendationsLoading(true);
    setRecommendationsError(null);
    try {
      const recResult = await fetchRecommendations(
        {
          currentMood: effectiveCurrentMood,
          mode,
          targetMood: mode === 'change' ? targetMood : null,
          language: preferences.language || null,
          genre: preferences.genre || null,
          context: preferences.context || null,
        },
        { apiMode }
      );
      setRecommendations(recResult.songs);
      if (recResult.songs.length > 0) {
        setActiveSongId((prevId) => {
          const stillExists = recResult.songs.some((s) => s.id === prevId);
          return stillExists ? prevId : recResult.songs[0].id;
        });
      }
      return recResult.songs;
    } catch (err) {
      setRecommendationsError(
        err?.message || 'Unable to refresh music recommendations.'
      );
      throw err;
    } finally {
      setRecommendationsLoading(false);
    }
  }, [currentMood, selectedMoodDraft, mode, targetMood, preferences, apiMode]);

  // Record song feedback (like, skip, replay) via POST /api/feedback
  const recordSongInteraction = useCallback(
    async (songId, action) => {
      setFeedbackStatus({ songId, action, state: 'pending', message: null });
      try {
        const activeSessionId = await ensureSession();
        const res = await submitSongFeedback(
          { sessionId: activeSessionId, songId, action },
          { apiMode }
        );

        setFeedbackBySong((prev) => {
          const current = prev[songId] || {
            liked: false,
            skipped: false,
            replayCount: 0,
            lastAction: null,
          };
          return {
            ...prev,
            [songId]: {
              liked: action === 'like' ? true : current.liked,
              skipped: action === 'skip' ? true : current.skipped,
              replayCount:
                action === 'replay' ? current.replayCount + 1 : current.replayCount,
              lastAction: action,
            },
          };
        });

        if (action === 'skip' && recommendations.length > 1) {
          // Move to next available recommendation
          const currentIndex = recommendations.findIndex((s) => s.id === songId);
          if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % recommendations.length;
            setActiveSongId(recommendations[nextIndex].id);
          }
        } else if (action === 'replay') {
          setActiveSongId(songId);
          setReplayTriggerCount((c) => c + 1);
        }

        setFeedbackStatus({
          songId,
          action,
          state: 'success',
          message:
            action === 'like'
              ? 'Added to your liked vibrations — refresh anytime to re-rank.'
              : action === 'skip'
              ? 'Skipped track and advanced to the next recommendation.'
              : 'Replay recorded for this track.',
        });

        return res;
      } catch (err) {
        setFeedbackStatus({
          songId,
          action,
          state: 'error',
          message: err?.message || `Could not record ${action} feedback.`,
        });
        throw err;
      }
    },
    [ensureSession, apiMode, recommendations]
  );

  // Record a user-confirmed Mood Recheck during an active session (source: "recheck")
  const submitMoodRecheck = useCallback(
    async ({
      mood,
      confidence = 1.0,
      refreshAfter = true,
      nextMode = null,
      nextTargetMood = undefined,
    }) => {
      const cleanMood = String(mood || '')
        .trim()
        .toLowerCase();
      if (!MOOD_IDS.includes(cleanMood)) {
        throw new Error('Please choose a valid mood for your recheck.');
      }

      const activeSessionId = await ensureSession();
      const recorded = await recordSessionMood(
        activeSessionId,
        {
          mood: cleanMood,
          source: 'recheck',
          confidence,
        },
        { apiMode }
      );

      setCurrentMood(cleanMood);
      setSelectedMoodDraft(cleanMood);
      setMoodConfirmed(true);
      setMoodSource('recheck');
      setMoodConfidence(confidence);

      const effectiveMode = nextMode || mode;
      const effectiveTarget =
        effectiveMode === 'change'
          ? nextTargetMood !== undefined
            ? nextTargetMood
            : targetMood
          : null;

      if (nextMode) {
        setMoodMode(nextMode);
      }
      if (nextTargetMood !== undefined && effectiveMode === 'change') {
        setTargetMood(nextTargetMood);
      }

      setJourneyEntries((prev) => {
        const updated = [
          ...prev,
          {
            mood: recorded.mood || cleanMood,
            source: 'recheck',
            recorded_at:
              recorded.recorded_at ||
              new Date().toISOString().slice(0, 19).replace('T', ' '),
          },
        ];
        lastLoggedMoodSignatureRef.current = `${activeSessionId}:${cleanMood}:recheck:${updated.length}`;
        return updated;
      });

      if (refreshAfter) {
        await fetchRecommendations(
          {
            currentMood: cleanMood,
            mode: effectiveMode,
            targetMood: effectiveTarget,
            language: preferences.language || null,
            genre: preferences.genre || null,
            context: preferences.context || null,
          },
          { apiMode }
        ).then((res) => {
          setRecommendations(res.songs);
          if (res.songs.length > 0) {
            setActiveSongId(res.songs[0].id);
          }
        });
      }

      return recorded;
    },
    [
      ensureSession,
      apiMode,
      mode,
      targetMood,
      setMoodMode,
      setTargetMood,
      preferences,
    ]
  );

  // Load chronological Mood Journey from GET /api/sessions/{id}/journey
  const loadSessionJourney = useCallback(async () => {
    if (!sessionId) {
      setJourneyEntries([]);
      return [];
    }

    setJourneyLoading(true);
    setJourneyError(null);
    try {
      const res = await fetchSessionJourney(sessionId, { apiMode });
      setJourneyEntries(res.entries);
      return res.entries;
    } catch (err) {
      setJourneyError(
        err?.message || 'Unable to fetch your session Mood Journey.'
      );
      throw err;
    } finally {
      setJourneyLoading(false);
    }
  }, [sessionId, apiMode]);

  // Navigate to next / previous recommendation in the active playlist
  const selectNextSong = useCallback(() => {
    if (recommendations.length === 0) return;
    const idx = recommendations.findIndex((s) => s.id === activeSongId);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % recommendations.length;
    setActiveSongId(recommendations[nextIdx].id);
  }, [recommendations, activeSongId]);

  const selectPrevSong = useCallback(() => {
    if (recommendations.length === 0) return;
    const idx = recommendations.findIndex((s) => s.id === activeSongId);
    const prevIdx =
      idx <= 0 ? recommendations.length - 1 : (idx - 1) % recommendations.length;
    setActiveSongId(recommendations[prevIdx].id);
  }, [recommendations, activeSongId]);

  // Reset entire flow to start fresh
  const resetFlow = useCallback(() => {
    setSelectedMoodDraft(null);
    setCurrentMood(null);
    setMoodConfirmed(false);
    setMoodSource('manual');
    setMoodConfidence(1.0);
    setCameraEstimate(null);
    setModeState('match');
    setTargetMoodState(null);
    setPreferences(INITIAL_PREFERENCES);
    setSessionId(null);
    setSessionCreatedAt(null);
    setSessionApiMode(null);
    setJourneyEntries([]);
    setRecommendations([]);
    setRecommendationsError(null);
    setActiveSongId(null);
    setFeedbackBySong({});
    setFeedbackStatus(null);
    sessionCreationPromiseRef.current = null;
    lastLoggedMoodSignatureRef.current = null;
  }, []);

  const activeSong =
    recommendations.find((s) => s.id === activeSongId) ||
    recommendations[0] ||
    null;

  const value = {
    // API & Connection
    apiMode,
    switchApiMode,
    backendStatus,
    probeBackendHealth,

    // Mood State
    selectedMoodDraft,
    currentMood,
    moodConfirmed,
    moodSource,
    moodConfidence,
    cameraEstimate,
    setCameraEstimate,
    selectMoodDraft,
    confirmMood,
    reopenMoodConfirmation,

    // Direction & Target
    mode,
    setMoodMode,
    targetMood,
    setTargetMood,

    // Preferences
    preferences,
    updatePreferences,

    // Session & Journey
    sessionId,
    sessionCreatedAt,
    journeyEntries,
    journeyLoading,
    journeyError,
    ensureSession,
    loadSessionJourney,

    // Recommendations & Player
    recommendations,
    recommendationsLoading,
    recommendationsError,
    activeSong,
    activeSongId,
    setActiveSongId,
    selectNextSong,
    selectPrevSong,
    startSessionAndFetchRecommendations,
    refreshRecommendations,

    // Feedback & Recheck
    feedbackBySong,
    feedbackStatus,
    setFeedbackStatus,
    replayTriggerCount,
    recordSongInteraction,
    submitMoodRecheck,

    // Flow Reset
    resetFlow,
  };

  return (
    <VibeShiftContext.Provider value={value}>
      {children}
    </VibeShiftContext.Provider>
  );
}

export function useVibeShift() {
  const context = useContext(VibeShiftContext);
  if (!context) {
    throw new Error('useVibeShift must be used within a VibeShiftProvider');
  }
  return context;
}
