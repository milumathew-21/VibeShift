import React from 'react';
import { Play, Disc3, ExternalLink } from 'lucide-react';
import { getMoodMeta, parseSpotifyTrackUrl } from '../config/constants';
import FeedbackControls from './FeedbackControls';

export default function PlaylistCard({
  song,
  index,
  isActive = false,
  feedbackState = {},
  onSelectTrack,
  onFeedback,
}) {
  const primaryMoodTag = song.mood_tags?.[0] || 'calm';
  const moodMeta = getMoodMeta(primaryMoodTag);
  const spotifyInfo = parseSpotifyTrackUrl(song.audio_url);

  return (
    <article
      className={`playlist-card ${isActive ? 'active-track' : ''}`}
      data-testid={`playlist-card-${song.id}`}
      aria-label={`${song.title} by ${song.artist}`}
    >
      {/* Bespoke CSS Vinyl / Aura Artwork Fallback */}
      <button
        type="button"
        onClick={() => onSelectTrack(song.id)}
        className="artwork-disc"
        style={{
          background:
            moodMeta?.gradient ||
            'linear-gradient(135deg, #CDF7F3 0%, #BFD6F5 100%)',
          cursor: 'pointer',
        }}
        aria-label={`Select ${song.title} in player`}
        title={`Load ${song.title} into Now Playing panel`}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(31, 49, 73, 0.14)',
          }}
        >
          {isActive ? (
            <Disc3 size={16} color="#1F3149" />
          ) : (
            <Play size={14} color="#1F3149" style={{ marginLeft: '2px' }} />
          )}
        </div>
        <span
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '6px',
            fontSize: '0.64rem',
            fontFamily: 'var(--font-tech)',
            fontWeight: 700,
            color: '#1F3149',
            opacity: 0.75,
          }}
        >
          #{index + 1}
        </span>
      </button>

      {/* Track Metadata */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => onSelectTrack(song.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '1.12rem',
              fontWeight: 600,
              color: '#1F3149',
            }}
          >
            {song.title}
          </button>

          {isActive && (
            <span
              className="eyebrow-pill"
              style={{
                padding: '0.14rem 0.55rem',
                fontSize: '0.68rem',
                background: '#1F3149',
                color: '#FFFFFF',
              }}
            >
              Now Selected
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.45rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {song.artist}
        </div>

        {/* Language, Genre & Mood Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.38rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.16rem 0.58rem',
              borderRadius: '999px',
              background: 'rgba(205, 247, 243, 0.65)',
              color: '#175E57',
            }}
          >
            {song.language}
          </span>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.16rem 0.58rem',
              borderRadius: '999px',
              background: 'rgba(191, 214, 245, 0.55)',
              color: '#2A4668',
            }}
          >
            {song.genre}
          </span>

          {song.mood_tags?.map((tag) => {
            const tagMeta = getMoodMeta(tag);
            return (
              <span
                key={tag}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.16rem 0.58rem',
                  borderRadius: '999px',
                  background: tagMeta?.badgeBg || '#F4CBD9',
                  color: tagMeta?.accentColor || '#1F3149',
                }}
              >
                #{tagMeta?.label || tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* Playback & Feedback Actions */}
      <div
        className="playlist-card-actions"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.55rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            type="button"
            onClick={() => onSelectTrack(song.id)}
            className={`btn btn-sm ${
              isActive ? 'btn-primary' : 'btn-secondary'
            }`}
            style={{ padding: '0.42rem 0.85rem', fontSize: '0.78rem' }}
          >
            <Play size={13} />
            <span>{isActive ? 'Focused' : 'Load Player'}</span>
          </button>

          {spotifyInfo.isValid && (
            <a
              href={spotifyInfo.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.42rem 0.75rem', fontSize: '0.78rem' }}
              title="Open track directly in Spotify"
            >
              <ExternalLink size={13} />
              <span>Spotify</span>
            </a>
          )}
        </div>

        <FeedbackControls
          songId={song.id}
          feedbackState={feedbackState}
          onFeedback={onFeedback}
          compact
        />
      </div>
    </article>
  );
}

