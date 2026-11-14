/**
 * VibeShift — Canonical Frontend Domain Constants & Editorial Visual Design Tokens
 * Strictly aligned with docs/API_CONTRACT.md, backend/data/songs.csv, and Impact Flow editorial direction.
 *
 * Core Editorial Palette:
 * - Warm Cream Background: #F8F8E9
 * - Near Black Contrast:   #171717
 * - Soft Lime Accent:      #DFF3A3
 * - Electric Blue Accent:  #3577D4
 * - Blush Pink Accent:     #F3BDD0
 * - Pure White Surface:    #FFFFFF
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const DEFAULT_API_MODE =
  import.meta.env.VITE_API_MODE === 'live' ? 'live' : 'mock';

/**
 * Supported Music Moods (6 canonical lowercase values)
 * Built around the warm-cream + near-black + lime / electric-blue / blush-pink creative system.
 */
export const MOODS = [
  {
    id: 'happy',
    label: 'Happy',
    tagline: 'Sunlit grooves & radiant rhythm',
    description:
      'Uplifting melodies, bright hooks, and warm rhythmic energy that celebrate where you are.',
    gradient: 'linear-gradient(135deg, #DFF3A3 0%, #F8F8E9 58%, #FFF7C2 100%)',
    surfaceTint: '#F4F9DF',
    pillColor: '#DFF3A3',
    accent: '#171717',
    badgeAccent: '#4D6B14',
    orbColor: '#DFF3A3',
    orbSecondary: '#3577D4',
    orbEmissive: '#B8DF52',
    motionProfile: 'upbeat',
    iconName: 'Sun',
    editorialNumber: '01',
    soundscapeTitle: 'Solar Euphoria',
    artworkTheme: {
      bg: '#DFF3A3',
      fg: '#171717',
      secondary: '#3577D4',
      tertiary: '#FFFFFF',
      pattern: 'sunburst',
    },
  },
  {
    id: 'calm',
    label: 'Calm',
    tagline: 'Weightless acoustic & ambient stillness',
    description:
      'Unhurried acoustic textures, soft piano resonance, and serene melodic space.',
    gradient: 'linear-gradient(135deg, #DCE9FA 0%, #F8F8E9 60%, #DFF3A3 100%)',
    surfaceTint: '#EDF3FB',
    pillColor: '#DCE9FA',
    accent: '#3577D4',
    badgeAccent: '#3577D4',
    orbColor: '#3577D4',
    orbSecondary: '#DFF3A3',
    orbEmissive: '#295FA8',
    motionProfile: 'serene',
    iconName: 'Wind',
    editorialNumber: '02',
    soundscapeTitle: 'Velvet Horizon',
    artworkTheme: {
      bg: '#3577D4',
      fg: '#FFFFFF',
      secondary: '#DFF3A3',
      tertiary: '#F8F8E9',
      pattern: 'waves',
    },
  },
  {
    id: 'sad',
    label: 'Sad',
    tagline: 'Tender strings & reflective solace',
    description:
      'Gentle, validating compositions that hold space for quiet reflection without harshness.',
    gradient: 'linear-gradient(135deg, #F3BDD0 0%, #F8F8E9 62%, #E3ECFA 100%)',
    surfaceTint: '#FBF0F4',
    pillColor: '#F3BDD0',
    accent: '#8B3252',
    badgeAccent: '#8B3252',
    orbColor: '#F3BDD0',
    orbSecondary: '#3577D4',
    orbEmissive: '#D888A6',
    motionProfile: 'gentle',
    iconName: 'CloudRain',
    editorialNumber: '03',
    soundscapeTitle: 'Midnight Letter',
    artworkTheme: {
      bg: '#F3BDD0',
      fg: '#171717',
      secondary: '#FFFFFF',
      tertiary: '#3577D4',
      pattern: 'ripples',
    },
  },
  {
    id: 'energetic',
    label: 'Energetic',
    tagline: 'High-voltage pulse & kinetic drive',
    description:
      'Driving percussion, bold basslines, and momentum-building anthems built for motion.',
    gradient: 'linear-gradient(135deg, #3577D4 0%, #DFF3A3 68%, #F8F8E9 100%)',
    surfaceTint: '#EBF2FC',
    pillColor: '#3577D4',
    accent: '#3577D4',
    badgeAccent: '#1E56A0',
    orbColor: '#3577D4',
    orbSecondary: '#DFF3A3',
    orbEmissive: '#3577D4',
    motionProfile: 'dynamic',
    iconName: 'Zap',
    editorialNumber: '04',
    soundscapeTitle: 'Kinetic Pulse',
    artworkTheme: {
      bg: '#171717',
      fg: '#DFF3A3',
      secondary: '#3577D4',
      tertiary: '#F3BDD0',
      pattern: 'prism',
    },
  },
  {
    id: 'angry',
    label: 'Angry',
    tagline: 'Cathartic release & grounded power',
    description:
      'Channel intense tension into grounded rhythmic release or decompress toward calm.',
    gradient: 'linear-gradient(135deg, #F3BDD0 0%, #F6D8C8 56%, #F8F8E9 100%)',
    surfaceTint: '#FAF0EC',
    pillColor: '#F3BDD0',
    accent: '#9E3B33',
    badgeAccent: '#9E3B33',
    orbColor: '#E07A5F',
    orbSecondary: '#F3BDD0',
    orbEmissive: '#C45B41',
    motionProfile: 'grounded',
    iconName: 'Flame',
    editorialNumber: '05',
    soundscapeTitle: 'Ember Release',
    artworkTheme: {
      bg: '#171717',
      fg: '#F3BDD0',
      secondary: '#E07A5F',
      tertiary: '#F8F8E9',
      pattern: 'eclipse',
    },
  },
  {
    id: 'neutral',
    label: 'Neutral',
    tagline: 'Balanced flow & open curiosity',
    description:
      'Clean, versatile soundscapes for steady focus, everyday rhythm, and unhurried discovery.',
    gradient: 'linear-gradient(135deg, #EAE9D7 0%, #F8F8E9 55%, #DFF3A3 100%)',
    surfaceTint: '#F3F2E4',
    pillColor: '#E8E7D5',
    accent: '#171717',
    badgeAccent: '#3D3D35',
    orbColor: '#DFF3A3',
    orbSecondary: '#F3BDD0',
    orbEmissive: '#9AB858',
    motionProfile: 'balanced',
    iconName: 'Compass',
    editorialNumber: '06',
    soundscapeTitle: 'Studio Equilibrium',
    artworkTheme: {
      bg: '#F8F8E9',
      fg: '#171717',
      secondary: '#DFF3A3',
      tertiary: '#3577D4',
      pattern: 'grid',
    },
  },
];

