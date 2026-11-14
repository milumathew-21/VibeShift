import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SmilePlus,
  Compass,
  Sparkles,
  Sliders,
  Disc3,
  LineChart,
  ArrowRight,
  RotateCcw,
  Radio,
  Music2,
} from 'lucide-react';
import { useVibeShift } from '../context/VibeShiftContext';
import { getMoodMeta } from '../config/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    currentMood,
    moodConfirmed,
    mode,
    targetMood,
    preferences,
    sessionId,
    recommendations,
    journeyEntries,
    setMoodMode,
    resetFlow,
    apiMode,
  } = useVibeShift();

  const currentMoodMeta = moodConfirmed ? getMoodMeta(currentMood) : null;
  const targetMoodMeta = targetMood ? getMoodMeta(targetMood) : null;

  const actions = [
    {
      id: 'discover-mood',
      title: 'Discover My Mood',
      description:
        'Select how you feel right now manually or try an optional in-memory camera snapshot.',
      icon: SmilePlus,
      gradient: 'linear-gradient(135deg, #CDF7F3 0%, #C8F4E8 100%)',
      onClick: () => navigate('/discover?step=1'),
      cta: 'Choose Mood',
    },
    {
      id: 'match-mood',
      title: 'Match My Mood',
      description:
        'Find music that feels right for this moment and resonates with your current state.',
      icon: Compass,
      gradient: 'linear-gradient(135deg, #C8F4E8 0%, #A7E8DD 100%)',
      onClick: () => {
        setMoodMode('match');
        navigate('/discover?step=3');
      },
      cta: 'Set Match Mode',
    },
    {
      id: 'change-mood',
      title: 'Change My Mood',
      description:
        'Choose the feeling you’d like to move toward and build a gentle musical bridge.',
      icon: Sparkles,
      gradient: 'linear-gradient(135deg, #F4CBD9 0%, #BFD6F5 100%)',
      onClick: () => {
        setMoodMode('change');
        navigate('/discover?step=3');
      },
      cta: 'Set Change Mode',
    },
    {
      id: 'personalize-music',
      title: 'Personalize Music',
      description:
        'Filter by Malayalam, Hindi, English, or Tamil alongside your favorite genre and activity context.',
      icon: Sliders,
      gradient: 'linear-gradient(135deg, #BFD6F5 0%, #CDF7F3 100%)',
      onClick: () => navigate('/discover?step=4'),
      cta: 'Edit Preferences',
    },
    {
      id: 'explore-recommendations',
      title: 'Explore Recommendations',
      description:
        'Open your adaptive soundtrack, listen via Spotify embeds, and record likes, skips, or replays.',
      icon: Disc3,
      gradient: 'linear-gradient(135deg, #CDF7F3 0%, #F4CBD9 100%)',
      onClick: () => navigate('/recommendations'),
      cta: 'View Playlist',
    },
    {
      id: 'view-mood-journey',
      title: 'View Mood Journey',
      description:
        'Explore the chronological timeline of categorical moods you’ve confirmed during your session.',
      icon: LineChart,
      gradient: 'linear-gradient(135deg, #E8F4FA 0%, #C8F4E8 100%)',
      onClick: () => navigate('/journey'),
      cta: 'Open Timeline',
    },
  ];

  return (
    <div data-testid="dashboard-page">
      {/* Welcome Banner */}
      <motion.section
        className="glass-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          padding: '2.4rem 2rem',
          marginBottom: '2rem',
          background: currentMoodMeta
            ? currentMoodMeta.gradient
            : 'linear-gradient(135deg, #CDF7F3 0%, #C8F4E8 36%, #BFD6F5 72%, #F4CBD9 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div>
            <span
              className="eyebrow-pill"
              style={{ background: '#FFFFFF', marginBottom: '0.75rem' }}
            >
              <Radio size={14} />
              <span>
                Personal Listening Space ·{' '}
                {apiMode === 'mock'
                  ? 'Standalone Demo Mode'
                  : 'Live Backend Mode'}
              </span>
            </span>

            <h1
              style={{
                fontSize: 'clamp(2.1rem, 4vw, 3.1rem)',
                marginBottom: '0.35rem',
              }}
            >
              Welcome to your space.
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-navy)',
                opacity: 0.88,
                fontWeight: 500,
              }}
            >
              Every feeling deserves a soundtrack.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/discover')}
            >
              <SmilePlus size={18} />
              <span>
                {currentMoodMeta ? 'Update My Mood' : 'Discover My Mood'}
              </span>
            </button>

            {(sessionId || currentMoodMeta) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetFlow}
                title="Clear current session state and start fresh"
              >
                <RotateCcw size={16} />
                <span>Start Fresh Session</span>
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Active Session Status OR Honest Empty State (Never fictional history) */}
      <section style={{ marginBottom: '2.25rem' }} aria-label="Session Status">
        {sessionId || currentMoodMeta ? (
          <div className="glass-card" data-testid="dashboard-active-session">
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>Current Session Snapshot</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Your active choices are preserved as you move between pages.
                </p>
              </div>
              {sessionId && (
                <span className="eyebrow-pill">Session #{sessionId}</span>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.9rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}
                >
                  Confirmed Mood
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  {currentMoodMeta ? currentMoodMeta.label : 'Not yet confirmed'}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}
                >
                  Vibe Direction
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  {mode === 'change'
                    ? `Shift → ${targetMoodMeta ? targetMoodMeta.label : 'Pick Target'}`
                    : 'Match My Mood'}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}
                >
                  Music Filters
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {preferences.language || 'All Languages'} ·{' '}
                  {preferences.genre || 'Any Genre'} ·{' '}
                  {preferences.context || 'Any Context'}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}
                >
                  Session Progress
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {recommendations.length} Tracks · {journeyEntries.length}{' '}
                  Check-in(s)
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="glass-card"
            data-testid="dashboard-empty-session"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                maxWidth: '62ch',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'var(--gradient-glacier)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Music2 size={24} color="#1F3149" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>
                  No active listening session yet
                </h2>
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  You haven’t recorded a mood or started a session yet. Begin by
                  choosing how you feel right now—your Mood Journey and
                  recommendations will appear here as soon as you start.
                </p>
              </div>
            </div>

            <Link to="/discover" className="btn btn-primary">
              <span>Begin Mood Discovery</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </section>

      {/* Six Interactive Action Cards */}
      <section aria-labelledby="dashboard-actions-heading">
        <div style={{ marginBottom: '1.35rem' }}>
          <h2 id="dashboard-actions-heading" style={{ fontSize: '1.65rem' }}>
            Where would you like to go?
          </h2>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)' }}>
            Jump directly to any step of the VibeShift experience.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.id}
                className="glass-card glass-card-interactive"
                data-testid={`dashboard-action-${item.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.1rem',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '15px',
                      background: item.gradient,
                      border: '1px solid rgba(31, 49, 73, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Icon size={22} color="#1F3149" />
                  </div>

                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={item.onClick}
                  >
                    <span>{item.cta}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

