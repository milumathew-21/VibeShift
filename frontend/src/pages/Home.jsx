import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Compass,
  ShieldCheck,
  Sliders,
  Disc3,
  HeartHandshake,
  Activity,
  Globe2,
  Camera,
} from 'lucide-react';
import AnimatedMoodOrb from '../components/AnimatedMoodOrb';
import { MOODS, getMoodMeta } from '../config/constants';
import { MOCK_SONGS } from '../mocks/mockData';
import { useVibeShift } from '../context/VibeShiftContext';

const HOW_IT_WORKS_STEPS = [
  {
    num: '01',
    title: 'Discover your mood.',
    description:
      'Choose how you feel right now from six expressive mood spaces—or use an optional, privacy-first camera snapshot for a gentle facial-expression estimate.',
    badge: 'Manual or Camera',
  },
  {
    num: '02',
    title: 'Choose your vibe.',
    description:
      'Decide whether to Match My Mood and stay present in the moment, or Change My Mood and select a supportive target feeling to move toward.',
    badge: 'Match or Shift',
  },
  {
    num: '03',
    title: 'Personalize your music.',
    description:
      'Tune your soundtrack across English, Malayalam, Hindi, and Tamil—paired with your favorite genre and daily listening context.',
    badge: '4 Languages · 5 Genres',
  },
  {
    num: '04',
    title: 'Enjoy recommendations.',
    description:
      'Listen via official Spotify embeds, record likes, skips, and replays to adapt rankings, check in on your mood anytime, and explore your Mood Journey.',
    badge: 'Adaptive Session',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { selectMoodDraft, setMoodMode } = useVibeShift();
  const [orbMood, setOrbMood] = useState('calm');
  const [previewDirection, setPreviewDirection] = useState('match');

  const activeOrbMeta = getMoodMeta(orbMood) || MOODS[1];
  const samplePreviewTracks = MOCK_SONGS.filter((s) =>
    s.mood_tags.includes(orbMood)
  ).slice(0, 3);

  const handleQuickStartMood = (moodId) => {
    selectMoodDraft(moodId, 'manual', 1.0);
    navigate('/discover');
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero-section" aria-labelledby="hero-main-heading">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <div className="eyebrow-pill">
            <span className="eyebrow-dot" />
            <span>VibeShift · Adaptive Emotional Soundscapes</span>
          </div>

          <h1 id="hero-main-heading" className="hero-title">
            Your mood.{' '}
            <span className="hero-title-highlight">Your music.</span> Your
            moment.
          </h1>

          <p className="hero-supporting-text">
            “Discover music that matches your mood, understands your
            preferences, and helps you find the vibe you’re looking for.”
          </p>

          <div className="hero-cta-row">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/discover')}
              data-testid="hero-find-my-vibe-btn"
            >
              <Sparkles size={19} />
              <span>Find My Vibe</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="#how-it-works"
              className="btn btn-secondary btn-lg"
              data-testid="hero-explore-how-btn"
            >
              <Compass size={19} />
              <span>Explore How It Works</span>
            </a>
          </div>

          <div className="hero-metrics-strip">
            <div className="hero-metric-item">
              <span className="hero-metric-value">6 Moods</span>
              <span className="hero-metric-label">
                Comforting manual & camera-assisted discovery
              </span>
            </div>
            <div className="hero-metric-item">
              <span className="hero-metric-value">137 Tracks</span>
              <span className="hero-metric-label">
                Curated across Malayalam, Hindi, Tamil & English
              </span>
            </div>
            <div className="hero-metric-item">
              <span className="hero-metric-value">100% Yours</span>
              <span className="hero-metric-label">
                In-memory privacy & user-confirmed feelings
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <AnimatedMoodOrb
            activeMood={orbMood}
            onMoodPreviewChange={setOrbMood}
            interactivePreview
          />
        </motion.div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section
        id="how-it-works"
        className="landing-section"
        aria-labelledby="how-it-works-heading"
      >
        <div style={{ marginBottom: '2rem' }}>
          <span className="eyebrow-pill" style={{ marginBottom: '0.65rem' }}>
            <Compass size={14} />
            <span>How VibeShift Works</span>
          </span>
          <h2 id="how-it-works-heading" className="section-heading">
            Four gentle steps from feeling to melody.
          </h2>
          <p className="section-subtitle">
            Every stage is transparent, editable, and designed so you stay in
            complete control of your emotional space.
          </p>
        </div>

        <div className="how-it-works-timeline">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article key={step.num} className="step-card glass-card-interactive">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span className="step-number-badge">{step.num}</span>
                <span
                  className="eyebrow-pill"
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.65rem' }}
                >
                  {step.badge}
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. KEY FEATURES (ASYMMETRIC BENTO COMPOSITION) */}
      <section className="landing-section" aria-labelledby="features-heading">
        <div style={{ marginBottom: '2rem' }}>
          <span className="eyebrow-pill" style={{ marginBottom: '0.65rem' }}>
            <Sparkles size={14} />
            <span>Key Capabilities</span>
          </span>
          <h2 id="features-heading" className="section-heading">
            Designed with emotional care and technical precision.
          </h2>
        </div>

        <div className="bento-grid">
          <article
            className="glass-card glass-card-interactive bento-span-7"
            style={{
              background:
                'linear-gradient(135deg, rgba(205, 247, 243, 0.55) 0%, rgba(255, 255, 255, 0.92) 55%, rgba(191, 214, 245, 0.45) 100%)',
            }}
          >
            <span className="eyebrow-pill" style={{ marginBottom: '0.85rem' }}>
              <HeartHandshake size={14} />
              <span>Match or Shift Your Vibe</span>
            </span>
            <h3 style={{ fontSize: '1.65rem', marginBottom: '0.55rem' }}>
              Stay in the moment—or build a musical bridge toward calm.
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem',
              }}
            >
              Sometimes when you feel sad or tired, you want gentle songs that
              understand. Other times, you want a gradual bridge toward calm or
              happy energy. VibeShift supports both without forced positivity.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setMoodMode('match');
                  navigate('/discover');
                }}
              >
                Try Match My Mood
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setMoodMode('change');
                  navigate('/discover');
                }}
              >
                Try Change My Mood
              </button>
            </div>
          </article>

          <article className="glass-card glass-card-interactive bento-span-5">
            <span className="eyebrow-pill" style={{ marginBottom: '0.85rem' }}>
              <ShieldCheck size={14} />
              <span>Respectful AI & Privacy</span>
            </span>
            <h3 style={{ fontSize: '1.45rem', marginBottom: '0.55rem' }}>
              In-memory expression check—never a final judgment.
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              Our EfficientNet-B2 expression classifier processes camera
              snapshots strictly in RAM and never saves photos to disk. You
              always confirm or override the suggested mood before any music is
              selected.
            </p>
          </article>

          <article className="glass-card glass-card-interactive bento-span-4">
            <span className="eyebrow-pill" style={{ marginBottom: '0.85rem' }}>
              <Globe2 size={14} />
              <span>Multilingual Catalogue</span>
            </span>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.45rem' }}>
              Malayalam, Hindi, Tamil & English
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Filter across Melody, Pop, Rock, Classical, and Dance for
              relaxing, studying, workouts, travel, parties, or sleep.
            </p>
          </article>

          <article
            className="glass-card glass-card-interactive bento-span-8"
            style={{
              background:
                'linear-gradient(135deg, rgba(244, 203, 217, 0.42) 0%, rgba(255, 255, 255, 0.94) 55%, rgba(200, 244, 232, 0.5) 100%)',
            }}
          >
            <span className="eyebrow-pill" style={{ marginBottom: '0.85rem' }}>
              <Activity size={14} />
              <span>Categorical Mood Journey</span>
            </span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Track your confirmed check-ins across your listening session.
            </h3>
            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              Recheck your mood anytime while listening and explore a clean,
              chronological timeline of the moods you recorded—without
              pseudoscientific emotion scores.
            </p>
            <Link to="/journey" className="btn btn-secondary btn-sm">
              <span>Explore Mood Journey</span>
              <ArrowRight size={15} />
            </Link>
          </article>
        </div>
      </section>

      {/* 4. MOOD PERSONALIZATION & MUSIC DISCOVERY PREVIEW */}
      <section
        className="landing-section"
        aria-labelledby="preview-showcase-heading"
      >
        <div className="glass-card" style={{ padding: '2.25rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div>
              <span className="eyebrow-pill" style={{ marginBottom: '0.5rem' }}>
                <Sliders size={14} />
                <span>Interactive Vibe & Discovery Preview</span>
              </span>
              <h2 id="preview-showcase-heading" style={{ fontSize: '2rem' }}>
                Preview how VibeShift tunes to {activeOrbMeta.label}.
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setOrbMood(m.id)}
                  className={`btn btn-sm ${
                    orbMood === m.id ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.35rem',
              alignItems: 'stretch',
            }}
          >
            {/* Left: Mood Personalization Card */}
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '22px',
                background: activeOrbMeta.gradient,
                border: '1px solid rgba(31, 49, 73, 0.14)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <span
                  className="eyebrow-pill"
                  style={{ background: '#FFFFFF', marginBottom: '0.75rem' }}
                >
                  {activeOrbMeta.cameraMapped ? (
                    <>
                      <Camera size={13} />
                      <span>Camera or Manual Mood</span>
                    </>
                  ) : (
                    <span>Musical Mood · Manual Selection</span>
                  )}
                </span>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
                  {activeOrbMeta.label} Soundscape
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-navy)',
                    opacity: 0.88,
                  }}
                >
                  {activeOrbMeta.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(31, 49, 73, 0.12)',
                }}
              >
                <button
                  type="button"
                  className={`btn btn-sm ${
                    previewDirection === 'match'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                  onClick={() => setPreviewDirection('match')}
                >
                  Match {activeOrbMeta.label}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    previewDirection === 'change'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                  onClick={() => setPreviewDirection('change')}
                >
                  Shift Toward{' '}
                  {getMoodMeta(activeOrbMeta.recommendedTargets?.[0])?.label ||
                    'Calm'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickStartMood(activeOrbMeta.id)}
                  style={{ marginLeft: 'auto' }}
                >
                  <span>Start with {activeOrbMeta.label}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right: Sample Tracks from Catalogue */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-secondary)',
                }}
              >
                Sample Catalogue Matches for #{activeOrbMeta.label}
              </div>

              {samplePreviewTracks.map((track) => (
                <div
                  key={track.id}
                  style={{
                    padding: '0.95rem 1.15rem',
                    borderRadius: '16px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      minWidth: 0,
                    }}
                  >
                    <Disc3 size={20} color="#1F3149" />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {track.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {track.artist}
                      </div>
                    </div>
                  </div>
                  <span
                    className="eyebrow-pill"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                  >
                    {track.language} · {track.genre}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="landing-section" aria-labelledby="final-cta-heading">
        <div
          className="glass-card"
          style={{
            padding: '3.25rem 2rem',
            textAlign: 'center',
            background:
              'linear-gradient(135deg, #CDF7F3 0%, #C8F4E8 35%, #BFD6F5 70%, #F4CBD9 100%)',
            border: '1.5px solid rgba(31, 49, 73, 0.14)',
          }}
        >
          <span
            className="eyebrow-pill"
            style={{ background: '#FFFFFF', marginBottom: '1rem' }}
          >
            <Sparkles size={14} />
            <span>Ready Whenever You Are</span>
          </span>
          <h2
            id="final-cta-heading"
            style={{
              fontSize: 'clamp(2rem, 3.6vw, 2.85rem)',
              marginBottom: '0.75rem',
            }}
          >
            Every feeling deserves a soundtrack.
          </h2>
          <p
            style={{
              fontSize: '1.08rem',
              color: 'var(--text-navy)',
              maxWidth: '54ch',
              margin: '0 auto 1.75rem',
              opacity: 0.88,
            }}
          >
            Step into your personal space, check in with how you feel, and let
            VibeShift curate music that meets you right where you are.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.85rem',
            }}
          >
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/discover')}
            >
              <Sparkles size={18} />
              <span>Find My Vibe</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/dashboard')}
            >
              <span>Open Dashboard</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

