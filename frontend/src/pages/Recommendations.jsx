import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Compass,
  Disc3,
  ExternalLink,
  LineChart,
  Music2,
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useVibeShift } from '../context/VibeShiftContext';
import { getMoodMeta, parseSpotifyTrackUrl } from '../config/constants';
import PlaylistCard from '../components/PlaylistCard';
import MusicPlayer from '../components/MusicPlayer';
import MoodRecheckPanel from '../components/MoodRecheckPanel';
import FeedbackControls from '../components/FeedbackControls';
import MoodArtGraphic from '../components/MoodArtGraphic';

export default function Recommendations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    apiMode,
    currentMood,
    mode,
    targetMood,
    preferences,
    sessionId,
    recommendations,
    activeSong,
    setActiveSong,
    isLoadingRecommendations,
    recommendationError,
    feedbackMap,
    feedbackToast,
    selectMood,
    startOrUpdateListeningFlow,
    handleSongFeedback,
    performMoodRecheck,
  } = useVibeShift();

  const [showRecheck, setShowRecheck] = useState(false);

  const queryMood = searchParams.get('mood');

  useEffect(() => {
    if (queryMood && !currentMood) {
      selectMood(queryMood, { source: 'manual', confidence: 1.0, confirmed: true });
    }
  }, [queryMood, currentMood, selectMood]);

  // Automatically fetch recommendations if user arrived with a mood selected but empty list
  useEffect(() => {
    if (
      currentMood &&
      recommendations.length === 0 &&
      !isLoadingRecommendations &&
      !recommendationError &&
      (mode === 'match' || (mode === 'change' && targetMood))
    ) {
      startOrUpdateListeningFlow().catch(() => {});
    }
  }, [
    currentMood,
    mode,
    targetMood,
    recommendations.length,
    isLoadingRecommendations,
    recommendationError,
    startOrUpdateListeningFlow,
  ]);

  const currentMoodMeta = currentMood ? getMoodMeta(currentMood) : null;
  const targetMoodMeta = targetMood ? getMoodMeta(targetMood) : null;
  const effectiveMoodMeta =
    mode === 'change' && targetMoodMeta ? targetMoodMeta : currentMoodMeta;

  const handleNextSong = () => {
    if (recommendations.length === 0) return;
    const idx = recommendations.findIndex((s) => s.id === activeSong?.id);
    const nextIdx = idx >= 0 ? (idx + 1) % recommendations.length : 0;
    setActiveSong(recommendations[nextIdx]);
  };

  const handlePrevSong = () => {
    if (recommendations.length === 0) return;
    const idx = recommendations.findIndex((s) => s.id === activeSong?.id);
    const prevIdx =
      idx > 0 ? idx - 1 : Math.max(0, recommendations.length - 1);
    setActiveSong(recommendations[prevIdx]);
  };

  const featuredSong = recommendations[0] || null;
  const featuredMoodMeta = featuredSong
    ? getMoodMeta(featuredSong.mood_tags?.[0] || currentMood || 'happy')
    : effectiveMoodMeta || getMoodMeta('happy');
  const featuredTheme = featuredMoodMeta.artworkTheme || {
    bg: '#DFF3A3',
    fg: '#171717',
    secondary: '#3577D4',
    tertiary: '#FFFFFF',
    pattern: 'sunburst',
  };
  const featuredSpotify = featuredSong
    ? parseSpotifyTrackUrl(featuredSong.audio_url)
    : null;

  return (
    <div
      className="section impact-recommendations-page"
      data-testid="recommendations-page"
    >
      <div className="container">
        {/* =================================================================
            EDITORIAL HEADER & ACTIVE VIBE SUMMARY STRIP
            ================================================================= */}
        <div className="impact-rec-header">
          <div className="impact-rec-header-top">
            <div>
              <div className="impact-eyebrow-row" style={{ marginBottom: '0.65rem' }}>
                <span className="eyebrow">
                  <Music2 size={14} />
                  CURATED SESSION SOUNDTRACK
                </span>
                {sessionId && (
                  <span className="badge badge-neutral">
                    Session #{sessionId}
                  </span>
                )}
              </div>

              <h1 className="impact-page-title">Your Soundtrack</h1>
              <p className="impact-page-lead">
                {effectiveMoodMeta
                  ? `Tailored for your ${effectiveMoodMeta.label.toLowerCase()} atmosphere — ${effectiveMoodMeta.tagline.toLowerCase()}.`
                  : 'Select your mood and preferences to generate a personalized playlist.'}
              </p>
            </div>

            <div className="impact-rec-header-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRecheck((prev) => !prev)}
                data-testid="open-mood-recheck-btn"
              >
                <Sparkles size={16} />
                <span>How Are You Feeling Now?</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                disabled={!currentMood || isLoadingRecommendations}
                onClick={() => startOrUpdateListeningFlow().catch(() => {})}
                data-testid="refresh-recommendations-btn"
              >
                <RefreshCw size={15} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/discover')}
              >
                <Sliders size={15} />
                <span>Adjust Filters</span>
              </button>
            </div>
          </div>

          {/* Active Context Summary Strip */}
          <div
            className="impact-vibe-summary-strip"
            data-testid="recommendation-summary-pills"
          >
            <span className="impact-vibe-pill">
              Current Mood:{' '}
              <strong>
                {currentMoodMeta ? currentMoodMeta.label : 'Not Set'}
              </strong>
            </span>
            <span className="impact-vibe-pill">
              Mode:{' '}
              <strong>
                {mode === 'change' ? 'Change My Mood' : 'Match My Mood'}
              </strong>
            </span>
            {mode === 'change' && (
              <span className="impact-vibe-pill impact-vibe-pill--pink">
                Target Mood:{' '}
                <strong>
                  {targetMoodMeta ? targetMoodMeta.label : 'Choose Target'}
                </strong>
              </span>
            )}
            <span className="impact-vibe-pill">
              Language:{' '}
              <strong>{preferences.language || 'All Supported'}</strong>
            </span>
            <span className="impact-vibe-pill">
              Genre: <strong>{preferences.genre || 'Any Genre'}</strong>
            </span>
            <span className="impact-vibe-pill">
              Activity:{' '}
              <strong style={{ textTransform: 'capitalize' }}>
                {preferences.context || 'Any Context'}
              </strong>
            </span>
          </div>
        </div>

        {/* =================================================================
            OPTIONAL MOOD RECHECK DRAWER
            ================================================================= */}
        <AnimatePresence>
          {showRecheck && (
            <MoodRecheckPanel
              currentMood={currentMood || 'calm'}
              onSubmitRecheck={performMoodRecheck}
              onClose={() => setShowRecheck(false)}
            />
          )}
        </AnimatePresence>

        {/* Feedback Toast Notification */}
        {feedbackToast && (
          <div
            role="status"
            aria-live="polite"
            className="impact-feedback-toast"
            data-testid="feedback-toast"
          >
            <Sparkles size={15} />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* =================================================================
            NO MOOD SELECTED EMPTY STATE
            ================================================================= */}
        {!currentMood && !isLoadingRecommendations && (
          <div
            className="impact-empty-state-card"
            data-testid="recommendations-no-mood-state"
          >
            <Compass size={40} style={{ margin: '0 auto 0.85rem' }} />
            <h2 className="impact-empty-title">Choose your mood first</h2>
            <p className="impact-empty-desc">
              Before we can recommend songs, let us know how you are feeling right now or whether you want to shift toward a new emotional state.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/discover')}
            >
              <span>Go to Mood & Vibe Discovery</span>
            </button>
          </div>
        )}

        {/* =================================================================
            LOADING SKELETON STATE
            ================================================================= */}
        {isLoadingRecommendations && (
          <div
            className="grid-2"
            aria-busy="true"
            aria-label="Loading recommendations"
          >
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="skeleton"
                style={{ height: '148px', borderRadius: '24px' }}
              />
            ))}
          </div>
        )}

        {/* =================================================================
            ERROR STATE
            ================================================================= */}
        {!isLoadingRecommendations && recommendationError && (
          <div
            role="alert"
            className="impact-empty-state-card"
            data-testid="recommendations-error-state"
          >
            <AlertCircle size={32} color="#8B3252" style={{ margin: '0 auto 0.75rem' }} />
            <h2 className="impact-empty-title">
              Could not load recommendations
            </h2>
            <p className="impact-empty-desc">{recommendationError}</p>
            <div className="impact-empty-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => startOrUpdateListeningFlow().catch(() => {})}
              >
                <RefreshCw size={16} />
                <span>Retry Request</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/discover')}
              >
                <ArrowLeft size={16} />
                <span>Adjust Mood or Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            EMPTY RESULT STATE
            ================================================================= */}
        {!isLoadingRecommendations &&
          !recommendationError &&
          currentMood &&
          recommendations.length === 0 && (
            <div
              className="impact-empty-state-card"
              data-testid="recommendations-empty-state"
            >
              <Music2 size={36} style={{ margin: '0 auto 0.75rem' }} />
              <h2 className="impact-empty-title">
                No exact songs matched every filter
              </h2>
              <p className="impact-empty-desc">
                Try broadening your language, genre, or activity context filter in the discovery studio to unlock more songs.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/discover')}
              >
                <Sliders size={16} />
                <span>Broaden Preferences</span>
              </button>
            </div>
          )}

        {/* =================================================================
            FEATURED RECOMMENDATION SPOTLIGHT + PLAYLIST & PLAYER LAYOUT
            ================================================================= */}
        {!isLoadingRecommendations && recommendations.length > 0 && (
          <>
            {/* Featured Recommendation Hero Spotlight Card (Section 16) */}
            {featuredSong && (
              <section
                className="impact-featured-spotlight"
                aria-label="Featured Recommendation"
                data-testid="featured-recommendation-card"
              >
                <div className="impact-featured-art-col">
                  <div className="impact-featured-art-frame">
                    <MoodArtGraphic
                      pattern={featuredTheme.pattern}
                      bg={featuredTheme.bg}
                      fg={featuredTheme.fg}
                      secondary={featuredTheme.secondary}
                      tertiary={featuredTheme.tertiary}
                    />
                    <span className="impact-featured-ribbon">
                      <Disc3 size={13} className="spin-slow" />
                      <span>FEATURED SELECTION #01</span>
                    </span>
                  </div>
                </div>

                <div className="impact-featured-copy-col">
                  <div className="impact-featured-meta-top">
                    <span className="impact-featured-kicker">
                      TOP MATCH FOR {effectiveMoodMeta?.label?.toUpperCase() || 'YOUR VIBE'}
                    </span>
                    <div className="impact-featured-tags">
                      {featuredSong.language && (
                        <span className="badge badge-neutral">
                          {featuredSong.language}
                        </span>
                      )}
                      {featuredSong.genre && (
                        <span className="badge badge-accent">
                          {featuredSong.genre}
                        </span>
                      )}
                      {(featuredSong.mood_tags || []).map((mTag) => {
                        const m = getMoodMeta(mTag);
                        return (
                          <span
                            key={mTag}
                            className="badge"
                            style={{
                              background: m.pillColor,
                              color: '#171717',
                              border: '1px solid #171717',
                            }}
                          >
                            {m.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <h2 className="impact-featured-title">{featuredSong.title}</h2>
                  <p className="impact-featured-artist">{featuredSong.artist}</p>

                  <div className="impact-featured-actions-row">
                    <button
                      type="button"
                      onClick={() => setActiveSong(featuredSong)}
                      className="btn impact-btn-lime"
                    >
                      <Play size={16} />
                      <span>
                        {activeSong?.id === featuredSong.id
                          ? 'Playing in Studio'
                          : 'Load in Studio Player'}
                      </span>
                    </button>

                    {featuredSpotify?.openUrl && (
                      <a
                        href={featuredSpotify.openUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        <span>Listen on Spotify</span>
                        <ExternalLink size={15} />
                      </a>
                    )}

                    <FeedbackControls
                      songId={featuredSong.id}
                      activeAction={feedbackMap?.[featuredSong.id] || null}
                      onFeedback={handleSongFeedback}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Main Two-Column Playlist + Sticky Player Grid */}
            <div className="recommendations-layout">
              {/* Left Column: Recommended Track Cards */}
              <div>
                <div className="impact-playlist-bar">
                  <span className="impact-playlist-count">
                    COMPLETE SOUNDTRACK ({recommendations.length} TRACKS)
                  </span>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate('/journey')}
                  >
                    <LineChart size={15} />
                    <span>View Mood Journey →</span>
                  </button>
                </div>

                <div className="impact-playlist-stack">
                  {recommendations.map((song, index) => (
                    <PlaylistCard
                      key={song.id}
                      song={song}
                      index={index}
                      isSelected={activeSong?.id === song.id}
                      feedbackAction={feedbackMap?.[song.id] || null}
                      onSelectSong={setActiveSong}
                      onFeedback={handleSongFeedback}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Sticky Music Player */}
              <div className="player-sticky">
                <MusicPlayer
                  song={activeSong || recommendations[0]}
                  apiMode={apiMode}
                  onNextSong={handleNextSong}
                  onPrevSong={handlePrevSong}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
