import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { MOODS, getMoodMeta } from '../config/constants';
import CameraPanel from './CameraPanel';

/**
 * Optional Mood Recheck Drawer / Modal during an active listening session (Section 21)
 * Prompt: "How are you feeling now?"
 * Allows:
 * - Confirm existing mood
 * - Choose a different mood
 * - Skip the recheck
 * - Optionally use the camera again (never activates camera silently!)
 * Records via POST /api/sessions/{id}/mood with source: "recheck"
 */
export default function MoodRecheckPanel({
  currentMood,
  apiMode = 'live',
  onSubmitRecheck,
  onClose,
}) {
  const [selectedMood, setSelectedMood] = useState(currentMood || 'calm');
  const [confidence, setConfidence] = useState(1.0);
  const [showCamera, setShowCamera] = useState(false);
  const [refreshAfter, setRefreshAfter] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const currentMeta = getMoodMeta(currentMood);
  const selectedMeta = getMoodMeta(selectedMood);

  const handleConfirmRecheck = async (moodToRecord = selectedMood) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmitRecheck({
        mood: moodToRecord,
        confidence,
        refreshAfter,
      });
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Could not record your mood recheck.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="glass-card"
      role="dialog"
      aria-modal="false"
      aria-labelledby="mood-recheck-heading"
      data-testid="mood-recheck-panel"
      style={{
        marginBottom: '1.75rem',
        border: '2px solid #1F3149',
        background: 'rgba(255, 255, 255, 0.96)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <span className="eyebrow-pill" style={{ marginBottom: '0.45rem' }}>
            <Sparkles size={13} />
            <span>Optional Listening Check-In</span>
          </span>
          <h3 id="mood-recheck-heading" style={{ fontSize: '1.5rem' }}>
            How are you feeling now?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Log a session mood recheck to update your Mood Journey timeline—and
            optionally refresh your recommendations.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          aria-label="Skip mood recheck"
        >
          <X size={18} />
          <span>Skip Recheck</span>
        </button>
      </div>

      {/* Quick Keep Current Mood or Toggle Camera */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '1.25rem',
        }}
      >
        {currentMeta && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={submitting}
            onClick={() => handleConfirmRecheck(currentMeta.id)}
          >
            <CheckCircle2 size={15} />
            <span>Still Feeling {currentMeta.label}</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setShowCamera((s) => !s)}
        >
          <Camera size={15} />
          <span>
            {showCamera
              ? 'Hide Optional Camera'
              : 'Use Optional Camera Estimate'}
          </span>
        </button>
      </div>

      {showCamera && (
        <div style={{ marginBottom: '1.25rem' }}>
          <CameraPanel
            apiMode={apiMode}
            onAcceptSuggestedMood={(moodId, conf) => {
              setSelectedMood(moodId);
              setConfidence(conf || 1.0);
              setShowCamera(false);
            }}
            onSwitchToManual={() => setShowCamera(false)}
          />
        </div>
      )}

      {/* Mood Picker Chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
          gap: '0.65rem',
          marginBottom: '1.25rem',
        }}
      >
        {MOODS.map((m) => {
          const isSelected = selectedMood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedMood(m.id);
                setConfidence(1.0);
              }}
              aria-pressed={isSelected}
              data-testid={`recheck-mood-${m.id}`}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                border: isSelected
                  ? '2px solid #1F3149'
                  : '1px solid rgba(31, 49, 73, 0.14)',
                background: isSelected ? m.gradient : '#FFFFFF',
                fontWeight: 600,
                color: '#1F3149',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>{m.label}</div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                {m.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Refresh checkbox & Submit */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={refreshAfter}
            onChange={(e) => setRefreshAfter(e.target.checked)}
          />
          <span>
            Also refresh recommendations for{' '}
            <strong>{selectedMeta?.label || selectedMood}</strong>
          </span>
        </label>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={submitting}
          >
            Skip for Now
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleConfirmRecheck(selectedMood)}
            disabled={submitting}
            data-testid="confirm-recheck-submit"
          >
            <RefreshCw size={15} />
            <span>
              {submitting
                ? 'Recording Recheck…'
                : `Confirm ${selectedMeta?.label || ''} Recheck`}
            </span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="alert-banner error"
          style={{ marginTop: '1rem' }}
        >
          {errorMsg}
        </div>
      )}
    </section>
  );
}

