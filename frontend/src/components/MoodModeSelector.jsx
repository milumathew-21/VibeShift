import React from 'react';
import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { MOOD_MODES, getMoodMeta } from '../config/constants';

export default function MoodModeSelector({
  mode = 'match',
  onSelectMode,
  currentMood,
}) {
  const currentMoodMeta = getMoodMeta(currentMood);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}
      role="radiogroup"
      aria-label="Choose whether to match or change your current mood"
    >
      {MOOD_MODES.map((item) => {
        const isSelected = mode === item.id;
        const Icon = item.id === 'match' ? Compass : Sparkles;

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-testid={`mode-card-${item.id}`}
            onClick={() => onSelectMode(item.id)}
            className={`mood-card ${isSelected ? 'selected' : ''}`}
            style={{
              background: isSelected
                ? item.id === 'match'
                  ? 'linear-gradient(135deg, #CDF7F3 0%, #C8F4E8 55%, #BFD6F5 100%)'
                  : 'linear-gradient(135deg, #F4CBD9 0%, #BFD6F5 55%, #CDF7F3 100%)'
                : 'rgba(255, 255, 255, 0.88)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
                <Icon size={14} />
                <span>{item.badge}</span>
              </span>

              {isSelected && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: '#FFFFFF',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>Active Mode</span>
                </span>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 600,
                  color: 'var(--text-navy)',
                }}
              >
                “{item.description}”
              </p>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {item.detail}
              {item.id === 'match' && currentMoodMeta
                ? ` Currently tuned to ${currentMoodMeta.label}.`
                : ''}
            </p>
          </button>
        );
      })}
    </div>
  );
}

