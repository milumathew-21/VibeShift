import React from 'react';
import { Disc3, ExternalLink, Play, Volume2 } from 'lucide-react';
import { getMoodMeta, parseSpotifyTrackUrl } from '../config/constants';
import FeedbackControls from './FeedbackControls';
import MoodArtGraphic from './MoodArtGraphic';

export default function PlaylistCard({
  song,
  index = 0,
  isSelected = false,
  feedbackAction = null,
  onSelectSong,
  onFeedback,
}) {
  const primaryMood = song.mood_tags?.[0] || 'neutral';
  const moodMeta = getMoodMeta(primaryMood);
  const spotifyInfo = parseSpotifyTrackUrl(song.audio_url);
  const theme = moodMeta.artworkTheme || {
    bg: '#DFF3A3',
    fg: '#171717',
    secondary: '#3577D4',
    tertiary: '#FFFFFF',
    pattern: 'sunburst',
  };

  return (
    <article
      className={`track-card impact-track-card ${isSelected ? 'active-track' : ''}`}
      onClick={() => onSelectSong(song)}
      data-testid={`playlist-card-${song.id}`}
    >
      <div className="impact-track-main-row">
        {/* Track Number & Editorial Artwork Thumbnail */}
        <div className="impact-track-thumb-wrap">
          <div className="impact-track-thumb">
            <MoodArtGraphic
              pattern={theme.pattern}
              bg={theme.bg}
              fg={theme.fg}
              secondary={theme.secondary}
              tertiary={theme.tertiary}
            />
            <span className="impact-track-thumb-overlay">
              {isSelected ? (
                <Volume2 size={18} />
              ) : (
                <Play size={17} />
              )}
            </span>
          </div>
          <span className="impact-track-index-num">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Song Metadata */}
        <div className="impact-track-info">
          <div className="impact-track-title-row">
            <h3 className="impact-track-title">{song.title}</h3>
            {isSelected && (
              <span className="impact-now-playing-pill">
                <Disc3 size={12} className="spin-slow" />
                <span>Now Selected</span>
              </span>
            )}
          </div>

          <p className="impact-track-artist">{song.artist}</p>

          {/* Editorial Metadata Pills */}
          <div className="impact-track-tags">
            {song.language && (
              <span className="badge badge-neutral">{song.language}</span>
            )}
            {song.genre && (
              <span className="badge badge-accent">{song.genre}</span>
            )}
            {(song.mood_tags || []).map((mTag) => {
              const m = getMoodMeta(mTag);
              return (
                <span
                  key={mTag}
                  className="badge"
                  style={{
                    background: m.pillColor,
                    color: '#171717',
                    border: '1px solid #171717',
                  }}
                >
                  {m.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Select & Spotify Actions */}
        <div className="impact-track-actions">
          <button
            type="button"
            className={`btn btn-sm ${
              isSelected ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSong(song);
            }}
          >
            <Play size={14} />
            <span>{isSelected ? 'Loaded' : 'Play'}</span>
          </button>

          {spotifyInfo.openUrl && (
            <a
              href={spotifyInfo.openUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn btn-ghost btn-sm impact-spotify-mini-link"
              title="Open track in Spotify"
            >
              <span>Spotify</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Feedback Controls Bar */}
      <div className="impact-track-footer">
        <span className="impact-track-feedback-hint">
          {feedbackAction === 'like'
            ? '♥ Saved to your session favorites'
            : feedbackAction === 'replay'
            ? '↻ Marked for replay'
            : feedbackAction === 'skip'
            ? '⏭ Skipped in this session'
            : 'Rate how this song fits your moment:'}
        </span>

        <FeedbackControls
          songId={song.id}
          activeAction={feedbackAction}
          onFeedback={onFeedback}
        />
      </div>
    </article>
  );
}
