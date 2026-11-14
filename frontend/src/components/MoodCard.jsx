import React from 'react';
import {
  Sun,
  Feather,
  CloudRain,
  Zap,
  Flame,
  Compass,
  CheckCircle2,
  Camera,
  Hand,
} from 'lucide-react';

const ICON_MAP = {
  Sun,
  Feather,
  CloudRain,
  Zap,
  Flame,
  Compass,
};

export default function MoodCard({
  mood,
  selected = false,
  onSelect,
  compact = false,
  recommendedBadge = null,
}) {
  const IconComponent = ICON_MAP[mood.icon] || Sun;

  return (
    <button
      type="button"
      onClick={() => onSelect(mood.id)}
      className={`mood-card ${selected ? 'selected' : ''}`}
      aria-pressed={selected}
      data-testid={`mood-card-${mood.id}`}
      style={{
        background: selected
          ? mood.gradient
          : `linear-gradient(160deg, rgba(255,255,255,0.94) 0%, ${mood.surfaceTint} 100%)`,
        padding: compact ? '1.15rem' : '1.55rem',
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
        <div
          className="mood-card-icon-wrap"
          style={{
            background: selected ? '#FFFFFF' : mood.gradient,
          }}
          aria-hidden="true"
        >
          <IconComponent size={compact ? 20 : 24} color="#1F3149" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {recommendedBadge && (
            <span
              className="eyebrow-pill"
              style={{
                padding: '0.2rem 0.6rem',
                fontSize: '0.68rem',
                background: '#FFFFFF',
              }}
            >
              {recommendedBadge}
            </span>
          )}
          {selected && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#1F3149',
                background: 'rgba(255, 255, 255, 0.88)',
                padding: '0.24rem 0.65rem',
                borderRadius: '999px',
              }}
            >
              <CheckCircle2 size={15} />
              <span>Selected</span>
            </span>
          )}
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: compact ? '1.2rem' : '1.4rem',
            fontWeight: 600,
            color: '#1F3149',
            marginBottom: '0.15rem',
          }}
        >
          {mood.label}
        </div>
        <div
          style={{
            fontSize: '0.84rem',
            fontWeight: 600,
            color: mood.accentColor,
          }}
        >
          {mood.tagline}
        </div>
      </div>

      {!compact && (
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
          }}
        >
          {mood.description}
        </p>
      )}

      {!compact && (
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {mood.cameraMapped ? (
            <>
              <Camera size={13} aria-hidden="true" />
              <span>Camera or manual choice</span>
            </>
          ) : (
            <>
              <Hand size={13} aria-hidden="true" />
              <span>Musical mood · Manual choice</span>
            </>
          )}
        </div>
      )}
    </button>
  );
}

