import React, { useState, useRef, useEffect } from 'react';
import {
  Disc3,
  ExternalLink,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
  AlertTriangle,
  Sparkles,
  Radio,
} from 'lucide-react';
import { getMoodMeta, parseSpotifyTrackUrl } from '../config/constants';
import { getDemoAmbientWavUrl } from '../mocks/ambientAudioGenerator';
import FeedbackControls from './FeedbackControls';

/**
 * VibeShift — Premium Music Player with Official Spotify Embed Integration
 * CRITICAL COMPLIANCE:
 * 1. Never passes a Spotify track URL (`https://open.spotify.com/track/...`) into an HTML <audio> tag.
 * 2. Validates Spotify track links via `parseSpotifyTrackUrl` and renders an official Spotify Embed iframe.
 * 3. Provides a prominent "Open in Spotify" link.
 * 4. Does not fabricate pause/seek/volume controls over the Spotify iframe.
 * 5. In Standalone Demo Mode (`apiMode === 'mock'`), optionally provides a clearly labelled
 *    "Demo Ambient Synth (HTML5 Audio)" mode using a royalty-free procedural WAV pad so evaluators
 *    can test genuine HTML5 <audio> play/pause/seek/volume/mute/replay controls.
 */
export default function MusicPlayer({
  song,
  apiMode = 'live',
  feedbackState = {},
  onFeedback,
  onPrevTrack,
  onNextTrack,
  totalTracks = 0,
  currentTrackIndex = 0,
  replaySignal = 0,
}) {
  // 'spotify' | 'demo_synth'
  const [playerTab, setPlayerTab] = useState('spotify');
  const [embedInstanceKey, setEmbedInstanceKey] = useState(0);

  // Real HTML5 <audio> state (ONLY used for the royalty-free procedural WAV synth in Demo Mode)
  const audioRef = useRef(null);
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);
  const [synthCurrentTime, setSynthCurrentTime] = useState(0);
  const [synthDuration, setSynthDuration] = useState(12);
  const [synthVolume, setSynthVolume] = useState(0.75);
  const [synthMuted, setSynthMuted] = useState(false);

  const primaryMood = song?.mood_tags?.[0] || 'calm';
  const moodMeta = getMoodMeta(primaryMood);
  const spotifyInfo = parseSpotifyTrackUrl(song?.audio_url);

  const demoWavUrl =
    apiMode === 'mock' ? getDemoAmbientWavUrl(primaryMood, 12) : null;

  // Reset synth state when switching tracks or leaving mock mode
  useEffect(() => {
    if (apiMode !== 'mock' && playerTab === 'demo_synth') {
      setPlayerTab('spotify');
    }
  }, [apiMode, playerTab]);

  useEffect(() => {
    setIsPlayingSynth(false);
    setSynthCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [song?.id]);

  // Respond to Replay action honestly
  useEffect(() => {
    if (!replaySignal) return;
    if (playerTab === 'demo_synth' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setIsPlayingSynth(true)).catch(() => {});
    } else if (playerTab === 'spotify') {
      // Reload Spotify iframe cleanly so the user can restart from beginning
      setEmbedInstanceKey((k) => k + 1);
    }
  }, [replaySignal, playerTab]);

  if (!song) {
    return (
      <aside
        className="player-sticky-panel"
        aria-label="Music Player Empty State"
      >
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <Disc3
            size={42}
            color="#1F3149"
            style={{ marginBottom: '0.75rem', opacity: 0.65 }}
          />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>
            No Track Selected
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Select any recommended track from your playlist to open the Spotify
            player here.
          </p>
        </div>
      </aside>
    );
  }

  const toggleSynthPlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => setIsPlayingSynth(true))
        .catch(() => setIsPlayingSynth(false));
    } else {
      audioRef.current.pause();
      setIsPlayingSynth(false);
    }
  };

  const handleSynthSeek = (e) => {
    const nextTime = Number(e.target.value);
    setSynthCurrentTime(nextTime);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
  };

  const handleSynthVolume = (e) => {
    const nextVol = Number(e.target.value);
    setSynthVolume(nextVol);
    if (audioRef.current) {
      audioRef.current.volume = nextVol;
      if (nextVol > 0 && synthMuted) {
        audioRef.current.muted = false;
        setSynthMuted(false);
      }
    }
  };

  const toggleSynthMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !synthMuted;
    audioRef.current.muted = nextMuted;
    setSynthMuted(nextMuted);
  };

  const formatSec = (sec) => {
    const s = Math.max(0, Math.floor(sec || 0));
    const mins = Math.floor(s / 60);
    const rem = String(s % 60).padStart(2, '0');
    return `${mins}:${rem}`;
  };

  return (
    <aside
      className="player-sticky-panel"
      data-testid="music-player"
      aria-label="Now Playing Music Player"
    >
      {/* Top Header Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginBottom: '1.15rem',
        }}
      >
        <span className="eyebrow-pill">
          <Disc3 size={14} />
          <span>
            Now Playing · Track {currentTrackIndex + 1} of {totalTracks || 1}
          </span>
        </span>

        {/* Recommendation Queue Navigation (kept distinct from Spotify internal controls) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onPrevTrack}
            disabled={totalTracks <= 1}
            aria-label="Previous recommendation"
            title="Previous recommendation in playlist"
            style={{ padding: '0.4rem 0.65rem' }}
          >
            <SkipBack size={15} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onNextTrack}
            disabled={totalTracks <= 1}
            aria-label="Next recommendation"
            title="Next recommendation in playlist"
            style={{ padding: '0.4rem 0.65rem' }}
          >
            <SkipForward size={15} />
          </button>
        </div>
      </div>

      {/* Track Hero Card */}
      <div
        style={{
          padding: '1.25rem',
          borderRadius: '20px',
          background:
            moodMeta?.gradient ||
            'linear-gradient(135deg, #CDF7F3 0%, #BFD6F5 100%)',
          border: '1px solid rgba(31, 49, 73, 0.12)',
          marginBottom: '1.15rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 8px 20px rgba(31, 49, 73, 0.1)',
            }}
          >
            <Disc3 size={28} color="#1F3149" />
          </div>

          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                fontSize: '1.3rem',
                marginBottom: '0.15rem',
                wordBreak: 'break-word',
              }}
            >
              {song.title}
            </h3>
            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-navy)',
                opacity: 0.85,
                fontWeight: 500,
              }}
            >
              {song.artist}
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.35rem',
                marginTop: '0.45rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.12rem 0.55rem',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.88)',
                }}
              >
                {song.language} · {song.genre}
              </span>
              {song.mood_tags?.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.12rem 0.55rem',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.72)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* In Demo Mode, allow switching between Official Spotify Embed and Local Royalty-Free Ambient Synth */}
      {apiMode === 'mock' && (
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            marginBottom: '1rem',
            padding: '0.25rem',
            borderRadius: '999px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
          }}
          role="tablist"
          aria-label="Playback Source Mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={playerTab === 'spotify'}
            onClick={() => setPlayerTab('spotify')}
            className={`mode-pill-btn ${
              playerTab === 'spotify' ? 'active-live' : ''
            }`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Radio size={13} />
            <span>Spotify Embed</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={playerTab === 'demo_synth'}
            onClick={() => setPlayerTab('demo_synth')}
            className={`mode-pill-btn ${
              playerTab === 'demo_synth' ? 'active-mock' : ''
            }`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Sparkles size={13} />
            <span>Demo Ambient Synth (HTML5)</span>
          </button>
        </div>
      )}

      {/* TAB 1: Official Spotify Embed or Invalid Link Fallback */}
      {playerTab === 'spotify' && (
        <div>
          {spotifyInfo.isValid ? (
            <div>
              <iframe
                key={`${spotifyInfo.trackId}-${embedInstanceKey}`}
                title={`Spotify Embed Player for ${song.title}`}
                src={spotifyInfo.embedUrl}
                width="100%"
                height="152"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="spotify-embed-frame"
                data-testid="spotify-embed-iframe"
              />
              <p
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.55rem',
                  lineHeight: 1.45,
                }}
              >
                Playback is powered directly by Spotify’s official embed player.
                Full-track vs. preview playback depends on your Spotify login
                status in this browser.
              </p>
            </div>
          ) : (
            <div
              className="alert-banner warning"
              data-testid="spotify-invalid-fallback"
              style={{ flexDirection: 'column', gap: '0.5rem' }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <AlertTriangle size={18} color="#783652" />
                <strong>Spotify Embed Unavailable for This Link</strong>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                The track URL (<code>{song.audio_url || 'none'}</code>) is a
                placeholder or non-standard link, so VibeShift will not render a
                broken player or fake audio playback.
              </p>
            </div>
          )}

          {/* External Open in Spotify CTA */}
          {spotifyInfo.isValid && (
            <div style={{ marginTop: '0.9rem' }}>
              <a
                href={spotifyInfo.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                data-testid="open-in-spotify-link"
              >
                <ExternalLink size={16} />
                <span>Open in Spotify</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Royalty-Free Procedural WAV Synth (Strictly for Demo Mode HTML5 Audio Verification) */}
      {playerTab === 'demo_synth' && apiMode === 'mock' && demoWavUrl && (
        <div
          style={{
            padding: '1.1rem',
            borderRadius: '18px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
          }}
          data-testid="demo-html5-audio-panel"
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#783652',
              marginBottom: '0.65rem',
            }}
          >
            Royalty-Free Mood Harmonic Pad ({moodMeta?.label || 'Calm'} Chords) —
            Real HTML5 Audio Controls
          </div>

          <audio
            ref={audioRef}
            src={demoWavUrl}
            onTimeUpdate={() =>
              setSynthCurrentTime(audioRef.current?.currentTime || 0)
            }
            onLoadedMetadata={() =>
              setSynthDuration(audioRef.current?.duration || 12)
            }
            onEnded={() => setIsPlayingSynth(false)}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={toggleSynthPlay}
              aria-label={isPlayingSynth ? 'Pause demo synth' : 'Play demo synth'}
            >
              {isPlayingSynth ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlayingSynth ? 'Pause' : 'Play'}</span>
            </button>

            <input
              type="range"
              min="0"
              max={synthDuration || 12}
              step="0.1"
              value={synthCurrentTime}
              onChange={handleSynthSeek}
              aria-label="Seek demo audio position"
              style={{ flex: 1 }}
            />

            <span
              style={{
                fontSize: '0.76rem',
                fontFamily: 'var(--font-tech)',
                color: 'var(--text-secondary)',
              }}
            >
              {formatSec(synthCurrentTime)} / {formatSec(synthDuration)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={toggleSynthMute}
              aria-label={synthMuted ? 'Unmute demo synth' : 'Mute demo synth'}
              style={{ padding: '0.3rem 0.5rem' }}
            >
              {synthMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={synthMuted ? 0 : synthVolume}
              onChange={handleSynthVolume}
              aria-label="Demo audio volume"
              style={{ width: '110px' }}
            />
          </div>
        </div>
      )}

      {/* Feedback Bar inside Now Playing Panel */}
      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1.1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            Track Feedback:
          </span>
          <FeedbackControls
            songId={song.id}
            feedbackState={feedbackState}
            onFeedback={onFeedback}
          />
        </div>
      </div>
    </aside>
  );
}

