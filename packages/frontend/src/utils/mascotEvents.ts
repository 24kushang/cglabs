import { playPokeChirp, playExpChime, playFanfare } from './mascotAudio';

export interface MascotReactionDetail {
  message: string;
  emotion?: 'happy' | 'excited' | 'proud' | 'battle' | 'love';
  sound?: 'chirp' | 'chime' | 'fanfare' | 'none';
  durationMs?: number;
}

const MASCOT_EVENT_NAME = 'cglabs-mascot-reaction';

/**
 * Trigger a reactive message and animation on the desktop mascot companion.
 */
export function triggerMascotReaction(
  message: string,
  emotion: 'happy' | 'excited' | 'proud' | 'battle' | 'love' = 'happy',
  sound: 'chirp' | 'chime' | 'fanfare' | 'none' = 'chirp',
  durationMs: number = 4200
): void {
  if (typeof window === 'undefined') return;

  // Play sound if requested
  if (sound === 'chirp') {
    playPokeChirp();
  } else if (sound === 'chime') {
    playExpChime();
  } else if (sound === 'fanfare') {
    playFanfare();
  }

  const event = new CustomEvent<MascotReactionDetail>(MASCOT_EVENT_NAME, {
    detail: { message, emotion, sound, durationMs },
  });
  window.dispatchEvent(event);
}

/**
 * Subscribe to mascot reactions. Returns an unsubscribe function.
 */
export function subscribeMascotReaction(
  callback: (detail: MascotReactionDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<MascotReactionDetail>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener(MASCOT_EVENT_NAME, handler);
  return () => {
    window.removeEventListener(MASCOT_EVENT_NAME, handler);
  };
}
