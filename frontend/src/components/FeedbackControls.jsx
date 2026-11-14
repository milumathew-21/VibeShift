import React, { useState } from 'react';
import { Heart, SkipForward, RotateCcw } from 'lucide-react';

export default function FeedbackControls({
  songId,
  feedbackState = {},
  onFeedback,
  compact = false,
}) {
  const [busyAction, setBusyAction] = useState(null);
  const { liked = false, replayCount = 0 } = feedbackState;

  const handleAction = async (action) => {
    if (!onFeedback || busyAction) return;
    setBusyAction(action);
    try {
      await onFeedback(songId, action);
    } catch {
      // Handled in context status banner
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div
      className="feedback-bar"
      role="group"
      aria-label="Song feedback actions"
    >
      <button
        type="button"
        onClick={() => handleAction('like')}
        disabled={Boolean(busyAction)}
        className={`feedback-btn ${liked ? 'liked' : ''}`}
        aria-pressed={liked}
        data-testid={`feedback-like-${songId}`}
        title="Like this song (boosts recommendation weight)"
      >
        <Heart
          size={15}
          fill={liked ? '#783652' : 'none'}
          aria-hidden="true"
        />
        <span>{liked ? 'Liked' : 'Like'}</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('replay')}
        disabled={Boolean(busyAction)}
        className={`feedback-btn ${replayCount > 0 ? 'replayed' : ''}`}
        data-testid={`feedback-replay-${songId}`}
        title="Record replay and focus track"
      >
        <RotateCcw size={15} aria-hidden="true" />
        <span>
          {compact
            ? replayCount > 0
              ? `${replayCount}`
              : 'Replay'
            : replayCount > 0
            ? `Replay (${replayCount})`
            : 'Replay'}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('skip')}
        disabled={Boolean(busyAction)}
        className="feedback-btn"
        data-testid={`feedback-skip-${songId}`}
        title="Skip song and move to next recommendation"
      >
        <SkipForward size={15} aria-hidden="true" />
        <span>Skip</span>
      </button>
    </div>
  );
}

