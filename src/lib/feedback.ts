// ─────────────────────────────────────────────────────────────────
// Feedback: lightweight sound-effects + haptics (UX overhaul)
//
// Sound is synthesised with the Web Audio API (no audio assets, works
// fully offline in the Android WebView). Haptics use navigator.vibrate
// which is supported in the Capacitor/Android WebView. Everything is
// SSR-safe (no-ops on the server) and gated behind a persisted mute
// preference.
// ─────────────────────────────────────────────────────────────────

const MUTE_KEY = 'shadow-realms-muted';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function isBrowser() {
  return typeof window !== 'undefined';
}

if (isBrowser()) {
  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    /* ignore */
  }
}

function ensureCtx(): AudioContext | null {
  if (!isBrowser()) return null;
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOpts {
  freq: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  slideTo?: number;
  delay?: number;
}

function tone({ freq, dur = 0.18, type = 'sine', gain = 0.3, attack = 0.005, slideTo, delay = 0 }: ToneOpts) {
  const c = ensureCtx();
  if (!c || !master) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise({ dur = 0.15, gain = 0.25, filter = 1200, delay = 0 } = {}) {
  const c = ensureCtx();
  if (!c || !master) return;
  const t0 = c.currentTime + delay;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = filter;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

function vibrate(pattern: number | number[]) {
  if (!isBrowser() || muted) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

function play(fn: () => void) {
  if (muted) return;
  try {
    fn();
  } catch {
    /* ignore */
  }
}

// Rarity → celebratory chord (semitone offsets from a base note).
const RARITY_TIERS: Record<string, { base: number; notes: number[]; sparkle: boolean }> = {
  common: { base: 330, notes: [0, 7], sparkle: false },
  uncommon: { base: 349, notes: [0, 4, 7], sparkle: false },
  rare: { base: 392, notes: [0, 4, 7], sparkle: true },
  epic: { base: 440, notes: [0, 4, 7, 11], sparkle: true },
  legendary: { base: 523, notes: [0, 4, 7, 12], sparkle: true },
  mythic: { base: 587, notes: [0, 5, 7, 12, 16], sparkle: true },
};
const semi = (base: number, n: number) => base * Math.pow(2, n / 12);

export const feedback = {
  isMuted: () => muted,
  setMuted(v: boolean) {
    muted = v;
    if (isBrowser()) {
      try {
        localStorage.setItem(MUTE_KEY, v ? '1' : '0');
      } catch {
        /* ignore */
      }
    }
  },
  toggleMuted() {
    this.setMuted(!muted);
    if (!muted) this.tap();
    return muted;
  },
  // Prime the audio context on the first user gesture (browsers require it).
  unlock() {
    ensureCtx();
  },

  tap() {
    play(() => tone({ freq: 520, dur: 0.05, type: 'triangle', gain: 0.12 }));
    vibrate(8);
  },
  select() {
    play(() => tone({ freq: 680, dur: 0.07, type: 'triangle', gain: 0.16 }));
    vibrate(10);
  },
  summon() {
    play(() => {
      tone({ freq: 180, dur: 0.5, type: 'sawtooth', gain: 0.18, slideTo: 720 });
      tone({ freq: 360, dur: 0.55, type: 'sine', gain: 0.12, slideTo: 1200, delay: 0.05 });
    });
    vibrate([12, 30, 20]);
  },
  reveal(rarity: string) {
    const tier = RARITY_TIERS[rarity] ?? RARITY_TIERS.common;
    play(() => {
      tier.notes.forEach((n, i) =>
        tone({ freq: semi(tier.base, n), dur: 0.5, type: 'triangle', gain: 0.22, delay: i * 0.06 }),
      );
      if (tier.sparkle) {
        tone({ freq: 2100, dur: 0.25, type: 'sine', gain: 0.1, delay: 0.18 });
        tone({ freq: 2800, dur: 0.2, type: 'sine', gain: 0.08, delay: 0.28 });
      }
    });
    const big = tier.sparkle && (rarity === 'legendary' || rarity === 'mythic');
    vibrate(big ? [20, 40, 20, 40, 60] : [15, 25, 15]);
  },
  attack() {
    play(() => {
      tone({ freq: 140, dur: 0.12, type: 'square', gain: 0.2, slideTo: 60 });
      noise({ dur: 0.12, gain: 0.18, filter: 1600, delay: 0.01 });
    });
    vibrate(12);
  },
  hit() {
    play(() => noise({ dur: 0.1, gain: 0.16, filter: 900 }));
    vibrate(10);
  },
  victory() {
    play(() => {
      [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.35, type: 'triangle', gain: 0.24, delay: i * 0.12 }));
    });
    vibrate([20, 40, 20, 40, 20, 80]);
  },
  defeat() {
    play(() => {
      [440, 392, 330, 262].forEach((f, i) => tone({ freq: f, dur: 0.4, type: 'sawtooth', gain: 0.18, delay: i * 0.14 }));
    });
    vibrate([60, 40, 60]);
  },
  coin() {
    play(() => {
      tone({ freq: 1200, dur: 0.08, type: 'square', gain: 0.14 });
      tone({ freq: 1800, dur: 0.1, type: 'square', gain: 0.12, delay: 0.06 });
    });
    vibrate(8);
  },
  error() {
    play(() => tone({ freq: 160, dur: 0.2, type: 'sawtooth', gain: 0.18 }));
    vibrate([30, 20, 30]);
  },
};

export type Feedback = typeof feedback;
