/**
 * VibeShift — Legal Procedural Ambient Audio Generator (For Demo Mode HTML5 Audio Player)
 * Synthesizes a soothing, royalty-free stereo WAV harmonic pad in-memory so users in
 * Standalone Demo Mode can test genuine HTML5 <audio> controls (play/pause, seek, duration,
 * volume, mute, replay) without using copyrighted MP3 files or passing Spotify URLs to <audio>.
 */

const MOOD_CHORDS = {
  happy: [261.63, 329.63, 392.0, 493.88], // Cmaj7
  calm: [220.0, 261.63, 329.63, 392.0], // Am7
  sad: [196.0, 233.08, 293.66, 349.23], // Gm7
  energetic: [293.66, 369.99, 440.0, 554.37], // Dmaj7
  angry: [164.81, 220.0, 246.94, 329.63], // E5 / Esus4
  neutral: [246.94, 293.66, 369.99, 440.0], // Bm7
};

const cachedBlobUrls = new Map();

export function getDemoAmbientWavUrl(mood = 'calm', durationSeconds = 12) {
  const key = `${mood}-${durationSeconds}`;
  if (cachedBlobUrls.has(key)) {
    return cachedBlobUrls.get(key);
  }

  if (typeof window === 'undefined' || typeof URL === 'undefined') {
    return null;
  }

  const sampleRate = 22050;
  const numSamples = sampleRate * durationSeconds;
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const dataSize = numSamples * numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // WAV Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const freqs = MOOD_CHORDS[mood] || MOOD_CHORDS.calm;

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    // Gentle fade-in and fade-out envelope
    const fadeIn = Math.min(1, t / 1.5);
    const fadeOut = Math.min(1, (durationSeconds - t) / 2.0);
    const lfo = 0.82 + 0.18 * Math.sin(2 * Math.PI * 0.35 * t);
    const envelope = Math.max(0, fadeIn * fadeOut * lfo);

    let sample = 0;
    for (let f = 0; f < freqs.length; f += 1) {
      const freq = freqs[f];
      const detune = 1 + (f - 1.5) * 0.0015;
      sample += Math.sin(2 * Math.PI * freq * detune * t) * (0.22 / freqs.length);
      // Add soft octave harmonic
      sample +=
        Math.sin(2 * Math.PI * (freq * 0.5) * t) * (0.12 / freqs.length);
    }

    const pcmValue = Math.max(-1, Math.min(1, sample * envelope));
    view.setInt16(44 + i * 2, pcmValue * 32767, true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  cachedBlobUrls.set(key, url);
  return url;
}

