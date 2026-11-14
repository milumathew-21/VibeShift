import React from 'react';

/**
 * Bespoke Editorial Music & Mood Artwork SVG Generator
 * Inspired by Impact Flow's curated editorial visual blocks and modern vinyl/soundscape art direction.
 */
export default function MoodArtGraphic({
  pattern = 'sunburst',
  bg = '#DFF3A3',
  fg = '#171717',
  secondary = '#3577D4',
  tertiary = '#FFFFFF',
  className = '',
  style = {},
}) {
  return (
    <svg
      viewBox="0 0 280 200"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mood-art-svg ${className}`}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
      aria-hidden="true"
    >
      <rect width="280" height="200" fill={bg} />

      {pattern === 'sunburst' && (
        <>
          <circle cx="215" cy="52" r="95" fill={tertiary} fillOpacity="0.55" />
          <circle cx="140" cy="110" r="64" fill={secondary} />
          <circle cx="140" cy="110" r="42" fill={bg} />
          <circle cx="140" cy="110" r="18" fill={fg} />
          <path
            d="M28 164C66 132 108 132 146 164C184 196 224 196 262 164"
            stroke={fg}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="52" cy="48" r="10" fill={fg} />
          <path d="M225 32L245 52M245 32L225 52" stroke={fg} strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {pattern === 'waves' && (
        <>
          <circle cx="218" cy="58" r="46" fill={secondary} />
          <path
            d="M-20 118C35 82 92 152 148 116C204 80 245 142 300 108V210H-20V118Z"
            fill={tertiary}
            fillOpacity="0.2"
          />
          <path
            d="M-10 138C45 104 98 168 154 134C210 100 248 158 296 128"
            stroke={fg}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M-10 164C45 130 98 194 154 160C210 126 248 184 296 154"
            stroke={secondary}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="64" cy="64" r="22" stroke={fg} strokeWidth="2.5" />
          <circle cx="64" cy="64" r="6" fill={secondary} />
        </>
      )}

      {pattern === 'prism' && (
        <>
          <polygon points="140,22 232,168 48,168" fill={secondary} />
          <polygon points="158,44 244,168 92,168" fill={fg} fillOpacity="0.88" />
          <circle cx="84" cy="58" r="24" fill={tertiary} />
          <line x1="24" y1="142" x2="256" y2="62" stroke={tertiary} strokeWidth="3" />
          <circle cx="140" cy="124" r="14" fill="#171717" />
        </>
      )}

      {pattern === 'ripples' && (
        <>
          <circle cx="140" cy="100" r="82" stroke={fg} strokeOpacity="0.2" strokeWidth="2" />
          <circle cx="140" cy="100" r="58" stroke={fg} strokeOpacity="0.4" strokeWidth="2.5" />
          <circle cx="140" cy="100" r="36" fill={secondary} />
          <circle cx="140" cy="100" r="14" fill={tertiary} />
          <path
            d="M36 42C56 42 56 62 76 62C96 62 96 42 116 42"
            stroke={fg}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      )}

      {pattern === 'eclipse' && (
        <>
          <circle cx="152" cy="100" r="64" fill={secondary} />
          <circle cx="126" cy="94" r="54" fill={fg} />
          <circle cx="114" cy="88" r="38" fill={bg} />
          <path
            d="M34 166L96 124L138 152L244 48"
            stroke={tertiary}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {pattern === 'vinyl' && (
        <>
          <circle cx="140" cy="100" r="74" fill="#171717" />
          <circle cx="140" cy="100" r="56" stroke="#F8F8E9" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="140" cy="100" r="40" stroke="#F8F8E9" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="140" cy="100" r="24" fill={secondary} />
          <circle cx="140" cy="100" r="7" fill="#F8F8E9" />
          <rect x="24" y="24" width="44" height="18" rx="9" fill="#DFF3A3" />
        </>
      )}

      {pattern === 'arch' && (
        <>
          <path d="M76 184V92C76 56.6538 104.654 28 140 28C175.346 28 204 56.6538 204 92V184H76Z" fill={secondary} />
          <path d="M100 184V98C100 75.9086 117.909 58 140 58C162.091 58 180 75.9086 180 98V184H100Z" fill={bg} />
          <circle cx="140" cy="104" r="20" fill={fg} />
        </>
      )}

      {pattern === 'strings' && (
        <>
          {[38, 66, 94, 122, 150, 178].map((y, idx) => (
            <line
              key={y}
              x1="24"
              y1={y}
              x2="256"
              y2={y}
              stroke={fg}
              strokeOpacity={0.25 + idx * 0.1}
              strokeWidth={idx % 2 === 0 ? '2.5' : '1.5'}
            />
          ))}
          <circle cx="176" cy="100" r="44" fill={tertiary} />
          <circle cx="112" cy="100" r="32" fill={secondary} />
          <circle cx="140" cy="100" r="12" fill={fg} />
        </>
      )}

      {pattern === 'circles' && (
        <>
          <circle cx="92" cy="100" r="56" fill={tertiary} />
          <circle cx="164" cy="100" r="56" fill={secondary} fillOpacity="0.88" />
          <circle cx="128" cy="100" r="26" fill={fg} />
          <circle cx="222" cy="48" r="14" fill="#DFF3A3" stroke={fg} strokeWidth="2" />
        </>
      )}

      {pattern === 'grid' && (
        <>
          <g stroke={fg} strokeOpacity="0.14" strokeWidth="1.5">
            <line x1="0" y1="50" x2="280" y2="50" />
            <line x1="0" y1="100" x2="280" y2="100" />
            <line x1="0" y1="150" x2="280" y2="150" />
            <line x1="70" y1="0" x2="70" y2="200" />
            <line x1="140" y1="0" x2="140" y2="200" />
            <line x1="210" y1="0" x2="210" y2="200" />
          </g>
          <rect x="64" y="44" width="152" height="112" rx="22" fill={secondary} stroke={fg} strokeWidth="2.5" />
          <circle cx="114" cy="100" r="26" fill={fg} />
          <circle cx="168" cy="100" r="26" fill={tertiary} />
        </>
      )}
    </svg>
  );
}

