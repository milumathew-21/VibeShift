import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { MOOD_CHART_ORDER, getMoodMeta } from '../config/constants';

function CustomMoodDot(props) {
  const { cx, cy, payload } = props;
  if (typeof cx !== 'number' || typeof cy !== 'number') return null;

  const meta = getMoodMeta(payload?.mood);
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill={meta.pillColor}
        stroke="#171717"
        strokeWidth={2.5}
      />
      <circle cx={cx} cy={cy} r={3.5} fill="#171717" />
    </g>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const meta = getMoodMeta(item.mood);

  return (
    <div
      style={{
        background: '#171717',
        color: '#F8F8E9',
        border: '1.5px solid #171717',
        borderRadius: '14px',
        padding: '0.85rem 1.05rem',
        boxShadow: '6px 6px 0px #DFF3A3',
      }}
    >
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#DFF3A3',
        }}
      >
        CHECK-IN #{item.stepNumber} • {item.source}
      </div>
      <div
        style={{
          fontSize: '1.08rem',
          fontWeight: 800,
          color: '#FFFFFF',
          marginTop: '0.2rem',
        }}
      >
        {meta.label} — {meta.soundscapeTitle}
      </div>
      <div
        style={{
          fontSize: '0.78rem',
          color: 'rgba(248, 248, 233, 0.72)',
          marginTop: '0.2rem',
        }}
      >
        Recorded at: {item.recorded_at}
      </div>
    </div>
  );
}

export default function MoodChart({ entries = [] }) {
  const chartData = useMemo(() => {
    return (entries || []).map((entry, idx) => {
      const normalizedMood = String(entry.mood || 'neutral').toLowerCase();
      const categoryIndex = MOOD_CHART_ORDER.indexOf(normalizedMood);
      const timeShort = entry.recorded_at
        ? String(entry.recorded_at).split(' ').pop()
        : `#${idx + 1}`;

      return {
        id: `${idx}-${normalizedMood}`,
        stepNumber: idx + 1,
        label: `#${idx + 1} (${timeShort})`,
        mood: normalizedMood,
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 1,
        source: entry.source || 'manual',
        recorded_at: entry.recorded_at || '',
      };
    });
  }, [entries]);

  if (!chartData.length) {
    return null;
  }

  return (
    <div
      className="impact-chart-card"
      data-testid="mood-chart-container"
    >
      <div className="impact-chart-head">
        <div>
          <span className="eyebrow" style={{ marginBottom: '0.35rem' }}>
            CATEGORICAL PROGRESSION
          </span>
          <h3 className="impact-chart-title">
            Session Emotional Trajectory
          </h3>
          <p className="impact-chart-sub">
            Displays your real chronological mood check-ins across categorical states (never fabricated numerical sentiment scores).
          </p>
        </div>
        <span className="badge badge-neutral">
          {chartData.length} Logged State{chartData.length === 1 ? '' : 's'}
        </span>
      </div>

      <div style={{ width: '100%', height: 290 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 18, right: 28, left: 20, bottom: 12 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(23, 23, 23, 0.12)"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: '#171717', fontSize: 12, fontWeight: 700 }}
              stroke="rgba(23, 23, 23, 0.25)"
            />
            <YAxis
              type="number"
              domain={[0, MOOD_CHART_ORDER.length - 1]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickFormatter={(val) => {
                const moodId = MOOD_CHART_ORDER[val];
                return moodId ? getMoodMeta(moodId).label : '';
              }}
              width={90}
              tick={{ fill: '#171717', fontSize: 12, fontWeight: 800 }}
              stroke="rgba(23, 23, 23, 0.25)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="categoryIndex"
              stroke="#171717"
              strokeWidth={3}
              dot={<CustomMoodDot />}
              activeDot={{ r: 10, fill: '#3577D4', stroke: '#171717', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
