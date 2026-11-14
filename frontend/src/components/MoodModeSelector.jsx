import React from 'react';
import { motion } from 'framer-motion';
import { Check, Heart, Wand2 } from 'lucide-react';
import { MOOD_MODES } from '../config/constants';
import MoodArtGraphic from './MoodArtGraphic';

export default function MoodModeSelector({ mode = 'match', onChangeMode }) {
  return (
    <div
      className="grid-2 impact-mode-grid"
      role="radiogroup"
      aria-label="Choose how music should respond to your mood"
    >
      {MOOD_MODES.map((item) => {
        const isSelected = mode === item.id;
        const Icon = item.id === 'match' ? Heart : Wand2;
        const pattern = item.id === 'match' ? 'waves' : 'ripples';
        const artBg = item.id === 'match' ? '#DFF3A3' : '#F3BDD0';
        const artSecondary = item.id === 'match' ? '#3577D4' : '#171717';

        return (
          <motion.button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChangeMode(item.id)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            className={`impact-mode-panel ${isSelected ? 'selected' : ''}`}
            data-testid={`mode-card-${item.id}`}
          >
            {/* Editorial Visual Strip */}
            <div className="impact-mode-panel-art">
              <MoodArtGraphic
                pattern={pattern}
                bg={artBg}
                fg="#171717"
                secondary={artSecondary}
                tertiary="#FFFFFF"
              />
              <div className="impact-mode-panel-badges">
                <span className="impact-mode-badge">{item.badge}</span>
                {isSelected && (
                  <span className="impact-mode-active-pill">
                    <Check size={13} strokeWidth={3} />
                    <span>Active Mode</span>
                  </span>
                )}
              </div>
            </div>

            {/* Panel Copy */}
            <div className="impact-mode-panel-body">
              <div className="impact-mode-title-row">
                <span
                  className="impact-mode-icon"
                  style={{
                    background: isSelected ? '#171717' : artBg,
                    color: isSelected ? '#DFF3A3' : '#171717',
                  }}
                >
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="impact-mode-heading">{item.label}</h3>
                  <div className="impact-mode-quote">“{item.subtitle}”</div>
                </div>
              </div>

              <p className="impact-mode-desc">{item.description}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
