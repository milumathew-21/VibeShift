import React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  CloudRain,
  Compass,
  Flame,
  Sun,
  Wind,
  Zap,
} from 'lucide-react';
import MoodArtGraphic from './MoodArtGraphic';

const ICON_MAP = {
  Sun,
  Wind,
  CloudRain,
  Zap,
  Flame,
  Compass,
};

export default function MoodCard({
  mood,
  selected = false,
  onSelect,
  disabled = false,
  compact = false,
  badgeText = null,
}) {
  const Icon = ICON_MAP[mood.iconName] || Compass;

  // Gentle, non-jarring hover motion for sad or angry states
  const isGentleMood = mood.id === 'sad' || mood.id === 'angry';
  const theme = mood.artworkTheme || {
    bg: '#DFF3A3',
    fg: '#171717',
    secondary: '#3577D4',
    tertiary: '#FFFFFF',
    pattern: 'sunburst',
  };

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect(mood.id)}
      whileHover={
        disabled
          ? {}
          : {
              y: isGentleMood ? -3 : -6,
              scale: isGentleMood ? 1.005 : 1.015,
            }
      }
      whileTap={disabled ? {} : { scale: 0.99 }}
      transition={{
        duration: isGentleMood ? 0.42 : 0.24,
        ease: 'easeOut',
      }}
      className={`mood-card impact-mood-tile ${selected ? 'selected' : ''} ${
        compact ? 'impact-mood-tile--compact' : ''
      }`}
      aria-pressed={selected}
      data-testid={`mood-card-${mood.id}`}
    >
      {/* Editorial Artwork Banner */}
      <div
        className="impact-mood-tile-art"
        style={{ height: compact ? '96px' : '128px' }}
      >
        <MoodArtGraphic
          pattern={theme.pattern}
          bg={theme.bg}
          fg={theme.fg}
          secondary={theme.secondary}
          tertiary={theme.tertiary}
        />

        <div className="impact-mood-tile-art-top">
          <span className="impact-mood-edition">
            #{mood.editorialNumber || '01'} • {mood.soundscapeTitle}
          </span>
          {selected && (
            <span className="impact-mood-selected-check">
              <Check size={13} strokeWidth={3} />
              <span>Selected</span>
            </span>
          )}
        </div>
      </div>

      {/* Editorial Copy Block */}
      <div className="impact-mood-tile-body">
        <div className="impact-mood-tile-title-row">
          <div className="impact-mood-tile-heading">
            <span
              className="impact-mood-icon-box"
              style={{
                background: mood.pillColor,
                color: '#171717',
              }}
            >
              <Icon size={17} />
            </span>
            <div>
              <h3 className="impact-mood-name">{mood.label}</h3>
              <div className="impact-mood-tagline">{mood.tagline}</div>
            </div>
          </div>

          {badgeText && (
            <span className="badge badge-neutral">{badgeText}</span>
          )}
        </div>

        {!compact && (
          <p className="impact-mood-description">{mood.description}</p>
        )}
      </div>
    </motion.button>
  );
}