export const MOOD_MAP = MOODS.reduce((acc, mood) => {
  acc[mood.id] = mood;
  return acc;
}, {});

export const MOOD_IDS = MOODS.map((m) => m.id);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const EMOTION_STATUS_META = {
  success: {
    title: 'Expression Estimated',
    guidance:
      'This is only an estimate of facial expression, not proof of feelings. Please confirm or adjust your mood below.',
    tone: 'success',
  },
  unmapped_expression: {
    title: 'Manual Mood Selection Needed',
    guidance:
      'Your expression does not map directly to a single music mood. Please choose how you feel manually below.',
    tone: 'warning',
  },
  no_face_detected: {
    title: 'No Face Detected',
    guidance:
      'No face was detected in the photo. You can retake the snapshot in clearer lighting or choose your mood manually.',
    tone: 'warning',
  },
  low_confidence: {
    title: 'Low Expression Confidence',
    guidance:
      'Facial expression confidence was low. Please select your mood manually so your playlist fits how you feel.',
    tone: 'warning',
  },
  error: {
    title: 'Estimation Unavailable',
    guidance:
      'Could not estimate facial expression from this image. Please select your mood manually.',
    tone: 'error',
  },
};

/**
 * Categorical ordering for Mood Journey timeline (No fabricated numerical sentiment score)
 */
export const MOOD_CHART_ORDER = [
  'calm',
  'neutral',
  'happy',
  'energetic',
  'sad',
  'angry',
];

/**
 * Supported Recommendation Modes (Section 14)
 */
