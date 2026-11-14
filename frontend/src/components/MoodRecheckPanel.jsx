import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw, Sparkles, X } from 'lucide-react';
import { MOODS, getMoodMeta } from '../config/constants';

export default function MoodRecheckPanel({
  currentMood,
  onSubmitRecheck,
  onClose,
}) {
  const [selectedMood, setSelectedMood] = useState(currentMood || 'calm');
  const [refreshTracks, setRefreshTracks] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedMood) return;
    setSubmitting(true);
    try {
      await onSubmitRecheck(selectedMood, { refreshTracks });
      if (onClose) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      aria-labelledby="mood-recheck-heading"
      className="impact-recheck-panel"
      data-testid="mood-recheck-panel"
    >
      <div className="impact-recheck-head">
        <div>
          <span className="badge badge-accent" style={{ marginBottom: '0.45rem' }}>
            <Sparkles size={13} />
            OPTIONAL SESSION CHECK-IN
          </span>
          <h3 id="mood-recheck-heading" className="impact-recheck-title">
            How are you feeling now?
          </h3>
          <p className="impact-recheck-sub">
            Log a new mood entry into your Mood Journey timeline — and optionally refresh your soundtrack to match where you are now.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onClose}
          aria-label="Close mood recheck panel"
        >
          <X size={16} />
          <span>Dismiss</span>
        </button>
      </div>

      <div
        className="impact-recheck-grid"
        role="radiogroup"
        aria-label="Select updated mood"
      >
        {MOODS.map((m) => {
          const isSelected = selectedMood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedMood(m.id)}
              className={`impact-recheck-mood-btn ${
                isSelected ? 'selected' : ''
              }`}
              data-testid={`recheck-mood-${m.id}`}
            >
              <span
                className="impact-dock-dot"
                style={{ background: m.orbColor }}
              />
              <span>{m.label}</span>
              {isSelected && <Check size={14} strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      <div className="impact-recheck-footer">
        <label className="impact-recheck-checkbox">
          <input
            type="checkbox"
            checked={refreshTracks}
            onChange={(e) => setRefreshTracks(e.target.checked)}
            style={{ width: '17px', height: '17px', accentColor: '#171717' }}
          />
          <span>
            Also refresh recommendations for{' '}
            <strong>{getMoodMeta(selectedMood).label}</strong>
          </span>
        </label>

        <button
          type="button"
          disabled={submitting}
          onClick={handleConfirm}
          className="btn btn-primary"
          data-testid="confirm-recheck-submit"
        >
          <RefreshCw size={15} />
          <span>
            {submitting ? 'Recording Check-In...' : 'Log Mood Update'}
          </span>
        </button>
      </div>
    </motion.section>
  );
}
