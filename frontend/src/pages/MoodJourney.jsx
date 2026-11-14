import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart as LineChartIcon,
  RefreshCw,
  SmilePlus,
  Disc3,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useVibeShift } from '../context/VibeShiftContext';
import { getMoodMeta } from '../config/constants';
import MoodChart from '../components/MoodChart';
import MoodRecheckPanel from '../components/MoodRecheckPanel';

export default function MoodJourney() {
  const navigate = useNavigate();
  const {
    apiMode,
    sessionId,
    sessionCreatedAt,
    currentMood,
    mode,
    targetMood,
    journeyEntries,
    journeyLoading,
    journeyError,
    loadSessionJourney,
    submitMoodRecheck,
  } = useVibeShift();

  const [recheckOpen, setRecheckOpen] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSessionJourney().catch(() => {});
    }
  }, [sessionId, loadSessionJourney]);

  const firstEntry = journeyEntries[0] || null;
  const latestEntry =
    journeyEntries.length > 0
      ? journeyEntries[journeyEntries.length - 1]
      : null;

  const firstMoodMeta = firstEntry ? getMoodMeta(firstEntry.mood) : null;
  const latestMoodMeta = latestEntry
    ? getMoodMeta(latestEntry.mood)
    : getMoodMeta(currentMood);
  const targetMoodMeta = targetMood ? getMoodMeta(targetMood) : null;

  return (
    <div data-testid="mood-journey-page">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          marginBottom: '1.75rem',
          background:
            'linear-gradient(135deg, #CDF7F3 0%, #C8F4E8 40%, #BFD6F5 80%, #F4CBD9 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div>
            <span
              className="eyebrow-pill"
              style={{ background: '#FFFFFF', marginBottom: '0.6rem' }}
            >
              <LineChartIcon size={14} />
              <span>
                Session Timeline ·{' '}
                {apiMode === 'mock' ? 'Standalone Demo Mode' : 'Live API Mode'}
              </span>
            </span>

            <h1 className="section-heading" style={{ marginBottom: '0.35rem' }}>
              Your Mood Journey
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-navy)',
                opacity: 0.88,
              }}
            >
              “Explore the moods you’ve recorded during your listening sessions.”
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            {sessionId && (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setRecheckOpen((o) => !o)}
                >
                  <SmilePlus size={16} />
                  <span>Log Mood Recheck</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => loadSessionJourney().catch(() => {})}
                  disabled={journeyLoading}
                >
                  <RefreshCw size={15} />
                  <span>{journeyLoading ? 'Syncing…' : 'Refresh Timeline'}</span>
                </button>
              </>
            )}
            <Link to="/recommendations" className="btn btn-secondary btn-sm">
              <Disc3 size={15} />
              <span>Back to Recommendations</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {recheckOpen && (
        <MoodRecheckPanel
          currentMood={latestEntry?.mood || currentMood || 'calm'}
          apiMode={apiMode}
          onSubmitRecheck={submitMoodRecheck}
          onClose={() => setRecheckOpen(false)}
        />
      )}

      {/* Session Summary Strip */}
      {sessionId && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
          aria-label="Session Journey Summary"
        >
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Active Session ID
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
              }}
            >
              #{sessionId}
            </div>
            {sessionCreatedAt && (
              <div
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
              >
                Started: {sessionCreatedAt}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Starting Mood
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
              }}
            >
              {firstMoodMeta ? firstMoodMeta.label : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              First confirmed check-in
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Latest Confirmed Mood
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
              }}
            >
              {latestMoodMeta ? latestMoodMeta.label : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {mode === 'change' && targetMoodMeta
                ? `Target goal: ${targetMoodMeta.label}`
                : 'Mode: Match My Mood'}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Total Recorded Entries
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
              }}
            >
              {journeyEntries.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              User-confirmed categorical logs
            </div>
          </div>
        </section>
      )}

      {journeyError && (
        <div
          role="alert"
          className="alert-banner error"
          style={{ marginBottom: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} color="#783652" />
            <span>{journeyError}</span>
          </div>
        </div>
      )}

      {/* Empty Session State vs Chart */}
      {!sessionId || journeyEntries.length === 0 ? (
        <div
          className="glass-card"
          data-testid="journey-empty-state"
          style={{ textAlign: 'center', padding: '3.25rem 1.5rem' }}
        >
          <Sparkles
            size={42}
            color="#1F3149"
            style={{ marginBottom: '0.85rem' }}
          />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.45rem' }}>
            No mood entries recorded yet
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              maxWidth: '54ch',
              margin: '0 auto 1.5rem',
            }}
          >
            Start a listening session by confirming your mood—each check-in you
            record will appear here in chronological order.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/discover')}
          >
            <span>Discover & Confirm My Mood</span>
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <MoodChart entries={journeyEntries} />
      )}
    </div>
  );
}

