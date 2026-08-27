// Synthesizer Web Audio API for Chimes without external file dependencies
import { SoundPreset } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSoundByPreset(
  preset: SoundPreset = 'gov-standard',
  volumePercent: number = 80,
  isUrgent = false
) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGainValue = Math.max(0.01, Math.min(1.0, volumePercent / 100)) * 0.3;

    if (preset === 'urgent-alert' || isUrgent) {
      // 3-tone urgent alert chime: D5 -> F#5 -> A5
      const frequencies = [587.33, 739.99, 880.0];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);

        gain.gain.setValueAtTime(masterGainValue, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.32);
      });
    } else if (preset === 'crystal-ding') {
      // High bright crystal chime (C6, G6)
      const frequencies = [1046.5, 1567.98];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(masterGainValue * 0.8, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    } else if (preset === 'modern-beep') {
      // Tech double beep (E5 -> E6)
      const frequencies = [659.25, 1318.51];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(masterGainValue * 0.5, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.18);
      });
    } else if (preset === 'soft-chime') {
      // Soft gentle 3-tone harmonic
      const frequencies = [440.0, 554.37, 659.25]; // A4, C#5, E5
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        gain.gain.setValueAtTime(masterGainValue * 0.9, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.45);
      });
    } else {
      // 'gov-standard' - Official standard 2-tone melodic chime (C5, G5)
      const frequencies = [523.25, 783.99];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(masterGainValue, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.45);
      });
    }
  } catch {
    // Graceful fallback if audio context blocked
  }
}

export function playNotificationSound(isUrgent = false) {
  playSoundByPreset(isUrgent ? 'urgent-alert' : 'gov-standard', 80, isUrgent);
}

