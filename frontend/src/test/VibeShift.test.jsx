import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VibeShiftProvider } from '../context/VibeShiftContext';
import App from '../App';
import { parseSpotifyTrackUrl } from '../config/constants';
import {
  normalizeEmotionResponse,
  estimateEmotionFromImage,
} from '../services/emotionService';
import {
  buildRecommendationPayload,
  normalizeRecommendationList,
  fetchRecommendations,
} from '../services/recommendationService';
import {
  createListeningSession,
  recordSessionMood,
  fetchSessionJourney,
} from '../services/sessionService';
import { submitSongFeedback } from '../services/feedbackService';
import { resetMockState } from '../mocks/mockEngine';
import MusicPlayer from '../components/MusicPlayer';

function renderWithRouter(initialEntries = ['/'], initialApiMode = 'mock') {
  return render(
    <MemoryRouter
      initialEntries={initialEntries}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <VibeShiftProvider initialApiMode={initialApiMode}>
        <App />
      </VibeShiftProvider>
    </MemoryRouter>
  );
}

describe('VibeShift Frontend Complete Verification Suite', () => {
  beforeEach(() => {
    resetMockState();
  });

  it('renders Landing Page hero, 3D orb container/fallback, and navigates via Find My Vibe', async () => {
    renderWithRouter(['/'], 'mock');

    expect(
      screen.getByRole('heading', {
        name: /Your mood\.\s*Your music\.\s*Your moment\./i,
      })
    ).toBeInTheDocument();

    expect(screen.getByTestId('animated-mood-orb')).toBeInTheDocument();
    expect(screen.getByTestId('hero-explore-how-btn')).toBeInTheDocument();

    const findVibeBtn = screen.getByTestId('hero-find-my-vibe-btn');
    fireEvent.click(findVibeBtn);

    expect(
      await screen.findByRole('heading', {
        name: /How are you feeling right now\?/i,
      })
    ).toBeInTheDocument();
  });

  it('renders Dashboard with honest empty-session state and interactive action cards', () => {
    renderWithRouter(['/dashboard'], 'mock');

    expect(
      screen.getByRole('heading', { name: /Welcome to your space\./i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Every feeling deserves a soundtrack\./i)
    ).toBeInTheDocument();

    // Honest empty state when no session is active
    expect(screen.getByTestId('dashboard-empty-session')).toBeInTheDocument();
    expect(
      screen.getByTestId('dashboard-action-discover-mood')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('dashboard-action-match-mood')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('dashboard-action-change-mood')
    ).toBeInTheDocument();
  });

  it('handles manual mood selection, mood confirmation, and Match/Change target mood clearing', async () => {
    renderWithRouter(['/discover'], 'mock');

    // Select Calm mood
    const calmCard = screen.getByTestId('mood-card-calm');
    fireEvent.click(calmCard);

    // Confirmation section appears with "You're feeling calm?"
    expect(
      await screen.findByRole('heading', { name: /You’re feeling calm\?/i })
    ).toBeInTheDocument();

    // Confirm mood
    fireEvent.click(screen.getByTestId('confirm-mood-btn'));
    expect(screen.getByText(/Confirmed: Calm/i)).toBeInTheDocument();

    // Switch to Change My Mood mode -> TargetMoodSelector appears
    fireEvent.click(screen.getByTestId('mode-card-change'));
    expect(screen.getByTestId('target-mood-selector')).toBeInTheDocument();

    // Launch button should be disabled until a target mood is picked in Change mode
    const launchBtn = screen.getByTestId('launch-recommendations-btn');
    expect(launchBtn).toBeDisabled();

    // Select target mood 'happy' inside TargetMoodSelector
    const moodCards = screen.getAllByTestId('mood-card-happy');
    // The second happy card is inside TargetMoodSelector
    fireEvent.click(moodCards[moodCards.length - 1]);
    expect(launchBtn).not.toBeDisabled();

    // Switching back to Match mode must clear targetMood and hide TargetMoodSelector
    fireEvent.click(screen.getByTestId('mode-card-match'));
    expect(
      screen.queryByTestId('target-mood-selector')
    ).not.toBeInTheDocument();
    expect(launchBtn).not.toBeDisabled();
  });

  it('prevents selecting unsupported upcoming languages (Kannada, Telugu) while allowing supported ones', () => {
    renderWithRouter(['/discover'], 'mock');

    const malayalamBtn = screen.getByTestId('lang-option-Malayalam');
    const kannadaBtn = screen.getByTestId('lang-option-Kannada');
    const teluguBtn = screen.getByTestId('lang-option-Telugu');

    expect(malayalamBtn).not.toBeDisabled();
    expect(kannadaBtn).toBeDisabled();
    expect(teluguBtn).toBeDisabled();

    fireEvent.click(malayalamBtn);
    expect(malayalamBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('normalizes POST /api/emotion responses accurately and never silently defaults null emotions to neutral', () => {
    // 1. Mapped success ('happy')
    const happyRes = normalizeEmotionResponse({
      emotion: 'happy',
      confidence: 0.88,
      status: 'success',
      note: 'This is only an estimate of facial expression.',
    });
    expect(happyRes.emotion).toBe('happy');
    expect(happyRes.requiresManualSelection).toBe(false);

    // 2. Unmapped expression ('surprise' -> emotion: null, confidence: 0.76, status: 'success')
    const surpriseRes = normalizeEmotionResponse({
      emotion: null,
      confidence: 0.76,
      status: 'success',
      note: "Detected facial expression is 'surprise', which has no direct music mood mapping.",
    });
    expect(surpriseRes.emotion).toBeNull();
    expect(surpriseRes.requiresManualSelection).toBe(true);

    // 3. No face detected (confidence 0.0 placeholder)
    const noFaceRes = normalizeEmotionResponse({
      emotion: null,
      confidence: 0.0,
      status: 'no_face_detected',
      note: 'No face was detected in the photo.',
    });
    expect(noFaceRes.emotion).toBeNull();
    expect(noFaceRes.requiresManualSelection).toBe(true);

    // 4. Low confidence
    const lowConfRes = normalizeEmotionResponse({
      emotion: null,
      confidence: 0.28,
      status: 'low_confidence',
      note: 'Facial expression confidence is low.',
    });
    expect(lowConfRes.emotion).toBeNull();
    expect(lowConfRes.requiresManualSelection).toBe(true);
  });

  it('validates Spotify track URLs safely and rejects placeholder links', () => {
    const valid = parseSpotifyTrackUrl(
      'https://open.spotify.com/track/0OA00aPt3BV10qeMIs3meW'
    );
    expect(valid.isValid).toBe(true);
    expect(valid.trackId).toBe('0OA00aPt3BV10qeMIs3meW');
    expect(valid.embedUrl).toBe(
      'https://open.spotify.com/embed/track/0OA00aPt3BV10qeMIs3meW?utm_source=generator'
    );

    const placeholder = parseSpotifyTrackUrl(
      'https://open.spotify.com/track/EXAMPLE'
    );
    expect(placeholder.isValid).toBe(false);

    const nonSpotify = parseSpotifyTrackUrl('https://example.com/song.mp3');
    expect(nonSpotify.isValid).toBe(false);
  });

  it('renders Spotify Embed iframe for valid track links and fallback for invalid placeholder links', () => {
    const { rerender } = render(
      <MusicPlayer
        song={{
          id: 1,
          title: 'Big Dawgs',
          artist: 'Hanumankind, Kalmi',
          language: 'English',
          genre: 'Pop',
          mood_tags: ['angry', 'energetic'],
          audio_url: 'https://open.spotify.com/track/0OA00aPt3BV10qeMIs3meW',
        }}
        apiMode="live"
      />
    );

    expect(screen.getByTestId('spotify-embed-iframe')).toBeInTheDocument();
    expect(screen.getByTestId('open-in-spotify-link')).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/0OA00aPt3BV10qeMIs3meW'
    );

    // Rerender with placeholder URL
    rerender(
      <MusicPlayer
        song={{
          id: 999,
          title: 'Sample Song',
          artist: 'Sample Artist',
          language: 'English',
          genre: 'Pop',
          mood_tags: ['happy'],
          audio_url: 'https://open.spotify.com/track/EXAMPLE',
        }}
        apiMode="live"
      />
    );

    expect(
      screen.queryByTestId('spotify-embed-iframe')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('spotify-invalid-fallback')).toBeInTheDocument();
  });

  it('completes full end-to-end user flow: mood -> session -> recommendations -> feedback -> recheck -> journey', async () => {
    renderWithRouter(['/discover'], 'mock');

    // 1. Select Happy mood & confirm
    fireEvent.click(screen.getByTestId('mood-card-happy'));
    fireEvent.click(await screen.findByTestId('confirm-mood-btn'));

    // 2. Select Hindi language & Dance genre
    fireEvent.click(screen.getByTestId('lang-option-Hindi'));
    fireEvent.click(screen.getByTestId('genre-option-Dance'));

    // 3. Launch recommendations
    fireEvent.click(screen.getByTestId('launch-recommendations-btn'));

    // 4. Verify Recommendations page loads top-level array of tracks
    expect(
      await screen.findByRole('heading', {
        name: /Your soundtrack starts here\./i,
      })
    ).toBeInTheDocument();

    // Like first song
    const likeButtons = screen.getAllByRole('button', { name: /^Like$/i });
    fireEvent.click(likeButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Added to your liked vibrations/i)
      ).toBeInTheDocument();
    });

    // 5. Open Optional Mood Recheck and log 'calm'
    fireEvent.click(screen.getByTestId('open-mood-recheck-btn'));
    expect(
      await screen.findByRole('heading', { name: /How are you feeling now\?/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('recheck-mood-calm'));
    fireEvent.click(screen.getByTestId('confirm-recheck-submit'));

    // 6. Navigate to Mood Journey and verify chronological entries
    const journeyNavLinks = screen.getAllByRole('link', {
      name: /Mood Journey/i,
    });
    fireEvent.click(journeyNavLinks[0]);

    expect(
      await screen.findByRole('heading', { name: /Your Mood Journey/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('mood-chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('journey-entry-0')).toBeInTheDocument();
    expect(screen.getByTestId('journey-entry-1')).toBeInTheDocument();
  });

  it('validates recommendation payload serialization and top-level array parsing', () => {
    const payload = buildRecommendationPayload({
      currentMood: 'sad',
      mode: 'change',
      targetMood: 'calm',
      language: 'Malayalam',
      genre: 'Melody',
      context: 'relax',
    });

    expect(payload).toEqual({
      current_mood: 'sad',
      mode: 'change',
      target_mood: 'calm',
      language: 'Malayalam',
      genre: 'Melody',
      context: 'relax',
    });

    const songs = normalizeRecommendationList([
      {
        id: 84,
        title: 'Akamalar',
        artist: 'A.R. Rahman',
        language: 'Malayalam',
        genre: 'Melody',
        mood_tags: ['calm'],
        audio_url: 'https://open.spotify.com/track/0xi39iiwgnflcUCx5E8IuR',
      },
    ]);
    expect(songs).toHaveLength(1);
    expect(songs[0].id).toBe(84);
  });

  describe('Live API Service Layer Contract Tests (HTTP Fetch)', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('sends exact FastAPI payloads for sessions, mood, recommendations, feedback, journey, and emotion', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      // 1. POST /api/sessions
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          session_id: 7,
          created_at: '2026-11-14 18:00:00',
        }),
      });
      const sessionRes = await createListeningSession(
        { language: 'Malayalam', genre: 'Melody', context: 'relax' },
        { apiMode: 'live' }
      );
      expect(sessionRes.session_id).toBe(7);
      expect(sessionRes.isMock).toBe(false);

      // 2. POST /api/sessions/7/mood
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          message: 'Mood recorded successfully',
          session_id: 7,
          mood: 'calm',
          source: 'manual',
          confidence: 1.0,
          recorded_at: '2026-11-14 18:00:05',
        }),
      });
      const moodRes = await recordSessionMood(
        7,
        { mood: 'calm', source: 'manual', confidence: 1.0 },
        { apiMode: 'live' }
      );
      expect(moodRes.mood).toBe('calm');

      // 3. POST /api/recommendations (Top-level JSON array)
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [
          {
            id: 84,
            title: 'Akamalar (From "PS-2") [Malayalam]',
            artist: 'A.R. Rahman',
            language: 'Malayalam',
            genre: 'Melody',
            mood_tags: ['calm'],
            audio_url: 'https://open.spotify.com/track/0xi39iiwgnflcUCx5E8IuR',
          },
        ],
      });
      const recRes = await fetchRecommendations(
        {
          currentMood: 'calm',
          mode: 'match',
          language: 'Malayalam',
          genre: 'Melody',
          context: 'relax',
        },
        { apiMode: 'live' }
      );
      expect(recRes.songs).toHaveLength(1);
      expect(recRes.songs[0].id).toBe(84);

      // 4. POST /api/feedback
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          message: 'Feedback recorded successfully',
          session_id: 7,
          song_id: 84,
          action: 'like',
        }),
      });
      const fbRes = await submitSongFeedback(
        { sessionId: 7, songId: 84, action: 'like' },
        { apiMode: 'live' }
      );
      expect(fbRes.action).toBe('like');

      // 5. GET /api/sessions/7/journey
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          session_id: 7,
          entries: [
            {
              mood: 'calm',
              source: 'manual',
              recorded_at: '2026-11-14 18:00:05',
            },
          ],
        }),
      });
      const journeyRes = await fetchSessionJourney(7, { apiMode: 'live' });
      expect(journeyRes.entries).toHaveLength(1);

      // 6. POST /api/emotion (multipart/form-data with 'file')
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          emotion: 'happy',
          confidence: 0.88,
          status: 'success',
          note: 'This is only an estimate of facial expression, not proof of feelings.',
        }),
      });
      const fakeImage = new Blob(['fake-jpeg-bytes'], { type: 'image/jpeg' });
      const emoRes = await estimateEmotionFromImage(fakeImage, {
        apiMode: 'live',
      });
      expect(emoRes.emotion).toBe('happy');
      expect(emoRes.confidence).toBe(0.88);
    });

    it('extracts FastAPI detail error messages on non-2xx responses without silently switching to mock data', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          detail: 'Session with ID 999 not found.',
        }),
      });

      await expect(
        fetchSessionJourney(999, { apiMode: 'live' })
      ).rejects.toThrow('Session with ID 999 not found.');
    });
  });
});