export const MOOD_MODES = [
  {
    id: 'match',
    label: 'Match My Mood',
    subtitle: 'Stay with the feeling.',
    description:
      'Immerse yourself in songs that mirror and honour your current emotional frequency.',
    badge: 'Resonance Mode',
    accentBg: '#DFF3A3',
    accentText: '#171717',
  },
  {
    id: 'change',
    label: 'Change My Mood',
    subtitle: 'Find a different vibe.',
    description:
      'Build an intentional musical bridge from how you feel right now toward the state you want next.',
    badge: 'Transition Mode',
    accentBg: '#F3BDD0',
    accentText: '#171717',
  },
];

/**
 * Languages — Active dataset languages + visibly disabled upcoming languages
 */
export const LANGUAGES = [
  { value: '', label: 'All Supported Languages', supported: true, badge: '140 Tracks', code: 'ALL' },
  { value: 'English', label: 'English', supported: true, badge: '40 Tracks', code: 'EN' },
  { value: 'Malayalam', label: 'Malayalam', supported: true, badge: '21 Tracks', code: 'ML' },
  { value: 'Hindi', label: 'Hindi', supported: true, badge: '40 Tracks', code: 'HI' },
  { value: 'Tamil', label: 'Tamil', supported: true, badge: '39 Tracks', code: 'TA' },
  {
    value: 'Kannada',
    label: 'Kannada',
    supported: false,
    badge: 'Coming Soon',
    code: 'KN',
    note: 'Not in current dataset',
  },
  {
    value: 'Telugu',
    label: 'Telugu',
    supported: false,
    badge: 'Coming Soon',
    code: 'TE',
    note: 'Not in current dataset',
  },
];

/**
 * Supported Genres (Must match Title-Case dataset values in songs.csv)
 */
export const GENRES = [
  { value: '', label: 'Any Genre', subtitle: 'Full sonic spectrum', accent: '#F8F8E9' },
  { value: 'Melody', label: 'Melody', subtitle: 'Warm vocal & acoustic', accent: '#DFF3A3' },
  { value: 'Pop', label: 'Pop', subtitle: 'Crisp hooks & modern pulse', accent: '#F3BDD0' },
  { value: 'Rock', label: 'Rock', subtitle: 'Guitars, grit & anthemic drive', accent: '#DCE9FA' },
  { value: 'Classical', label: 'Classical', subtitle: 'Timeless orchestration', accent: '#EAE9D7' },
  { value: 'Dance', label: 'Dance', subtitle: 'High-tempo rhythm & groove', accent: '#DFF3A3' },
];

/**
 * Supported Listening Contexts (Must match lowercase dataset values in songs.csv)
 */
export const CONTEXTS = [
  { value: '', label: 'Any Activity', icon: 'Sparkles', tag: 'Everyday' },
  { value: 'relax', label: 'Relax', icon: 'Coffee', tag: 'Unwind' },
  { value: 'study', label: 'Study', icon: 'BookOpen', tag: 'Deep Focus' },
  { value: 'workout', label: 'Workout', icon: 'Dumbbell', tag: 'High Output' },
  { value: 'travel', label: 'Travel', icon: 'Compass', tag: 'In Motion' },
  { value: 'party', label: 'Party', icon: 'Music', tag: 'Social Energy' },
  { value: 'sleep', label: 'Sleep', icon: 'Moon', tag: 'Night Drift' },
];

export const SUPPORTED_LANGUAGE_VALUES = LANGUAGES.filter(
  (l) => l.supported && l.value
).map((l) => l.value);

export const SUPPORTED_GENRE_VALUES = GENRES.filter((g) => g.value).map(
  (g) => g.value
);

export const SUPPORTED_CONTEXT_VALUES = CONTEXTS.filter((c) => c.value).map(
  (c) => c.value
);

/**
 * Feedback actions accepted by POST /api/feedback
 */
export const FEEDBACK_ACTIONS = [
  { id: 'like', label: 'Like', description: 'Save to your session affinity' },
  { id: 'replay', label: 'Replay', description: 'Mark as a repeat favourite' },
  { id: 'skip', label: 'Skip', description: 'Pass and advance to next track' },
];

/**
 * Editorial Gallery Soundscape Panels for Homepage Hero (Section 8)
 */
