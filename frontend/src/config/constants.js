/**
 * VibeShift — Central Configuration & Domain Constants
 * Strictly aligned with docs/API_CONTRACT.md, backend/api/*, and backend/services/*
 */

export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

export const DEFAULT_API_MODE =
  (import.meta.env?.VITE_API_MODE || 'live').toLowerCase() === 'mock'
    ? 'mock'
    : 'live';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB client-side ceiling per API contract
export const CAMERA_CAPTURE_WIDTH = 640;
export const CAMERA_CAPTURE_HEIGHT = 480;
export const CAMERA_JPEG_QUALITY = 0.82;

/**
 * Supported Music Moods (Backend ALLOWED_MOODS: happy, sad, calm, energetic, angry, neutral)
 */
export const MOODS = [
  {
    id: 'happy',
    label: 'Happy',
    tagline: 'Bright, warm & uplifting',
    description:
      'Lighthearted melodies and radiant rhythms that celebrate or sustain a joyful moment.',
    icon: 'Sun',
    gradient: 'linear-gradient(135deg, #CDF7F3 0%, #C8F4E8 52%, #F4CBD9 100%)',
    surfaceTint: 'rgba(205, 247, 243, 0.52)',
    borderAccent: '#7BD8CE',
    accentColor: '#196E63',
    badgeBg: '#E3FBF7',
    orbPalette: ['#CDF7F3', '#C8F4E8', '#F4CBD9'],
    cameraMapped: true,
    recommendedTargets: ['happy', 'energetic', 'calm'],
  },
  {
    id: 'calm',
    label: 'Calm',
    tagline: 'Serene, unhurried & grounding',
    description:
      'Gentle acoustic textures and spacious arrangements that give your mind room to breathe.',
    icon: 'Feather',
    gradient: 'linear-gradient(135deg, #CDF7F3 0%, #A7E8DD 55%, #BFD6F5 100%)',
    surfaceTint: 'rgba(167, 232, 221, 0.48)',
    borderAccent: '#79CFC2',
    accentColor: '#1B6478',
    badgeBg: '#E1F8F5',
    orbPalette: ['#CDF7F3', '#A7E8DD', '#BFD6F5'],
    cameraMapped: false, // Musical mood — manual choice only
    recommendedTargets: ['calm', 'happy', 'neutral'],
  },
  {
    id: 'sad',
    label: 'Sad',
    tagline: 'Tender, reflective & held with care',
    description:
      'Empathetic, unhurried songs that sit gently with heavy feelings—or softly help you shift when ready.',
    icon: 'CloudRain',
    gradient: 'linear-gradient(135deg, #BFD6F5 0%, #D7E5FA 55%, #F4CBD9 100%)',
    surfaceTint: 'rgba(191, 214, 245, 0.5)',
    borderAccent: '#94B8E8',
    accentColor: '#2F5280',
    badgeBg: '#EBF2FC',
    orbPalette: ['#BFD6F5', '#D7E5FA', '#F4CBD9'],
    cameraMapped: true,
    recommendedTargets: ['calm', 'neutral', 'happy'],
  },
  {
    id: 'energetic',
    label: 'Energetic',
    tagline: 'Kinetic, vibrant & full of momentum',
    description:
      'Driving percussion and high-spirited hooks crafted for movement, focus, or electric energy.',
    icon: 'Zap',
    gradient: 'linear-gradient(135deg, #C8F4E8 0%, #A7E8DD 50%, #BFD6F5 100%)',
    surfaceTint: 'rgba(200, 244, 232, 0.52)',
    borderAccent: '#6FD4BC',
    accentColor: '#15685A',
    badgeBg: '#E2FAF2',
    orbPalette: ['#C8F4E8', '#A7E8DD', '#BFD6F5'],
    cameraMapped: false, // Musical mood — manual choice only
    recommendedTargets: ['energetic', 'happy', 'calm'],
  },
  {
    id: 'angry',
    label: 'Angry',
    tagline: 'Intense, cathartic & honest',
    description:
      'Resonant, high-impact soundscapes to safely channel tension—or decompress toward steadier ground.',
    icon: 'Flame',
    gradient: 'linear-gradient(135deg, #F4CBD9 0%, #E7CEE6 52%, #BFD6F5 100%)',
    surfaceTint: 'rgba(244, 203, 217, 0.48)',
    borderAccent: '#DFA3B8',
    accentColor: '#783652',
    badgeBg: '#FBEBF0',
    orbPalette: ['#F4CBD9', '#BFD6F5', '#A7E8DD'],
    cameraMapped: true,
    recommendedTargets: ['calm', 'neutral', 'energetic'],
  },
  {
    id: 'neutral',
    label: 'Neutral',
    tagline: 'Balanced, clear & open-minded',
    description:
      'An easygoing equilibrium when you are simply exploring and open to wherever the music leads.',
    icon: 'Compass',
    gradient: 'linear-gradient(135deg, #E8F4FA 0%, #CDF7F3 52%, #D8E6F8 100%)',
    surfaceTint: 'rgba(205, 247, 243, 0.42)',
    borderAccent: '#9AC6DF',
    accentColor: '#365570',
    badgeBg: '#EEF6FB',
    orbPalette: ['#CDF7F3', '#BFD6F5', '#C8F4E8'],
    cameraMapped: true,
    recommendedTargets: ['happy', 'calm', 'energetic'],
  },
];

