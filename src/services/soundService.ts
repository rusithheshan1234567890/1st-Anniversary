/**
 * Web Audio API synthesized sound generator for romantic ambience and interaction feedback.
 * Operates purely client-side without relying on fragile external audio asset files.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientInterval: number | null = null;
  private isAmbientPlaying: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopRomanticAmbient();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Delicate crystal bell chime on tulip interaction / petal peel
   */
  public playChime(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 523.25 * pitchMultiplier; // C5
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext could fail on locked mobile before user gesture
    }
  }

  /**
   * Warm harmonic swell when the 3D Tulip opens
   */
  public playBloomSwell() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const chord = [261.63, 329.63, 392.0, 523.25, 659.25]; // C major / romantic chord
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.07, startTime + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 2.5);
      });
    } catch {
      // ignore audio context edge cases
    }
  }

  /**
   * Soft heartbeat thump for Heart Merge
   */
  public playHeartbeat() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      [0, 0.22].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + offset + 0.15);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.2);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Continuous gentle romantic ambient piano/harp progression
   */
  public startRomanticAmbient() {
    if (this.isMuted || this.isAmbientPlaying) return;
    this.isAmbientPlaying = true;

    const notes = [
      [261.63, 329.63, 392.0],  // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66], // G
    ];

    let chordIdx = 0;
    const playNext = () => {
      if (!this.isAmbientPlaying || this.isMuted) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;

        const chord = notes[chordIdx % notes.length];
        chordIdx++;

        chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);

          const start = ctx.currentTime + i * 0.25;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.linearRampToValueAtTime(0.035, start + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 3.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 3.5);
        });
      } catch {
        // ignore
      }
    };

    playNext();
    this.ambientInterval = window.setInterval(playNext, 3800);
  }

  public stopRomanticAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientInterval !== null) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  public toggleAmbientMusic(): boolean {
    if (this.isAmbientPlaying) {
      this.stopRomanticAmbient();
      return false;
    } else {
      this.startRomanticAmbient();
      return true;
    }
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying;
  }
}

export const soundService = new SoundService();
