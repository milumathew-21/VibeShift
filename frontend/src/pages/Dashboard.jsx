import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  Disc3,
  Heart,
  LineChart,
  Music2,
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useVibeShift } from '../context/VibeShiftContext';
import { MOODS, getMoodMeta } from '../config/constants';
import MoodArtGraphic from '../components/MoodArtGraphic';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    currentMood,
    moodConfirmed,
    mode,
    targetMood,
    preferences,
    sessionId,
    sessionCreatedAt,
    recommendations,
    journeyEntries,
    feedbackMap,
    apiMode,
    selectMood,
    changeMode,
    resetSession,
  } = useVibeShift();

  const moodMeta = currentMood ? getMoodMeta(currentMood) : null;
  const targetMeta = targetMood ? getMoodMeta(targetMood) : null;

  const likedCount = Object.values(feedbackMap || {}).filter(
    (act) => act === 'like'
  ).length;

  const dashboardActions = [
    {
      id: 'discover-mood',
      kicker: '01 / CHECK-IN',
      title: 'Discover My Mood',
      description:
        'Select your current feeling manually across six expressive mood states or use optional camera estimation.',
      badge: currentMood ? `Selected: ${moodMeta.label}` : 'Start Here',
      icon: Compass,
      accentBg: '#DFF3A3',
      accentText: '#171717',
      pattern: 'sunburst',
      onClick: () => navigate('/discover'),
    },
    {
      id: 'match-mood',
      kicker: '02 / RESONANCE',
      title: 'Match My Mood',
      description:
        'Stay with the feeling. Listen to songs that honour and mirror your present emotional atmosphere.',
      badge: mode === 'match' ? 'Active Mode' : 'Stay With Feeling',
      icon: Heart,
      accentBg: '#3577D4',
      accentText: '#FFFFFF',
      pattern: 'waves',
      onClick: () => {
        changeMode('match');
        navigate('/discover');
      },
    },
    {
      id: 'change-mood',
      kicker: '03 / TRANSITION',
      title: 'Change My Mood',
      description:
        'Find a different vibe. Build an intentional musical bridge toward a calmer or brighter target state.',
      badge:
        mode === 'change' && targetMeta
          ? `Target: ${targetMeta.label}`
          : 'Shift Direction',
      icon: Wand2,
      accentBg: '#F3BDD0',
      accentText: '#171717',
      pattern: 'ripples',
      onClick: () => {
        changeMode('change');
        navigate('/discover');
      },
    },
    {
      id: 'preferences',
      kicker: '04 / CURATION',
      title: 'Music Preferences',
      description:
        'Personalize language (English, Malayalam, Hindi, Tamil), genre, and activity context filters.',
      badge: [
        preferences.language || 'All Languages',
        preferences.genre || 'Any Genre',
      ].join(' • '),
      icon: Sliders,
      accentBg: '#F2F0DC',
      accentText: '#171717',
      pattern: 'grid',
      onClick: () => navigate('/discover#preferences-section'),
    },
    {
      id: 'recommendations',
      kicker: '05 / PLAYBACK',
      title: 'My Recommendations',
      description:
        'Stream curated tracks via official Spotify Embeds or Demo Synth and refine with Like, Replay, or Skip.',
      badge:
        recommendations.length > 0
          ? `${recommendations.length} Tracks Ready`
          : 'Generate Playlist',
      icon: Music2,
      accentBg: '#171717',
      accentText: '#DFF3A3',
      pattern: 'vinyl',
      onClick: () => navigate('/recommendations'),
    },
    {
      id: 'mood-journey',
      kicker: '06 / JOURNAL',
      title: 'Mood Journey',
      description:
        'Inspect your chronological session mood log and optional mood rechecks without fake sentiment scores.',
      badge:
        journeyEntries.length > 0
          ? `${journeyEntries.length} Check-In${
              journeyEntries.length === 1 ? '' : 's'
            }`
          : 'Session Timeline',
      icon: LineChart,
      accentBg: '#DFF3A3',
      accentText: '#171717',
      pattern: 'circles',
      onClick: () => navigate('/journey'),
    },
  ];

  return (
    <div className="section impact-dashboard-page" data-testid="dashboard-page">
      <div className="container">
        {/* =================================================================
            EDITORIAL HERO BANNER (SECTION 12)
            ================================================================= */}
        <div className="impact-dashboard-hero">
          <div className="impact-dashboard-hero-copy">
            <div className="impact-eyebrow-row" style={{ marginBottom: '0.85rem' }}>
              <span className="eyebrow">
                <Sparkles size={14} />
                PERSONAL SOUNDTRACK HUB
              </span>
              <span className="badge badge-neutral">
                {apiMode === 'live' ? 'Live FastAPI Mode' : 'Standalone Demo Mode'}
              </span>
            </div>

            <h1 className="impact-page-title">What does today sound like?</h1>
            <p className="impact-page-lead">
              “Let’s find the soundtrack for this moment.”
            </p>

            {/* Quick Mood Jump Chips */}
            <div className="impact-dashboard-quick-moods">
              <span className="impact-quick-mood-label">QUICK CHECK-IN:</span>
              <div className="impact-quick-mood-row">
                {MOODS.map((m) => {
                  const active = currentMood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        selectMood(m.id, {
                          source: 'manual',
                          confidence: 1.0,
                          confirmed: false,
                        });
                        navigate('/discover');
                      }}
                      className={`impact-quick-mood-chip ${active ? 'active' : ''}`}
                    >
                      <span
                        className="impact-dock-dot"
                        style={{ background: m.orbColor }}
                      />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="impact-dashboard-hero-art">
            <div className="impact-dashboard-art-card">
              <MoodArtGraphic
                pattern={moodMeta ? moodMeta.artworkTheme.pattern : 'sunburst'}
                bg={moodMeta ? moodMeta.artworkTheme.bg : '#DFF3A3'}
                fg={moodMeta ? moodMeta.artworkTheme.fg : '#171717'}
                secondary={moodMeta ? moodMeta.artworkTheme.secondary : '#3577D4'}
                tertiary="#FFFFFF"
              />
              <div className="impact-dashboard-art-caption">
                <div>
                  <div className="impact-art-caption-kicker">CURRENT ATMOSPHERE</div>
                  <div className="impact-art-caption-title">
                    {moodMeta
                      ? `${moodMeta.label} — ${moodMeta.soundscapeTitle}`
                      : 'Awaiting Your First Check-In'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/discover')}
                  className="btn btn-primary btn-sm"
                >
                  <Play size={13} />
                  <span>{currentMood ? 'Update' : 'Begin'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            HONEST SESSION SNAPSHOT BANNER
            ================================================================= */}
        <section
          aria-label="Current Listening Session Status"
          style={{ marginBottom: '2.75rem' }}
        >
          {sessionId || currentMood ? (
            <div
              className="impact-session-banner impact-session-banner--active"
              data-testid="dashboard-active-session"
            >
              <div className="impact-session-grid">
                <div>
                  <span className="impact-session-label">ACTIVE SESSION</span>
                  <div className="impact-session-value">
                    {sessionId ? `Session #${sessionId}` : 'Draft Check-In'}
                  </div>
                  {sessionCreatedAt && (
                    <div className="impact-session-sub">
                      Started {sessionCreatedAt}
                    </div>
                  )}
                </div>

                <div>
                  <span className="impact-session-label">CURRENT MOOD</span>
                  <div className="impact-session-value">
                    {moodMeta ? moodMeta.label : 'Not Selected'}
                    {moodConfirmed && (
                      <span className="impact-confirmed-tag">Confirmed</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="impact-session-label">VIBE DIRECTION</span>
                  <div className="impact-session-value">
                    {mode === 'change'
                      ? `Shift → ${targetMeta ? targetMeta.label : 'Choose Target'}`
                      : 'Match My Mood'}
                  </div>
                </div>

                <div>
                  <span className="impact-session-label">CURATED TRACKS</span>
                  <div className="impact-session-value">
                    {recommendations.length} Songs • {likedCount} Liked
                  </div>
                </div>
              </div>

              <div className="impact-session-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      recommendations.length > 0
                        ? '/recommendations'
                        : '/discover'
                    )
                  }
                  className="btn btn-primary"
                >
                  <span>
                    {recommendations.length > 0
                      ? 'Resume Soundtrack'
                      : 'Complete Setup'}
                  </span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={resetSession}
                  className="btn btn-secondary"
                >
                  <RefreshCw size={15} />
                  <span>New Session</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="impact-session-banner impact-session-banner--empty"
              data-testid="dashboard-empty-session"
            >
              <div className="impact-empty-session-info">
                <span className="impact-empty-session-icon">
                  <Disc3 size={24} color="#171717" />
                </span>
                <div>
                  <h2 className="impact-empty-session-title">
                    No active listening session yet
                  </h2>
                  <p className="impact-empty-session-desc">
                    Your dashboard only displays real session check-ins and recommendations. Choose how you feel right now to start your first personalized session.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/discover')}
                className="btn btn-primary btn-lg"
              >
                <Compass size={18} />
                <span>Start Mood Check-In</span>
              </button>
            </div>
          )}
        </section>

        {/* =================================================================
            6 EDITORIAL STUDIO ACTION CARDS
            ================================================================= */}
        <section aria-label="VibeShift Studio Modules">
          <div className="impact-dashboard-section-head">
            <h2 className="impact-section-subtitle">STUDIO MODULES</h2>
            <span className="impact-section-meta">
              6 INTEGRATED WORKFLOWS
            </span>
          </div>

          <div className="grid-3">
            {dashboardActions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="impact-module-card"
                  onClick={item.onClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  data-testid={`dashboard-action-${item.id}`}
                >
                  {/* Visual Artwork Header Strip */}
                  <div className="impact-module-art-strip">
                    <MoodArtGraphic
                      pattern={item.pattern}
                      bg={item.accentBg}
                      fg={item.accentText}
                      secondary="#3577D4"
                      tertiary="#FFFFFF"
                    />
                    <span className="impact-module-kicker-pill">
                      {item.kicker}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="impact-module-body">
                    <div className="impact-module-top-row">
                      <span
                        className="impact-module-icon"
                        style={{
                          background: item.accentBg,
                          color: item.accentText,
                        }}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="badge badge-neutral">{item.badge}</span>
                    </div>

                    <h3 className="impact-module-title">{item.title}</h3>
                    <p className="impact-module-desc">{item.description}</p>

                    <div className="impact-module-cta">
                      <span>Open Module</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
