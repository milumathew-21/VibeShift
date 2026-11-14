import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Disc3,
  RefreshCw,
  Sliders,
  SmilePlus,
  LineChart,
  AlertCircle,
  Sparkles,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useVibeShift } from '../context/VibeShiftContext';
import {
  getMoodMeta,
  CONTEXTS,
  ETHICAL_DISCLAIMERS,
} from '../config/constants';
import PlaylistCard from '../components/PlaylistCard';
import MusicPlayer from '../components/MusicPlayer';
import MoodRecheckPanel from '../components/MoodRecheckPanel';

export default function Recommendations() {
  const navigate = useNavigate();
  const {
    apiMode,
    switchApiMode,
    currentMood,
    selectedMoodDraft,
    mode,
    targetMood,
    preferences,
    sessionId,
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
    feedbackBySong,
    feedbackStatus,
    setFeedbackStatus,
    replayTriggerCount,
    recordSongInteraction,
    submitMoodRecheck,
  } = useVibeShift();

  const [recheckOpen, setRecheckOpen] = useState(false);

  const effectiveMood = currentMood || selectedMoodDraft;
  const currentMoodMeta = getMoodMeta(effectiveMood);
  const targetMoodMeta = getMoodMeta(targetMood);
  const contextMeta = CONTEXTS.find((c) => c.value === preferences.context);

  // Auto-fetch if user already selected a mood on a prior screen and navigated here with empty list
  useEffect(() => {
    if (
      effectiveMood &&
      recommendations.length === 0 &&
      !recommendationsLoading &&
      !recommendationsError
    ) {
      startSessionAndFetchRecommendations().catch(() => {});
    }
  }, [
    effectiveMood,
    recommendations.length,
    recommendationsLoading,
    recommendationsError,
    startSessionAndFetchRecommendations,
  ]);

  const activeTrackIndex = Math.max(
    0,
    recommendations.findIndex((s) => s.id === activeSong?.id)
  );

  return (
    <div data-testid="recommendations-page">
      {/* Header & Session Context Summary */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          marginBottom: '1.75rem',
          background: currentMoodMeta
            ? currentMoodMeta.gradient
            : 'linear-gradient(135deg, #CDF7F3 0%, #BFD6F5 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.45rem',
                marginBottom: '0.65rem',
              }}
            >
              <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
                <Disc3 size={14} />
                <span>
                  {apiMode === 'mock'
                    ? 'Standalone Demo Mode'
                    : 'Live Backend Recommendations'}
                </span>
              </span>
              {sessionId && (
                <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
                  Session #{sessionId}
                </span>
              )}
            </div>

            <h1 className="section-heading" style={{ marginBottom: '0.35rem' }}>
              Your soundtrack starts here.
            </h1>

            <p
              style={{
                fontSize: '0.96rem',
                color: 'var(--text-navy)',
                opacity: 0.88,
                maxWidth: '64ch',
              }}
            >
              {ETHICAL_DISCLAIMERS.globalFeedbackNote}
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setRecheckOpen((o) => !o)}
              data-testid="open-mood-recheck-btn"
            >
              <SmilePlus size={16} />
              <span>{recheckOpen ? 'Close Mood Recheck' : 'Recheck My Mood'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => refreshRecommendations().catch(() => {})}
              disabled={recommendationsLoading || !effectiveMood}
              data-testid="refresh-recommendations-btn"
            >
              <RefreshCw size={15} />
              <span>
                {recommendationsLoading
                  ? 'Refreshing…'
                  : 'Refresh Recommendations'}
              </span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/discover')}
            >
              <Sliders size={15} />
              <span>Edit Mood & Filters</span>
            </button>

            <Link to="/journey" className="btn btn-secondary btn-sm">
              <LineChart size={15} />
              <span>Mood Journey</span>
            </Link>
          </div>
        </div>

        {/* Summary Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.55rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(31, 49, 73, 0.12)',
          }}
          data-testid="recommendation-summary-pills"
        >
          <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
            Current Mood: {currentMoodMeta ? currentMoodMeta.label : 'Not Set'}
          </span>
          <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
            Mode: {mode === 'change' ? 'Change My Mood' : 'Match My Mood'}
          </span>
          {mode === 'change' && (
            <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
              Target Mood: {targetMoodMeta ? targetMoodMeta.label : 'None'}
            </span>
          )}
          <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
            Language: {preferences.language || 'All Supported'}
          </span>
          <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
            Genre: {preferences.genre || 'All Genres'}
          </span>
          <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
            Context: {contextMeta ? contextMeta.label : 'Any Context'}
          </span>
        </div>
      </motion.section>

      {/* Optional Mood Recheck Drawer (Section 21) */}
      {recheckOpen && (
        <MoodRecheckPanel
          currentMood={effectiveMood || 'calm'}
          apiMode={apiMode}
          onSubmitRecheck={submitMoodRecheck}
          onClose={() => setRecheckOpen(false)}
        />
      )}

      {/* Feedback Status Toast Banner */}
      {feedbackStatus && (
        <div
          role="status"
          aria-live="polite"
          className={`alert-banner ${
            feedbackStatus.state === 'error' ? 'error' : 'info'
          }`}
          style={{ marginBottom: '1.35rem', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {feedbackStatus.state === 'error' ? (
              <AlertCircle size={18} color="#783652" />
            ) : (
              <CheckCircle2 size={18} color="#175E57" />
            )}
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              {feedbackStatus.message || 'Recording feedback…'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {feedbackStatus.state === 'success' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => refreshRecommendations().catch(() => {})}
              >
                <RefreshCw size={13} />
                <span>Refresh Ranking</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setFeedbackStatus(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Case 1: User hasn't selected a mood yet */}
      {!effectiveMood && (
        <div
          className="glass-card"
          data-testid="recommendations-no-mood-state"
          style={{ textAlign: 'center', padding: '3rem 1.5rem' }}
        >
          <Sparkles
            size={42}
            color="#1F3149"
            style={{ marginBottom: '0.85rem' }}
          />
          <h2 style={{ fontSize: '1.65rem', marginBottom: '0.45rem' }}>
            Choose your mood first to unlock recommendations
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              maxWidth: '50ch',
              margin: '0 auto 1.5rem',
            }}
          >
            VibeShift never guesses or shows fake recommendations before you
            tell us how you feel.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/discover')}
          >
            <span>Go to Mood Discovery</span>
            <ArrowRight size={17} />
          </button>
        </div>
      )}

      {/* Case 2: Loading State */}
      {effectiveMood && recommendationsLoading && (
        <div
          role="status"
          aria-live="polite"
          className="glass-card"
          style={{ textAlign: 'center', padding: '3rem 1.5rem' }}
        >
          <RefreshCw
            size={36}
            color="#1F3149"
            style={{ marginBottom: '0.75rem' }}
          />
          <h2 style={{ fontSize: '1.45rem', marginBottom: '0.35rem' }}>
            Curating your personalized soundtrack…
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Scoring songs by mood, language, genre, listening context, and
            feedback weights.
          </p>
        </div>
      )}

      {/* Case 3: API Error State (Never silently switches to mock data) */}
      {effectiveMood && !recommendationsLoading && recommendationsError && (
        <div
          role="alert"
          className="alert-banner error"
          data-testid="recommendations-error-state"
          style={{
            padding: '1.75rem',
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertCircle size={22} color="#783652" />
            <h2 style={{ fontSize: '1.35rem' }}>
              Could Not Load Recommendations
            </h2>
          </div>
          <p style={{ fontSize: '0.92rem' }}>{recommendationsError}</p>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            VibeShift will never display mock recommendations as if they came
            from the live backend. You can retry the live FastAPI server or
            explicitly switch to Standalone Demo Mode below.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '0.5rem',
            }}
          >
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => startSessionAndFetchRecommendations().catch(() => {})}
            >
              <RefreshCw size={15} />
              <span>Retry Request</span>
            </button>
            {apiMode === 'live' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  switchApiMode('mock');
                }}
              >
                <FlaskConical size={15} />
                <span>Switch to Standalone Demo Mode</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Case 4: Empty Recommendations Array */}
      {effectiveMood &&
        !recommendationsLoading &&
        !recommendationsError &&
        recommendations.length === 0 && (
          <div
            className="glass-card"
            data-testid="recommendations-empty-state"
            style={{ textAlign: 'center', padding: '2.75rem 1.5rem' }}
          >
            <Disc3
              size={40}
              color="#1F3149"
              style={{ marginBottom: '0.75rem' }}
            />
            <h2 style={{ fontSize: '1.45rem', marginBottom: '0.35rem' }}>
              No matching tracks returned
            </h2>
            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem',
              }}
            >
              Try broadening your language or genre preferences or refreshing the
              playlist.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() =>
                  startSessionAndFetchRecommendations().catch(() => {})
                }
              >
                <RefreshCw size={15} />
                <span>Fetch Recommendations</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/discover?step=4')}
              >
                Edit Preferences
              </button>
            </div>
          </div>
        )}

      {/* Case 5: Playlist + Sticky Now Playing Spotify Player */}
      {effectiveMood &&
        !recommendationsLoading &&
        recommendations.length > 0 && (
          <div className="recommendations-layout">
            <section aria-label="Recommended Tracks Playlist">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.95rem',
                }}
              >
                <h2 style={{ fontSize: '1.35rem' }}>
                  Top {recommendations.length} Curated Tracks
                </h2>
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  Click any track to load in player
                </span>
              </div>

              <div className="playlist-stack">
                {recommendations.map((song, idx) => (
                  <PlaylistCard
                    key={song.id}
                    song={song}
                    index={idx}
                    isActive={activeSongId === song.id}
                    feedbackState={feedbackBySong[song.id] || {}}
                    onSelectTrack={(id) => setActiveSongId(id)}
                    onFeedback={recordSongInteraction}
                  />
                ))}
              </div>
            </section>

            <MusicPlayer
              song={activeSong}
              apiMode={apiMode}
              feedbackState={
                activeSong ? feedbackBySong[activeSong.id] || {} : {}
              }
              onFeedback={recordSongInteraction}
              onPrevTrack={selectPrevSong}
              onNextTrack={selectNextSong}
              totalTracks={recommendations.length}
              currentTrackIndex={activeTrackIndex}
              replaySignal={replayTriggerCount}
            />
          </div>
        )}
    </div>
  );
}

