// Native Web Audio Synthesizer for Retro 8-bit Sound Effects
// Zero external file dependencies - synthesized directly in the browser!

let audioCtx: AudioContext | null = null;
const AUDIO_MUTE_KEY = 'cglabs_mascot_sound_muted';

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isAudioMuted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(AUDIO_MUTE_KEY) === 'true';
}

export function setAudioMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUDIO_MUTE_KEY, String(muted));
}

/**
 * Play a high-pitched retro 8-bit chirp (poke / click companion).
 */
export function playPokeChirp(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  // Fast frequency sweep up
  osc.frequency.setValueAtTime(587.33, now); // D5
  osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.08); // A5
  osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.16); // D6

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

/**
 * Play an ascending 3-note arpeggio chime (milestone / EXP earned).
 */
export function playExpChime(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const start = ctx.currentTime + idx * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.1, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.16);
  });
}

/**
 * Play a triumphant multi-tone fanfare (evolution / victory).
 */
export function playFanfare(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const chords = [
    { freq: 440.0, time: 0.0 },  // A4
    { freq: 554.37, time: 0.1 }, // C#5
    { freq: 659.25, time: 0.2 }, // E5
    { freq: 880.0, time: 0.32 }, // A5 (Hold)
  ];

  chords.forEach((note) => {
    const start = ctx.currentTime + note.time;
    const duration = note.time >= 0.3 ? 0.35 : 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, start);

    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.02);
  });
}
