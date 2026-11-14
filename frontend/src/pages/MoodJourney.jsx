import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Compass,
  Disc3,
  LineChart,
  Music2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useVibeShift } from '../context/VibeShiftContext';
import { getMoodMeta } from '../config/constants';
import MoodChart from '../components/MoodChart';
import MoodArtGraphic from '../components/MoodArtGraphic';

export default function MoodJourney() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    sessionId,
    sessionCreatedAt,
    journeyEntries,
    isLoadingJourney,
    journeyError,
    refreshJourney,
    startOrUpdateListeningFlow,
    mode,
    targetMood,
    recommendations,
    feedbackMap,
  } = useVibeShift();

  const queryMood = searchParams.get('mood');

  useEffect(() => {
    if (queryMood && !sessionId && journeyEntries.length === 0) {
      startOrUpdateListeningFlow({ currentMood: queryMood }).catch(() => {});
    } else if (sessionId) {
      refreshJourney(sessionId).catch(() => {});
    }
  }, [queryMood, sessionId, journeyEntries.length, startOrUpdateListeningFlow, refreshJourney]);

  const initialEntry = journeyEntries?.[0] || null;
  const latestEntry =
    journeyEntries?.length > 0
      ? journeyEntries[journeyEntries.length - 1]
      : null;

  const initialMeta = initialEntry ? getMoodMeta(initialEntry.mood) : null;
  const latestMeta = latestEntry ? getMoodMeta(latestEntry.mood) : null;
  const targetMeta = targetMood ? getMoodMeta(targetMood) : null;

  const likedCount = Object.values(feedbackMap || {}).filter(
    (act) => act === 'like'
  ).length;
  const replayedCount = Object.values(feedbackMap || {}).filter(
    (act) => act === 'replay'
  ).length;

  return (
    <div
      className="section impact-journey-page"
      data-testid="mood-journey-page"
    >
      <div className="container">
        {/* =================================================================
            EDITORIAL HEADER
            ================================================================= */}
        <div className="impact-journey-header">
          <div>
            <div className="impact-eyebrow-row" style={{ marginBottom: '0.65rem' }}>
              <span className="eyebrow">
                <LineChart size={14} />
                PERSONAL MUSIC & MOOD JOURNAL
              </span>
              {sessionId && (
                <span className="badge badge-neutral">
                  Session #{sessionId}
                </span>
              )}
            </div>

            <h1 className="impact-page-title">Your Mood Journey</h1>
            <p className="impact-page-lead">
              A chronological journal of how your emotional atmosphere evolved across your listening session.
            </p>
          </div>

          <div className="impact-journey-actions">
            {sessionId && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isLoadingJourney}
                onClick={() => refreshJourney(sessionId)}
              >
                <RefreshCw size={15} />
                <span>{isLoadingJourney ? 'Syncing...' : 'Sync Journal'}</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  recommendations.length > 0 ? '/recommendations' : '/discover'
                )
              }
            >
              <Music2 size={16} />
              <span>
                {recommendations.length > 0
                  ? 'Return to Soundtrack'
                  : 'Start Mood Check-In'}
              </span>
            </button>
          </div>
        </div>

        {/* =================================================================
            ERROR ALERT
            ================================================================= */}
        {journeyError && (
          <div
            role="alert"
            className="impact-alert impact-alert--error"
            style={{ marginBottom: '1.5rem' }}
          >
            <AlertCircle size={18} />
            <span>{journeyError}</span>
          </div>
        )}

        {/* =================================================================
            HONEST EMPTY STATE WHEN NO SESSION / ENTRIES EXIST
            ================================================================= */}
        {!isLoadingJourney && journeyEntries.length === 0 && (
          <div
            className="impact-empty-state-card"
            data-testid="journey-empty-state"
          >
            <Disc3 size={42} style={{ margin: '0 auto 0.85rem' }} />
            <h2 className="impact-empty-title">No mood entries recorded yet</h2>
            <p className="impact-empty-desc">
              Your Mood Journey only displays real session check-ins from{' '}
              <code>GET /api/sessions/&#123;session_id&#125;/journey</code>. Start a listening session and log your first mood to see your timeline come to life.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/discover')}
            >
              <Compass size={18} />
              <span>Begin First Session</span>
            </button>
          </div>
        )}

        {/* =================================================================
            ACTIVE JOURNEY SUMMARY, CATEGORICAL CHART & JOURNAL TIMELINE
            ================================================================= */}
        {journeyEntries.length > 0 && (
          <div className="impact-journey-stack">
            {/* Session Journal Summary Cards */}
            <div className="grid-4">
              <div className="impact-journal-stat-card">
                <span className="impact-journal-stat-label">STARTING MOOD</span>
                <div className="impact-journal-stat-value">
                  <span
                    className="impact-dock-dot"
                    style={{ background: initialMeta?.orbColor }}
                  />
                  <span>{initialMeta?.label}</span>
                </div>
                <div className="impact-journal-stat-sub">
                  Source: {initialEntry?.source}
                </div>
              </div>

              <div className="impact-journal-stat-card impact-journal-stat-card--lime">
                <span className="impact-journal-stat-label">LATEST MOOD</span>
                <div className="impact-journal-stat-value">
                  <span
                    className="impact-dock-dot"
                    style={{ background: latestMeta?.orbColor }}
                  />
                  <span>{latestMeta?.label}</span>
                </div>
                <div className="impact-journal-stat-sub">
                  {journeyEntries.length > 1
                    ? `Updated after ${journeyEntries.length - 1} recheck(s)`
                    : 'Initial check-in active'}
                </div>
              </div>

              <div className="impact-journal-stat-card">
                <span className="impact-journal-stat-label">SESSION INTENT</span>
                <div className="impact-journal-stat-value">
                  <span>
                    {mode === 'change'
                      ? `Shift → ${targetMeta ? targetMeta.label : 'Target'}`
                      : 'Match My Mood'}
                  </span>
                </div>
                <div className="impact-journal-stat-sub">
                  {sessionCreatedAt
                    ? `Created ${sessionCreatedAt}`
                    : `Session #${sessionId}`}
                </div>
              </div>

              <div className="impact-journal-stat-card">
                <span className="impact-journal-stat-label">SONG AFFINITY</span>
                <div className="impact-journal-stat-value">
                  <span>
                    {likedCount} Liked • {replayedCount} Replay
                  </span>
                </div>
                <div className="impact-journal-stat-sub">
                  {recommendations.length} Tracks in Playlist
                </div>
              </div>
            </div>

            {/* Recharts Categorical Mood Progression Chart */}
            <MoodChart entries={journeyEntries} />

            {/* Chronological Editorial Journal Entries */}
            <section
              className="impact-journal-timeline-card"
              aria-labelledby="chronological-log-heading"
            >
              <div className="impact-journal-timeline-head">
                <div>
                  <span className="eyebrow" style={{ marginBottom: '0.35rem' }}>
                    <Sparkles size={13} />
                    CHRONOLOGICAL LOG
                  </span>
                  <h2 id="chronological-log-heading" className="impact-chart-title">
                    Recorded Mood Check-Ins
                  </h2>
                </div>
                <span className="badge badge-neutral">
                  {journeyEntries.length} Entry
                  {journeyEntries.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="impact-journal-entries-list">
                {journeyEntries.map((entry, idx) => {
                  const meta = getMoodMeta(entry.mood);
                  const isFirst = idx === 0;
                  const isLatest = idx === journeyEntries.length - 1;
                  const theme = meta.artworkTheme || {
                    bg: '#DFF3A3',
                    fg: '#171717',
                    secondary: '#3577D4',
                    tertiary: '#FFFFFF',
                    pattern: 'sunburst',
                  };

                  return (
                    <article
                      key={`${entry.recorded_at}-${idx}`}
                      className={`impact-journal-entry ${
                        isLatest ? 'latest' : ''
                      }`}
                      data-testid={`journey-entry-${idx}`}
                    >
                      <div className="impact-journal-entry-left">
                        <div className="impact-journal-entry-art">
                          <MoodArtGraphic
                            pattern={theme.pattern}
                            bg={theme.bg}
                            fg={theme.fg}
                            secondary={theme.secondary}
                            tertiary={theme.tertiary}
                          />
                        </div>

                        <div>
                          <div className="impact-journal-entry-title-row">
                            <span className="impact-journal-step-num">
                              ENTRY #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <strong className="impact-journal-mood-name">
                              {meta.label}
                            </strong>
                            {isFirst && (
                              <span className="badge badge-neutral">
                                Session Start
                              </span>
                            )}
                            {isLatest && journeyEntries.length > 1 && (
                              <span className="badge badge-accent">
                                Latest Check-In
                              </span>
                            )}
                            <span
                              className="badge"
                              style={{
                                background: meta.pillColor,
                                color: '#171717',
                                border: '1px solid #171717',
                                textTransform: 'capitalize',
                              }}
                            >
                              Source: {entry.source}
                            </span>
                          </div>
                          <p className="impact-journal-entry-tagline">
                            {meta.soundscapeTitle} — {meta.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="impact-journal-entry-time">
                        <Clock size={14} />
                        <span>{entry.recorded_at}</span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="impact-journal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/recommendations')}
                >
                  <span>Log Another Mood Recheck on Soundtrack Page</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
