import { SoundProfile } from '../types';

/**
 * Web Audio API Mechanical Sound Synthesizer.
 * Provides realistic tactile acoustic feedback with zero external audio assets.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private profile: SoundProfile = 'mechanical';

  constructor() {
    // Lazily init AudioContext on first user interaction
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public setProfile(profile: SoundProfile) {
    this.profile = profile;
  }

  public playKey(isSpace: boolean = false) {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(ctx.destination);

      if (this.profile === 'mechanical') {
        this.playMechanical(ctx, masterGain, now, isSpace);
      } else if (this.profile === 'clicky') {
        this.playClicky(ctx, masterGain, now, isSpace);
      } else if (this.profile === 'creamy') {
        this.playCreamy(ctx, masterGain, now, isSpace);
      } else if (this.profile === 'typewriter') {
        this.playTypewriter(ctx, masterGain, now, isSpace);
      }
    } catch {
      // Audio errors should never crash the typing flow
    }
  }

  private playMechanical(ctx: AudioContext, master: GainNode, now: number, isSpace: boolean) {
    // 1. Low thock thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const baseFreq = isSpace ? 110 : 160 + Math.random() * 20;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);

    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start(now);
    osc.stop(now + 0.06);

    // 2. High transient click
    const bufferSize = ctx.sampleRate * 0.015;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);
  }

  private playClicky(ctx: AudioContext, master: GainNode, now: number, isSpace: boolean) {
    // Sharp blue switch click (double click)
    const baseFreq = isSpace ? 2800 : 3400 + Math.random() * 300;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.015);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.016);
  }

  private playCreamy(ctx: AudioContext, master: GainNode, now: number, isSpace: boolean) {
    // Lubed muted switch (deep low sine + lowpass noise)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const baseFreq = isSpace ? 130 : 190 + Math.random() * 15;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);

    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playTypewriter(ctx: AudioContext, master: GainNode, now: number, isSpace: boolean) {
    // Metallic impact
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isSpace ? 400 : 850 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playError() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.09);

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  public playSuccess() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const noteTime = now + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(this.volume * 0.3, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.25);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