export const MOOD_IDS = MOODS.map((m) => m.id);

export const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.id, m]));

export function getMoodMeta(moodId) {
  if (!moodId) return null;
  return MOOD_MAP[String(moodId).toLowerCase()] || null;
}

/**
 * Mood Direction Modes
 */
export const MOOD_MODES = [
  {
    id: 'match',
    title: 'Match My Mood',
    subtitle: 'Stay in this space',
    description: 'Find music that feels right for this moment.',
    detail:
      'Honors how you feel right now with songs tuned to your current emotional wavelength.',
    badge: 'Resonate',
  },
  {
    id: 'change',
    title: 'Change My Mood',
    subtitle: 'Gentle transition',
    description: 'Choose the feeling you’d like to move toward.',
    detail:
      'Select a target mood and let VibeShift curate a supportive musical bridge toward that state.',
    badge: 'Shift Vibe',
  },
];

/**
 * Supported Languages (per docs/API_CONTRACT.md)
 * Functional: Malayalam, Hindi, English, Tamil
 * Upcoming (visible as coming soon, disabled to prevent invalid backend filter): Kannada, Telugu
 */
export const LANGUAGES = [
  {
    value: 'English',
    label: 'English',
    nativeName: 'English',
    region: 'Global Pop, Rock, Melody & Indie',
    supported: true,
  },
  {
    value: 'Malayalam',
    label: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'Mollywood Melodies, Classical & Contemporary',
    supported: true,
  },
  {
    value: 'Hindi',
    label: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'Bollywood Acoustic, Soul, Pop & Dance',
    supported: true,
  },
  {
    value: 'Tamil',
    label: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'Kollywood Harmonies, Rhythm & Indie',
    supported: true,
  },
  {
    value: 'Kannada',
    label: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'Catalogue expansion in progress',
    supported: false,
    comingSoonNote: 'Upcoming — awaiting backend catalogue support',
  },
  {
    value: 'Telugu',
    label: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'Catalogue expansion in progress',
    supported: false,
    comingSoonNote: 'Upcoming — awaiting backend catalogue support',
  },
];

export const SUPPORTED_LANGUAGE_VALUES = LANGUAGES.filter((l) => l.supported).map(
  (l) => l.value
);

/**
 * Supported Genres (per docs/API_CONTRACT.md)
 */
export const GENRES = [
  {
    value: 'Melody',
    label: 'Melody',
    description: 'Warm vocals, lyrical storytelling, and soothing instrumentation',
    icon: 'Music',
  },
  {
    value: 'Pop',
    label: 'Pop',
    description: 'Catchy hooks, modern production, and bright arrangements',
    icon: 'Sparkles',
  },
  {
    value: 'Rock',
    label: 'Rock',
    description: 'Expressive guitars, driving drums, and anthemic energy',
    icon: 'Guitar',
  },
  {
    value: 'Classical',
    label: 'Classical',
    description: 'Timeless acoustic grace, serene ragas, and chamber textures',
    icon: 'Piano',
  },
  {
    value: 'Dance',
    label: 'Dance',
    description: 'Infectious grooves, upbeat tempo, and rhythmic movement',
    icon: 'Disc',
  },
];

export const SUPPORTED_GENRE_VALUES = GENRES.map((g) => g.value);

/**
 * Supported Listening Contexts (per docs/API_CONTRACT.md)
 */
export const CONTEXTS = [
  {
    value: 'relax',
    label: 'Relaxing',
    description: 'Unwinding at home, tea breaks, or slow afternoons',
    icon: 'Coffee',
  },
  {
    value: 'study',
    label: 'Studying',
    description: 'Deep reading, coding, writing, or quiet concentration',
    icon: 'BookOpen',
  },
  {
    value: 'workout',
    label: 'Workout',
    description: 'Running, strength training, or active movement',
    icon: 'Activity',
  },
  {
    value: 'travel',
    label: 'Traveling',
    description: 'Window-seat daydreaming, commutes, and open roads',
    icon: 'Navigation',
  },
  {
    value: 'party',
    label: 'Party',
    description: 'Celebrating with friends, social energy, and dancing',
    icon: 'PartyPopper',
  },
  {
    value: 'sleep',
    label: 'Sleeping',
    description: 'Drifting off peacefully with soft, low-tempo soundscapes',
    icon: 'Moon',
  },
];

