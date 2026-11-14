import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { MOODS, getMoodMeta } from '../config/constants';
import MoodCard from './MoodCard';

export default function TargetMoodSelector({
  currentMood,
  targetMood,
  onSelectTargetMood,
}) {
  const currentMeta = currentMood ? getMoodMeta(currentMood) : null;
  const targetMeta = targetMood ? getMoodMeta(targetMood) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="impact-target-mood-box"
      data-testid="target-mood-selector"
    >
      <div className="impact-target-mood-head">
        <div>
          <span className="eyebrow" style={{ marginBottom: '0.45rem' }}>
            <Sparkles size={13} />
            TARGET MOOD DESTINATION
          </span>
          <h4 className="impact-target-title">
            Where would you like the music to take you?
          </h4>
          <p className="impact-target-sub">
            Choose the target emotional state you want your playlist to build toward.
          </p>
        </div>

        <div className="impact-target-bridge-pill">
          <span>{currentMeta ? currentMeta.label : 'Current'}</span>
          <ArrowRight size={14} />
          <strong>
            {targetMeta ? targetMeta.label : 'Select Target Mood'}
          </strong>
        </div>
      </div>

      <div className="grid-3">
        {MOODS.map((mood) => {
          const isSameAsCurrent = mood.id === currentMood;
          return (
            <MoodCard
              key={mood.id}
              mood={mood}
              compact
              selected={targetMood === mood.id}
              onSelect={onSelectTargetMood}
              badgeText={isSameAsCurrent ? 'Current Mood' : null}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
