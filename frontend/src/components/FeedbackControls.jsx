import React from 'react';
import { Heart, RotateCcw, SkipForward } from 'lucide-react';

export default function FeedbackControls({
  songId,
  activeAction = null,
  onFeedback,
  disabled = false,
}) {
  return (
    <div
      className="feedback-row impact-feedback-row"
      role="group"
      aria-label="Track feedback controls"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onFeedback(songId, 'like')}
        className={`feedback-btn impact-fb-btn ${
          activeAction === 'like' ? 'active-like' : ''
        }`}
        aria-pressed={activeAction === 'like'}
        title="Like this song"
        data-testid={`feedback-like-${songId}`}
      >
        <Heart
          size={14}
          fill={activeAction === 'like' ? 'currentColor' : 'none'}
        />
        <span>Like</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onFeedback(songId, 'replay')}
        className={`feedback-btn impact-fb-btn ${
          activeAction === 'replay' ? 'active-replay' : ''
        }`}
        aria-pressed={activeAction === 'replay'}
        title="Mark song for replay"
        data-testid={`feedback-replay-${songId}`}
      >
        <RotateCcw size={14} />
        <span>Replay</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onFeedback(songId, 'skip')}
        className={`feedback-btn impact-fb-btn ${
          activeAction === 'skip' ? 'active-skip' : ''
        }`}
        aria-pressed={activeAction === 'skip'}
        title="Skip this song and advance to next"
        data-testid={`feedback-skip-${songId}`}
      >
        <SkipForward size={14} />
        <span>Skip</span>
      </button>
    </div>
  );
}
