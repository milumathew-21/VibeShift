import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  Disc3,
  Headphones,
  Layers,
  Play,
  Sliders,
  Sparkles,
  Wand2,
} from 'lucide-react';
import HeroPhoneMockup from '../components/HeroPhoneMockup';
import HorizontalArtGallery from '../components/HorizontalArtGallery';
import AnimatedMoodOrb from '../components/AnimatedMoodOrb';
import MoodArtGraphic from '../components/MoodArtGraphic';
import { MOODS, getMoodMeta } from '../config/constants';
import { MOCK_SONGS } from '../mocks/mockData';
import { useVibeShift } from '../context/VibeShiftContext';

const EDITORIAL_PROCESS_STEPS = [
  {
    number: '01',
    title: '01 — Discover Your Mood',
    kicker: 'SENSORY CHECK-IN',
    description:
      'Choose how you feel across six expressive mood states — or use optional camera expression estimation with explicit confirmation.',
    pill: 'Manual + Optional Camera',
    accentBg: '#DFF3A3',
    accentText: '#171717',
    pattern: 'sunburst',
    align: 'left',
  },
  {
    number: '02',
    title: '02 — Choose Your Vibe',
    kicker: 'INTENTIONAL DIRECTION',
    description:
      'Decide whether to Match My Mood (“Stay with the feeling.”) or Change My Mood (“Find a different vibe.”) toward a target emotional state.',
    pill: 'Match or Shift Mode',
    accentBg: '#F3BDD0',
    accentText: '#171717',
    pattern: 'ripples',
    align: 'right',
  },
  {
    number: '03',
    title: '03 — Personalize Your Music',
    kicker: 'CULTURAL & SONIC CURATION',
    description:
      'Filter across English, Malayalam, Hindi, and Tamil catalogues, five core genres, and six everyday activity contexts.',
    pill: '4 Languages • 5 Genres',
    accentBg: '#3577D4',
    accentText: '#FFFFFF',
    pattern: 'waves',
    align: 'left',
  },
  {
    number: '04',
    title: '04 — Enjoy Your Soundtrack',
    kicker: 'ADAPTIVE PLAYBACK & JOURNEY',
    description:
      'Stream via official Spotify Embeds or Demo Ambient Synth, shape recommendations with Like/Replay/Skip, and chart your Mood Journey.',
    pill: 'Spotify Embed + Timeline',
    accentBg: '#171717',
    accentText: '#DFF3A3',
    pattern: 'vinyl',
    align: 'right',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { currentMood, selectMood } = useVibeShift();
  const [previewMood, setPreviewMood] = useState(currentMood || 'happy');

  const activeMoodMeta = useMemo(() => getMoodMeta(previewMood), [previewMood]);

  // Curate 3 real songs from the catalogue for the active preview mood
  const previewSongs = useMemo(() => {
    return MOCK_SONGS.filter((song) =>
      (song.mood_tags || []).includes(previewMood)
    ).slice(0, 3);
  }, [previewMood]);

  const handleQuickMoodLaunch = (moodId) => {
    selectMood(moodId, { source: 'manual', confidence: 1.0, confirmed: false });
    navigate('/discover');
  };

  return (
    <div className="impact-home-wrapper">
      {/* =====================================================================
          SECTION 6, 7, 8 — IMPACT FLOW EDITORIAL HERO + FLOATING PHONE + GALLERY
          ===================================================================== */}
      <section className="impact-hero-section" aria-label="VibeShift Editorial Hero">
        <div className="container impact-hero-container">
          {/* Editorial Top Tagline Strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="impact-hero-eyebrow-row"
          >
            <span className="impact-eyebrow-pill">
              <Sparkles size={13} />
              AI-POWERED ADAPTIVE MUSIC STUDIO
            </span>
            <span className="impact-eyebrow-divider" aria-hidden="true">
              /
            </span>
            <span className="impact-eyebrow-meta">
              EN • ML • HI • TA CATALOGUE
            </span>
          </motion.div>

          {/* Giant Editorial Headline Stack */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="impact-hero-headline-block"
          >
            <div className="impact-campaign-supertitle" aria-hidden="true">
              FEEL IT. <span className="impact-highlight-lime">SHIFT IT.</span> PLAY IT.
            </div>
            <h1 className="impact-hero-h1">
              Your mood. Your music. Your moment.
            </h1>
            <p className="impact-hero-lead">
              “Music for where you are, and where you want to go.”
            </p>
          </motion.div>

          {/* Primary & Secondary Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="impact-hero-cta-row"
          >
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="btn btn-primary btn-lg impact-cta-primary"
              data-testid="hero-find-my-vibe-btn"
            >
              <span>Find My Vibe</span>
              <ArrowRight size={19} />
            </button>

            <a
              href="#how-it-works"
              className="btn btn-secondary btn-lg impact-cta-secondary"
              data-testid="hero-explore-how-btn"
            >
              <Compass size={18} />
              <span>Explore the Experience</span>
            </a>
          </motion.div>
        </div>

        {/* Full-Bleed Overlapping Stage: Horizontal Art Gallery + Floating Smartphone */}
        <div className="impact-showcase-stage">
          <HorizontalArtGallery
            activeMoodId={previewMood}
            onSelectPanel={(panel) => setPreviewMood(panel.moodId)}
          />

          <div className="impact-showcase-phone-center">
            <HeroPhoneMockup
              activeMoodId={previewMood}
              onSelectMood={setPreviewMood}
              onLaunchMood={handleQuickMoodLaunch}
            />
          </div>
        </div>

        {/* Interactive Mood Switcher Bar Underneath Hero Stage */}
        <div className="container">
          <div className="impact-hero-mood-dock">
            <span className="impact-dock-label">
              LIVE STAGE MOOD:
            </span>
            <div
              className="impact-dock-pills"
              role="group"
              aria-label="Preview mood atmosphere on the hero stage"
            >
              {MOODS.map((m) => {
                const isSelected = previewMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPreviewMood(m.id)}
                    className={`impact-dock-pill ${isSelected ? 'active' : ''}`}
                    style={
                      isSelected
                        ? {
                            background: '#171717',
                            color: '#DFF3A3',
                            borderColor: '#171717',
                          }
                        : undefined
                    }
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
            <button
              type="button"
              onClick={() => handleQuickMoodLaunch(previewMood)}
              className="impact-dock-launch-link"
            >
              <span>Start with {activeMoodMeta.label}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 11 — EDITORIAL "HOW IT WORKS" ASYMMETRICAL PROCESS FLOW
          ===================================================================== */}
      <section
        id="how-it-works"
        className="section impact-process-section"
        aria-labelledby="how-it-works-heading"
      >
        <div className="container">
          <div className="impact-section-header">
            <div>
              <span className="eyebrow">
                <Layers size={14} />
                THE VIBESHIFT METHOD
              </span>
              <h2 id="how-it-works-heading" className="impact-section-title">
                Designed around how emotions actually move.
              </h2>
            </div>
            <p className="impact-section-subcopy">
              Instead of locking you into static playlists, VibeShift pairs emotional check-ins with intentional Match or Shift transitions.
            </p>
          </div>

          <div className="impact-process-timeline">
            <div className="impact-process-spine" aria-hidden="true" />
            {EDITORIAL_PROCESS_STEPS.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className={`impact-process-row impact-process-row--${step.align}`}
              >
                {/* Giant Editorial Number Node */}
                <div className="impact-process-num-badge">
                  <span>{step.number}</span>
                </div>

                {/* Editorial Content Card */}
                <div className="impact-process-card">
                  <div className="impact-process-card-copy">
                    <div className="impact-process-kicker-row">
                      <span className="impact-process-kicker">{step.kicker}</span>
                      <span
                        className="impact-process-pill"
                        style={{
                          background: step.accentBg,
                          color: step.accentText,
                        }}
                      >
                        {step.pill}
                      </span>
                    </div>
                    <h3 className="impact-process-step-title">{step.title}</h3>
                    <p className="impact-process-step-desc">{step.description}</p>
                  </div>

                  <div className="impact-process-card-art">
                    <MoodArtGraphic
                      pattern={step.pattern}
                      bg={step.accentBg}
                      fg={step.accentText}
                      secondary={index % 2 === 0 ? '#3577D4' : '#DFF3A3'}
                      tertiary="#FFFFFF"
                    />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 9 — SECONDARY 3D SONIC RESONANCE & CATALOGUE STUDIO
          ===================================================================== */}
      <section
        className="section impact-3d-studio-section"
        aria-labelledby="studio-resonance-heading"
      >
        <div className="container">
          <div className="impact-3d-studio-grid">
            {/* Left Column: 3D Mood Sculpture */}
            <div className="impact-3d-stage-card">
              <div className="impact-3d-stage-header">
                <span className="badge badge-accent">
                  <Wand2 size={13} />
                  INTERACTIVE 3D RESONANCE
                </span>
                <span className="impact-3d-edition">
                  MOOD #{activeMoodMeta.editorialNumber}
                </span>
              </div>

              <AnimatedMoodOrb mood={previewMood} height={370} />

              <div className="impact-3d-mood-bar">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPreviewMood(m.id)}
                    className={`impact-3d-mood-chip ${
                      previewMood === m.id ? 'active' : ''
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Live Curated Catalogue Preview for Active Mood */}
            <div className="impact-3d-catalogue-panel">
              <span className="eyebrow">
                <Disc3 size={14} />
                REAL-TIME SOUNDTRACK PREVIEW
              </span>
              <h2 id="studio-resonance-heading" className="impact-section-title">
                {activeMoodMeta.label}: {activeMoodMeta.soundscapeTitle}
              </h2>
              <p className="impact-3d-description">
                {activeMoodMeta.description} Explore real tracks tagged for{' '}
                <strong>{activeMoodMeta.label.toLowerCase()}</strong> moments across our multi-language library.
              </p>

              <div className="impact-preview-track-list">
                {previewSongs.map((song, idx) => (
                  <div key={song.id} className="impact-preview-track-item">
                    <div className="impact-preview-track-index">
                      0{idx + 1}
                    </div>
                    <div className="impact-preview-track-meta">
                      <div className="impact-preview-track-title">
                        {song.title}
                      </div>
                      <div className="impact-preview-track-sub">
                        {song.artist} • {song.language} • {song.genre}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickMoodLaunch(previewMood)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Play size={13} />
                      <span>Cue</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="impact-3d-actions">
                <button
                  type="button"
                  onClick={() => handleQuickMoodLaunch(previewMood)}
                  className="btn btn-primary btn-lg"
                >
                  <Headphones size={18} />
                  <span>Open {activeMoodMeta.label} Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-secondary btn-lg"
                >
                  <Sliders size={17} />
                  <span>Go to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          CLOSING EDITORIAL CALL TO ACTION BANNER
          ===================================================================== */}
      <section className="section" style={{ paddingTop: '1rem', paddingBottom: '4.5rem' }}>
        <div className="container">
          <div className="impact-closing-banner">
            <div className="impact-closing-copy">
              <span className="impact-closing-tag">
                READY WHEN YOU ARE
              </span>
              <h2 className="impact-closing-title">
                Tune into where you are — or shift where you’re headed.
              </h2>
              <p className="impact-closing-sub">
                Start with a manual mood tile or an optional camera check-in. Your session stays honest, private, and tailored to your taste.
              </p>
            </div>
            <div className="impact-closing-actions">
              <button
                type="button"
                onClick={() => navigate('/discover')}
                className="btn impact-btn-lime btn-lg"
              >
                <span>Start Mood Discovery</span>
                <ArrowRight size={19} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
