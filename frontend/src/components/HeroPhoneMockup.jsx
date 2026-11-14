import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Disc3,
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  Wand2,
} from 'lucide-react';
import { MOODS, getMoodMeta } from '../config/constants';
import { MOCK_SONGS } from '../mocks/mockData';
import MoodArtGraphic from './MoodArtGraphic';

export default function HeroPhoneMockup({
  activeMoodId = 'happy',
  onSelectMood,
  onLaunchMood,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(true);
  const [tilt, setTilt] = useState({ rotateX: 4, rotateY: -6 });

  const moodMeta = getMoodMeta(activeMoodId);
  const theme = moodMeta.artworkTheme || {
    bg: '#DFF3A3',
    fg: '#171717',
    secondary: '#3577D4',
    tertiary: '#FFFFFF',
    pattern: 'sunburst',
  };

  // Pick a signature track for the active mood
  const featuredTrack =
    MOCK_SONGS.find((s) => (s.mood_tags || []).includes(moodMeta.id)) ||
    MOCK_SONGS[0];

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: Number((-y * 12).toFixed(2)),
      rotateY: Number((x * 14).toFixed(2)),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 4, rotateY: -6 });
  };

  return (
    <motion.div
      className="impact-phone-stage"
      initial={{ opacity: 0, y: 42, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      data-testid="hero-floating-phone"
    >
      {/* Floating ambient glow behind smartphone */}
      <div
        className="impact-phone-aura"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${moodMeta.pillColor} 0%, rgba(53, 119, 212, 0.18) 48%, transparent 74%)`,
        }}
        aria-hidden="true"
      />

      {/* Floating side status chip (left) */}
      <motion.div
        className="impact-phone-float-chip impact-phone-float-chip--left"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span
          className="impact-float-dot"
          style={{ background: moodMeta.orbColor }}
        />
        <div>
          <div className="impact-float-chip-kicker">ACTIVE RESONANCE</div>
          <div className="impact-float-chip-value">
            {moodMeta.label} • {featuredTrack.language}
          </div>
        </div>
      </motion.div>

      {/* Floating side status chip (right) */}
      <motion.div
        className="impact-phone-float-chip impact-phone-float-chip--right"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <Wand2 size={15} color="#171717" />
        <div>
          <div className="impact-float-chip-kicker">ADAPTIVE ENGINE</div>
          <div className="impact-float-chip-value">Match or Shift Vibe</div>
        </div>
      </motion.div>

      {/* 3D Hardware Phone Frame */}
      <div
        className="impact-phone-device"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* Side hardware buttons */}
        <span className="impact-phone-hw-btn impact-phone-hw-btn--vol1" aria-hidden="true" />
        <span className="impact-phone-hw-btn impact-phone-hw-btn--vol2" aria-hidden="true" />
        <span className="impact-phone-hw-btn impact-phone-hw-btn--power" aria-hidden="true" />

        {/* Inner Bezel & Screen */}
        <div className="impact-phone-screen">
          {/* Dynamic Island + Status Bar */}
          <div className="impact-phone-statusbar">
            <span className="impact-phone-time">9:41</span>
            <div className="impact-phone-island" aria-hidden="true">
              <span className="impact-phone-speaker" />
              <span
                className="impact-phone-cam-dot"
                style={{ background: isPlaying ? '#DFF3A3' : '#3577D4' }}
              />
            </div>
            <span className="impact-phone-signal">5G • 100%</span>
          </div>

          {/* App Header inside Phone */}
          <div className="impact-phone-appbar">
            <div className="impact-phone-brand">
              <span className="impact-phone-brand-mark">
                <Disc3
                  size={14}
                  className={isPlaying ? 'spin-slow' : ''}
                />
              </span>
              <span>VibeShift</span>
            </div>
            <span
              className="impact-phone-mood-pill"
              style={{
                background: moodMeta.pillColor,
                color: '#171717',
              }}
            >
              <Sparkles size={11} />
              {moodMeta.label} Vibe
            </span>
          </div>

          {/* Interactive Mood Switcher Row inside Phone */}
          <div
            className="impact-phone-mood-tabs"
            role="tablist"
            aria-label="Preview mood inside phone mockup"
          >
            {MOODS.map((m) => {
              const active = m.id === moodMeta.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectMood && onSelectMood(m.id)}
                  className={`impact-phone-mood-tab ${active ? 'active' : ''}`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Featured Artwork Card inside Phone */}
          <div className="impact-phone-artwork-card">
            <div className="impact-phone-artwork-canvas">
              <MoodArtGraphic
                pattern={theme.pattern}
                bg={theme.bg}
                fg={theme.fg}
                secondary={theme.secondary}
                tertiary={theme.tertiary}
              />
              <div className="impact-phone-artwork-overlay">
                <span className="impact-phone-edition-tag">
                  EDITION #{moodMeta.editorialNumber || '01'}
                </span>
                <span className="impact-phone-soundscape-name">
                  {moodMeta.soundscapeTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Track Metadata */}
          <div className="impact-phone-track-info">
            <div className="impact-phone-track-text">
              <div className="impact-phone-track-title" title={featuredTrack.title}>
                {featuredTrack.title}
              </div>
              <div className="impact-phone-track-artist">
                {featuredTrack.artist} • {featuredTrack.genre}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLiked((prev) => !prev)}
              className={`impact-phone-like-btn ${isLiked ? 'liked' : ''}`}
              aria-label="Toggle favorite in preview"
            >
              <Heart
                size={15}
                fill={isLiked ? '#171717' : 'none'}
                color="#171717"
              />
            </button>
          </div>

          {/* Animated Waveform & Progress */}
          <div className="impact-phone-waveform" aria-hidden="true">
            {[38, 72, 54, 92, 64, 86, 45, 78, 96, 60, 82, 50, 74, 88, 42, 68, 56, 80].map(
              (height, idx) => (
                <span
                  key={idx}
                  className={`impact-wave-bar ${isPlaying ? 'playing' : ''}`}
                  style={{
                    height: `${height}%`,
                    animationDelay: `${idx * 0.07}s`,
                    background:
                      idx < 11
                        ? '#171717'
                        : 'rgba(23, 23, 23, 0.22)',
                  }}
                />
              )
            )}
          </div>

          <div className="impact-phone-timestamps">
            <span>1:24</span>
            <span>SPOTIFY READY</span>
            <span>3:42</span>
          </div>

          {/* Playback Controls */}
          <div className="impact-phone-controls">
            <button
              type="button"
              className="impact-phone-ctrl-icon"
              onClick={() => {
                const idx = MOODS.findIndex((m) => m.id === moodMeta.id);
                const prev = MOODS[(idx - 1 + MOODS.length) % MOODS.length];
                onSelectMood && onSelectMood(prev.id);
              }}
              aria-label="Previous mood preview"
            >
              <SkipBack size={16} />
            </button>

            <button
              type="button"
              className="impact-phone-play-fab"
              onClick={() => setIsPlaying((prev) => !prev)}
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              type="button"
              className="impact-phone-ctrl-icon"
              onClick={() => {
                const idx = MOODS.findIndex((m) => m.id === moodMeta.id);
                const next = MOODS[(idx + 1) % MOODS.length];
                onSelectMood && onSelectMood(next.id);
              }}
              aria-label="Next mood preview"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Bottom Action CTA inside Phone */}
          <button
            type="button"
            onClick={() => onLaunchMood && onLaunchMood(moodMeta.id)}
            className="impact-phone-bottom-cta"
          >
            <Volume2 size={14} />
            <span>Launch {moodMeta.label} Soundtrack</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

