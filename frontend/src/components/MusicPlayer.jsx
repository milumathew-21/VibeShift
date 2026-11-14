import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  Disc3,
  ExternalLink,
  Headphones,
  Music2,
  Radio,
} from 'lucide-react';
import { parseSpotifyTrackUrl, getMoodMeta } from '../config/constants';
import { getDemoAmbientWavUrl } from '../mocks/ambientAudioGenerator';
import MoodArtGraphic from './MoodArtGraphic';

export default function MusicPlayer({
  song,
  apiMode = 'mock',
  onNextSong,
  onPrevSong,
}) {
  const [playerTab, setPlayerTab] = useState('spotify');

  useEffect(() => {
    setPlayerTab('spotify');
  }, [song?.id]);

  const spotifyInfo = useMemo(
    () => parseSpotifyTrackUrl(song?.audio_url),
    [song?.audio_url]
  );

  const primaryMood = song?.mood_tags?.[0] || 'neutral';
  const moodMeta = getMoodMeta(primaryMood);
  const theme = moodMeta.artworkTheme || {
    bg: '#DFF3A3',
    fg: '#171717',
    secondary: '#3577D4',
    tertiary: '#FFFFFF',
    pattern: 'sunburst',
  };

  const demoSynthUrl = useMemo(() => {
    if (!song || apiMode !== 'mock') return null;
    return getDemoAmbientWavUrl(primaryMood);
  }, [song, apiMode, primaryMood]);

  if (!song) {
    return (
      <aside className="impact-player-card impact-player-card--empty">
        <Headphones size={34} style={{ margin: '0 auto 0.75rem' }} />
        <h3 className="impact-player-empty-title">No Track Selected</h3>
        <p className="impact-player-empty-sub">
          Choose any recommended track from your soundtrack to open the playback studio.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="impact-player-card"
      aria-label={`Music Player: ${song.title}`}
      data-testid="music-player"
    >
      {/* Top Studio Header */}
      <div className="impact-player-top">
        <span className="impact-player-studio-badge">
          <Disc3 size={13} className="spin-slow" />
          <span>NOW PLAYING STUDIO</span>
        </span>
        <span
          className="impact-player-mood-tag"
          style={{ background: moodMeta.pillColor, color: '#171717' }}
        >
          {moodMeta.label} Vibe
        </span>
      </div>

      {/* Editorial Album Artwork Showcase */}
      <div className="impact-player-artwork-stage">
        <div className="impact-player-artwork-frame">
          <MoodArtGraphic
            pattern={theme.pattern}
            bg={theme.bg}
            fg={theme.fg}
            secondary={theme.secondary}
            tertiary={theme.tertiary}
          />
          <div className="impact-player-vinyl-disc" aria-hidden="true">
            <span className="impact-player-vinyl-core" />
          </div>
        </div>

        <div className="impact-player-song-meta">
          <h3 className="impact-player-title">{song.title}</h3>
          <p className="impact-player-artist">{song.artist}</p>
          <div className="impact-player-badges">
            {song.language && (
              <span className="badge badge-neutral">{song.language}</span>
            )}
            {song.genre && (
              <span className="badge badge-accent">{song.genre}</span>
            )}
          </div>
        </div>
      </div>

      {/* Mode Switcher if in Demo Mode */}
      {apiMode === 'mock' && (
        <div
          role="tablist"
          aria-label="Audio Source Mode"
          className="impact-player-tabs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={playerTab === 'spotify'}
            onClick={() => setPlayerTab('spotify')}
            className={`impact-player-tab ${
              playerTab === 'spotify' ? 'active' : ''
            }`}
          >
            <Music2 size={13} />
            <span>Spotify Embed</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={playerTab === 'synth'}
            onClick={() => setPlayerTab('synth')}
            className={`impact-player-tab ${
              playerTab === 'synth' ? 'active' : ''
            }`}
          >
            <Radio size={13} />
            <span>Demo Ambient Synth</span>
          </button>
        </div>
      )}

      {/* Primary Spotify Embed or Invalid Link Fallback */}
      {playerTab === 'spotify' && (
        <div className="impact-player-embed-area">
          {spotifyInfo.isValid ? (
            <div
              className="spotify-embed-wrapper"
              data-testid="spotify-embed-container"
            >
              <iframe
                key={spotifyInfo.trackId}
                title={`Spotify Embed: ${song.title} by ${song.artist}`}
                src={spotifyInfo.embedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ display: 'block', borderRadius: '14px' }}
                data-testid="spotify-embed-iframe"
              />
            </div>
          ) : (
            <div
              className="impact-player-fallback"
              data-testid="spotify-invalid-fallback"
            >
              <div className="impact-player-fallback-head">
                <AlertCircle size={17} />
                <span>Embedded preview unavailable for this link</span>
              </div>
              <p className="impact-player-fallback-sub">
                This song uses a external or non-embeddable track reference. Use the external link below or switch to the Demo Ambient Synth tab.
              </p>
            </div>
          )}

          {/* Direct Open in Spotify Action */}
          {spotifyInfo.openUrl && (
            <div style={{ marginTop: '0.85rem' }}>
              <a
                href={spotifyInfo.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                data-testid="open-in-spotify-link"
              >
                <span>Open in Spotify</span>
                <ExternalLink size={15} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Demo Mode HTML5 Audio Synthesizer Fallback */}
      {apiMode === 'mock' && playerTab === 'synth' && demoSynthUrl && (
        <div
          className="impact-player-synth-panel"
          data-testid="demo-html5-audio-panel"
        >
          <div className="impact-player-synth-head">
            <Radio size={15} />
            <span>
              Demo Ambient Harmonic Preview ({moodMeta.label} Chord Progression)
            </span>
          </div>
          <p className="impact-player-synth-desc">
            Synthesized locally in your browser so you can test HTML5 audio controls offline in Demo Mode.
          </p>
          <audio
            key={`${song.id}-${primaryMood}`}
            controls
            src={demoSynthUrl}
            style={{ width: '100%', height: '38px' }}
          >
            Your browser does not support the HTML5 audio element.
          </audio>
        </div>
      )}

      {/* Previous / Next Track Navigation */}
      <div className="impact-player-nav-row">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onPrevSong}
          style={{ flex: 1 }}
        >
          ← Previous Track
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onNextSong}
          style={{ flex: 1 }}
        >
          Next Track →
        </button>
      </div>
    </aside>
  );
}