export const SUPPORTED_CONTEXT_VALUES = CONTEXTS.map((c) => c.value);

/**
 * AI Emotion Endpoint Status Metadata (POST /api/emotion)
 */
export const EMOTION_STATUS_META = {
  success: {
    title: 'Expression Estimate Ready',
    tone: 'success',
    guidance:
      'This is an estimate based on facial expression. You can choose how you actually feel.',
  },
  unmapped_expression: {
    title: 'Manual Mood Selection Needed',
    tone: 'info',
    guidance:
      'Your expression was detected, but expressions like surprise, fear, or disgust don’t automatically map to a single music mood. Please choose the mood that feels right below.',
  },
  no_face_detected: {
    title: 'No Face Detected',
    tone: 'warning',
    guidance:
      'We couldn’t clearly spot a face in the frame. Try facing the camera in even lighting, or simply pick your mood manually below.',
  },
  low_confidence: {
    title: 'Gentle Check — Low Confidence',
    tone: 'warning',
    guidance:
      'The lighting or angle made expression estimation uncertain. Rather than guessing, we invite you to choose your mood directly.',
  },
  face_detector_unavailable: {
    title: 'Camera Detector Unavailable',
    tone: 'warning',
    guidance:
      'The backend face detector is currently unavailable. You can seamlessly select your mood manually below.',
  },
  model_weights_not_loaded: {
    title: 'Expression Model Not Loaded',
    tone: 'warning',
    guidance:
      'The backend expression model weights are not currently loaded. Please select your mood manually.',
  },
  preprocessing_failed: {
    title: 'Frame Could Not Be Processed',
    tone: 'warning',
    guidance:
      'We couldn’t crop the camera snapshot cleanly. You can retake the photo or choose your mood manually.',
  },
  invalid_image: {
    title: 'Invalid Image Format',
    tone: 'error',
    guidance:
      'The snapshot format wasn’t recognized by the server. Please try again or pick your mood manually.',
  },
  error: {
    title: 'Temporary Estimation Issue',
    tone: 'error',
    guidance:
      'The emotion estimation service encountered a temporary hiccup. Please choose your mood manually.',
  },
};

/**
 * Mood Source Labels (for Mood Journey & Session logs)
 */
export const MOOD_SOURCE_LABELS = {
  manual: {
    label: 'Manual Selection',
    shortLabel: 'Manual',
    description: 'Chosen directly by you',
  },
  camera_suggested: {
    label: 'Camera Estimate (Confirmed)',
    shortLabel: 'Camera + Confirmed',
    description: 'Suggested from facial expression and confirmed by you',
  },
  recheck: {
    label: 'Session Mood Recheck',
    shortLabel: 'Mood Recheck',
    description: 'Updated by you during your listening session',
  },
};

/**
 * Ethical & Scientific Disclaimers
 */
export const ETHICAL_DISCLAIMERS = {
  cameraEstimate:
    'This is an estimate based on facial expression. You can choose how you actually feel.',
  cameraPrivacy:
    'Your camera only activates when you click "Enable Camera". Snapshots are processed in-memory and are never saved to disk or external storage.',
  journeyNote:
    'Your Mood Journey reflects the categorical moods you personally confirmed during this session—not an automated measurement of internal emotion or proof that music caused a change.',
  globalFeedbackNote:
    'Likes, skips, and replays update VibeShift’s recommendation scoring weights to help surface better-fitting tracks on refresh.',
};

/**
 * Parse and validate a Spotify Track URL safely.
 * Rejects placeholders like "EXAMPLE" or non-Spotify URLs.
 */
export function parseSpotifyTrackUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, trackId: null, embedUrl: null, externalUrl: null };
  }
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.hostname !== 'open.spotify.com' &&
      parsed.hostname !== 'play.spotify.com'
    ) {
      return { isValid: false, trackId: null, embedUrl: null, externalUrl: null };
    }
    // Match /track/<ID> or /intl-xx/track/<ID>
    const match = parsed.pathname.match(/\/track\/([A-Za-z0-9]{15,30})/);
    if (!match || !match[1]) {
      return { isValid: false, trackId: null, embedUrl: null, externalUrl: null };
    }
    const trackId = match[1];
    if (trackId.toUpperCase() === 'EXAMPLE') {
      return { isValid: false, trackId: null, embedUrl: null, externalUrl: null };
    }
    return {
      isValid: true,
      trackId,
      embedUrl: `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`,
      externalUrl: `https://open.spotify.com/track/${trackId}`,
    };
  } catch {
    return { isValid: false, trackId: null, embedUrl: null, externalUrl: null };
  }
}

