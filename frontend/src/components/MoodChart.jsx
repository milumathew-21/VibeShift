import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Clock, ShieldAlert } from 'lucide-react';
import {
  MOODS,
  getMoodMeta,
  MOOD_SOURCE_LABELS,
  ETHICAL_DISCLAIMERS,
} from '../config/constants';

/**
 * Categorical positions used ONLY to place categorical mood labels on distinct horizontal
 * lanes of the timeline chart — NEVER presented as numerical emotion scores.
 */
const CATEGORICAL_LANE_INDEX = {
  happy: 6,
  energetic: 5,
  calm: 4,
  neutral: 3,
  sad: 2,
  angry: 1,
};

const LANE_TO_LABEL = {
  6: 'Happy',
  5: 'Energetic',
  4: 'Calm',
  3: 'Neutral',
  2: 'Sad',
  1: 'Angry',
};

function CustomCategoricalTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const moodMeta = getMoodMeta(data.mood);
  const sourceMeta =
    MOOD_SOURCE_LABELS[data.source] || MOOD_SOURCE_LABELS.manual;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        border: '1.5px solid #1F3149',
        borderRadius: '14px',
        padding: '0.85rem 1rem',
        boxShadow: '0 12px 28px rgba(31, 49, 73, 0.14)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#1F3149',
        }}
      >
        {data.stepLabel}: {moodMeta?.label || data.mood}
      </div>
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: moodMeta?.accentColor || '#175E57',
          marginTop: '0.15rem',
        }}
      >
        Source: {sourceMeta.label}
      </div>
      <div
        style={{
          fontSize: '0.76rem',
          color: 'var(--text-secondary)',
          marginTop: '0.2rem',
        }}
      >
        Recorded at: {data.recorded_at}
      </div>
    </div>
  );
}

export default function MoodChart({ entries = [] }) {
  if (!entries || entries.length === 0) {
    return null;
  }

  const chartData = entries.map((entry, idx) => {
    const cleanMood = String(entry.mood || 'neutral').toLowerCase();
    const timePart = entry.recorded_at
      ? entry.recorded_at.split(' ')[1] || entry.recorded_at
      : `Entry ${idx + 1}`;
    return {
      index: idx + 1,
      stepLabel: `Check-in #${idx + 1}`,
      timeLabel: `#${idx + 1} (${timePart})`,
      mood: cleanMood,
      moodLabel: getMoodMeta(cleanMood)?.label || cleanMood,
      categoricalLane: CATEGORICAL_LANE_INDEX[cleanMood] || 3,
      source: entry.source || 'manual',
      recorded_at: entry.recorded_at || 'During session',
    };
  });

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      data-testid="mood-chart-container"
    >
      {/* Categorical Recharts Visualization */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.35rem' }}>
              Categorical Mood Progression Timeline
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Each point marks a categorical mood confirmed by you in
              chronological order.
            </p>
          </div>
          <span className="eyebrow-pill">
            <span>{entries.length} Confirmed Check-in(s)</span>
          </span>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={280}
            minHeight={260}
          >
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(31, 49, 73, 0.1)"
              />
              <XAxis
                dataKey="timeLabel"
                stroke="#65748B"
                tick={{ fontSize: 12, fill: '#1F3149' }}
              />
              <YAxis
                type="number"
                domain={[1, 6]}
                ticks={[1, 2, 3, 4, 5, 6]}
                tickFormatter={(val) => LANE_TO_LABEL[val] || ''}
                stroke="#65748B"
                tick={{ fontSize: 12, fill: '#1F3149', fontWeight: 600 }}
                width={90}
              />
              <Tooltip content={<CustomCategoricalTooltip />} />
              <Line
                type="stepAfter"
                dataKey="categoricalLane"
                stroke="#1F3149"
                strokeWidth={3}
                dot={{
                  r: 7,
                  fill: '#CDF7F3',
                  stroke: '#1F3149',
                  strokeWidth: 2.5,
                }}
                activeDot={{
                  r: 9,
                  fill: '#F4CBD9',
                  stroke: '#1F3149',
                  strokeWidth: 2.5,
                }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scientific Accuracy Note */}
        <div
          className="alert-banner info"
          style={{ marginTop: '1.25rem', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldAlert size={18} color="#175E57" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.83rem', color: 'var(--text-navy)' }}>
              {ETHICAL_DISCLAIMERS.journeyNote}
            </span>
          </div>
        </div>
      </div>

      {/* Chronological Timeline List */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1.1rem' }}>
          Chronological Session Log
        </h3>

        <ol
          style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {entries.map((entry, idx) => {
            const meta = getMoodMeta(entry.mood) || MOODS[0];
            const sourceMeta =
              MOOD_SOURCE_LABELS[entry.source] || MOOD_SOURCE_LABELS.manual;

            return (
              <li
                key={`${entry.recorded_at}-${idx}`}
                data-testid={`journey-entry-${idx}`}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1.05rem 1.25rem',
                  borderRadius: '18px',
                  background: meta.gradient,
                  border: '1px solid rgba(31, 49, 73, 0.12)',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}
                >
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#1F3149',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#1F3149',
                      }}
                    >
                      {meta.label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-navy)',
                        opacity: 0.85,
                      }}
                    >
                      {sourceMeta.label} — {sourceMeta.description}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.88)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#1F3149',
                  }}
                >
                  <Clock size={13} />
                  <span>{entry.recorded_at}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