export const HERO_GALLERY_PANELS = [
  {
    id: 'gallery-happy',
    title: 'Happy',
    subtitle: 'Sunlit Grooves',
    category: 'MOOD / 01',
    moodId: 'happy',
    bg: '#DFF3A3',
    text: '#171717',
    accent: '#3577D4',
    trackSample: 'Bye Bye Bye • *NSYNC',
    pattern: 'sunburst',
  },
  {
    id: 'gallery-calm',
    title: 'Calm',
    subtitle: 'Weightless Stillness',
    category: 'MOOD / 02',
    moodId: 'calm',
    bg: '#3577D4',
    text: '#FFFFFF',
    accent: '#DFF3A3',
    trackSample: 'Akamalar • A.R. Rahman',
    pattern: 'waves',
  },
  {
    id: 'gallery-energetic',
    title: 'Energetic',
    subtitle: 'Kinetic Voltage',
    category: 'MOOD / 03',
    moodId: 'energetic',
    bg: '#171717',
    text: '#DFF3A3',
    accent: '#F3BDD0',
    trackSample: 'Counting Stars • OneRepublic',
    pattern: 'prism',
  },
  {
    id: 'gallery-reflective',
    title: 'Reflective',
    subtitle: 'Tender Solace',
    category: 'MOOD / 04',
    moodId: 'sad',
    bg: '#F3BDD0',
    text: '#171717',
    accent: '#3577D4',
    trackSample: 'Jo Tum Mere Ho • Anuv Jain',
    pattern: 'ripples',
  },
  {
    id: 'gallery-melody',
    title: 'Melody',
    subtitle: 'Intimate Vocals',
    category: 'GENRE / 05',
    moodId: 'calm',
    bg: '#F2F0DC',
    text: '#171717',
    accent: '#3577D4',
    trackSample: 'Nenjukkul Peidhidum • Harris Jayaraj',
    pattern: 'vinyl',
  },
  {
    id: 'gallery-classical',
    title: 'Classical',
    subtitle: 'Timeless Strings',
    category: 'GENRE / 06',
    moodId: 'neutral',
    bg: '#1F242D',
    text: '#F8F8E9',
    accent: '#DFF3A3',
    trackSample: 'Alag Aasmaan • Anuv Jain',
    pattern: 'arch',
  },
  {
    id: 'gallery-acoustic',
    title: 'Acoustic',
    subtitle: 'Warm Resonance',
    category: 'SOUNDSCAPE / 07',
    moodId: 'calm',
    bg: '#DFF3A3',
    text: '#171717',
    accent: '#171717',
    trackSample: 'Love Yourself • Justin Bieber',
    pattern: 'strings',
  },
  {
    id: 'gallery-pop',
    title: 'Pop',
    subtitle: 'Modern Hooks',
    category: 'GENRE / 08',
    moodId: 'happy',
    bg: '#F3BDD0',
    text: '#171717',
    accent: '#171717',
    trackSample: 'Kesariya • Arijit Singh',
    pattern: 'circles',
  },
];

/**
 * Validate and extract a real 22-character Spotify Track ID from an audio_url.
 * Rejects placeholder strings like "EXAMPLE" or malformed links.
 */
export function parseSpotifyTrackUrl(audioUrl) {
  if (!audioUrl || typeof audioUrl !== 'string') {
    return { isValid: false, trackId: null, embedUrl: null, openUrl: null };
  }

  const trimmed = audioUrl.trim();
  const match = trimmed.match(
    /^https?:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]{22})(?:[/?#].*)?$/
  );

  if (!match || !match[1]) {
    return {
      isValid: false,
      trackId: null,
      embedUrl: null,
      openUrl: trimmed.startsWith('http') ? trimmed : null,
    };
  }

  const trackId = match[1];
  return {
    isValid: true,
    trackId,
    embedUrl: `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`,
    openUrl: `https://open.spotify.com/track/${trackId}`,
  };
}

export function getMoodMeta(moodId) {
  if (!moodId) return MOOD_MAP.neutral;
  const normalized = String(moodId).toLowerCase().trim();
  return MOOD_MAP[normalized] || MOOD_MAP.neutral;
}
