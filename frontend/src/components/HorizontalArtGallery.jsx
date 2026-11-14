import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Disc3 } from 'lucide-react';
import { HERO_GALLERY_PANELS } from '../config/constants';
import MoodArtGraphic from './MoodArtGraphic';

export default function HorizontalArtGallery({
  activeMoodId = 'happy',
  onSelectPanel,
}) {
  return (
    <div
      className="impact-gallery-backdrop"
      aria-label="Curated music mood and genre visual gallery"
      data-testid="hero-horizontal-gallery"
    >
      <div className="impact-gallery-track">
        {HERO_GALLERY_PANELS.map((panel, index) => {
          const isSelected = panel.moodId === activeMoodId;
          // Create an organic editorial vertical rhythm across the horizontal strip
          const verticalOffset = index % 2 === 0 ? -10 : 12;

          return (
            <motion.button
              key={panel.id}
              type="button"
              onClick={() => onSelectPanel && onSelectPanel(panel)}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: verticalOffset }}
              whileHover={{ y: verticalOffset - 10, scale: 1.03 }}
              transition={{
                duration: 0.55,
                delay: 0.06 * index,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`impact-gallery-card ${isSelected ? 'selected' : ''}`}
              style={{
                background: panel.bg,
                color: panel.text,
              }}
            >
              {/* Top Meta Row */}
              <div className="impact-gallery-card-top">
                <span className="impact-gallery-category">{panel.category}</span>
                <span className="impact-gallery-icon-pill">
                  <ArrowUpRight size={13} />
                </span>
              </div>

              {/* Artwork Frame */}
              <div className="impact-gallery-art-frame">
                <MoodArtGraphic
                  pattern={panel.pattern}
                  bg={panel.bg}
                  fg={panel.text}
                  secondary={panel.accent}
                  tertiary="#FFFFFF"
                />
              </div>

              {/* Editorial Title & Track Sample */}
              <div className="impact-gallery-card-bottom">
                <div className="impact-gallery-title-row">
                  <span className="impact-gallery-title">{panel.title}</span>
                  <span className="impact-gallery-subtitle">{panel.subtitle}</span>
                </div>
                <div className="impact-gallery-sample">
                  <Disc3 size={12} />
                  <span>{panel.trackSample}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

