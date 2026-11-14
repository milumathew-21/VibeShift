import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { MOODS, getMoodMeta } from '../config/constants';
import MoodCard from './MoodCard';

export default function TargetMoodSelector({
  currentMood,
  targetMood,
  onSelectTargetMood,
}) {
  const currentMeta = getMoodMeta(currentMood);
  const targetMeta = getMoodMeta(targetMood);
  const recommendedList = currentMeta?.recommendedTargets || [
    'calm',
    'happy',
    'energetic',
  ];

  return (
    <div
      className="glass-card"
      style={{
        marginTop: '1.35rem',
        background: 'rgba(255, 255, 255, 0.88)',
      }}
      data-testid="target-mood-selector"
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <span className="eyebrow-pill" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={13} />
            <span>Target Mood Selection (Required for Change Mode)</span>
          </span>
          <h3 style={{ fontSize: '1.45rem' }}>
            Which feeling would you like to move toward?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Choose a supported VibeShift target mood below. Songs will be curated
            to gently bridge your vibe.
          </p>
        </div>

        {currentMeta && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.55rem 1rem',
              borderRadius: '999px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
          >
            <span>From: {currentMeta.label}</span>
            <ArrowRight size={15} />
            <span>
              To: {targetMeta ? targetMeta.label : 'Select target mood'}
            </span>
          </div>
        )}
      </div>

      <div className="mood-grid">
        {MOODS.map((mood) => {
          const isRecommended =
            recommendedList.includes(mood.id) && mood.id !== currentMood;
          return (
            <MoodCard
              key={mood.id}
              mood={mood}
              compact
              selected={targetMood === mood.id}
              onSelect={onSelectTargetMood}
              recommendedBadge={isRecommended ? 'Gentle Bridge' : null}
            />
          );
        })}
      </div>
    </div>
  );
}

