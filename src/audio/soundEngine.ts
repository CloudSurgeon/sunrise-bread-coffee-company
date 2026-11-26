class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainVal = 0.14,
    startOffset = 0,
    endFreq?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private noise(duration: number, filterFreq: number, filterType: BiquadFilterType, gainVal = 0.09, startOffset = 0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + startOffset;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + duration + 0.02);
  }

  public playTap(): void {
    this.tone(420, 0.06, 'triangle', 0.1, 0, 560);
  }

  public playSizzle(): void {
    this.noise(0.26, 3600, 'highpass', 0.075);
    this.tone(180, 0.09, 'triangle', 0.07, 0, 120);
  }

  public playScoop(): void {
    this.tone(330, 0.08, 'sine', 0.13, 0, 520);
    this.tone(520, 0.07, 'triangle', 0.08, 0.05, 660);
  }

  public playGravy(): void {
    this.tone(240, 0.11, 'sine', 0.14, 0, 390);
    this.tone(390, 0.09, 'sine', 0.1, 0.07, 310);
  }

  public playCoffeePour(): void {
    this.noise(0.28, 2200, 'bandpass', 0.06);
    this.tone(480, 0.12, 'sine', 0.09, 0.04, 620);
  }

  public playOvenDing(): void {
    this.tone(1046.5, 0.28, 'sine', 0.12, 0);
    this.tone(2093, 0.22, 'triangle', 0.05, 0.01);
  }

  public playServe(combo = 1): void {
    const semitoneBoost = Math.min(combo - 1, 6);
    const mult = Math.pow(2, semitoneBoost / 12);
    this.tone(523.25 * mult, 0.14, 'triangle', 0.15, 0);
    this.tone(659.25 * mult, 0.16, 'triangle', 0.14, 0.06);
    this.tone(783.99 * mult, 0.22, 'sine', 0.15, 0.12);
    if (combo >= 3) {
      this.tone(1046.5 * mult, 0.25, 'sine', 0.11, 0.18);
    }
  }

  public playCash(): void {
    this.tone(1318.5, 0.09, 'sine', 0.11, 0);
    this.tone(1760, 0.18, 'sine', 0.12, 0.06);
  }

  public playBurn(): void {
    this.noise(0.22, 900, 'lowpass', 0.08);
    this.tone(155, 0.22, 'sawtooth', 0.06, 0, 95);
  }

  public playTrash(): void {
    this.tone(190, 0.12, 'triangle', 0.12, 0, 88);
  }

  public playSeagull(): void {
    this.tone(1480, 0.16, 'sine', 0.09, 0, 1980);
    this.tone(1980, 0.18, 'sine', 0.09, 0.14, 1180);
  }

  public playWipe(): void {
    this.noise(0.14, 2800, 'bandpass', 0.06);
    this.tone(620, 0.1, 'sine', 0.09, 0, 940);
  }

  public playRocketLaunch(): void {
    this.noise(0.85, 320, 'lowpass', 0.12, 0);
    this.tone(120, 0.5, 'sawtooth', 0.05, 0, 220);
    this.tone(523.25, 0.15, 'triangle', 0.12, 0.18);
    this.tone(659.25, 0.15, 'triangle', 0.12, 0.30);
    this.tone(783.99, 0.28, 'triangle', 0.14, 0.42);
  }

  public playWalkout(): void {
    this.tone(330, 0.16, 'sawtooth', 0.08, 0, 270);
    this.tone(260, 0.28, 'sawtooth', 0.08, 0.15, 185);
  }

  public playUpgrade(): void {
    this.tone(523.25, 0.12, 'triangle', 0.14, 0);
    this.tone(659.25, 0.12, 'triangle', 0.14, 0.07);
    this.tone(783.99, 0.14, 'triangle', 0.14, 0.14);
    this.tone(1046.5, 0.32, 'sine', 0.16, 0.21);
  }

  public playShiftEnd(passed: boolean): void {
    if (passed) {
      this.tone(523.25, 0.14, 'triangle', 0.15, 0);
      this.tone(659.25, 0.14, 'triangle', 0.15, 0.1);
      this.tone(783.99, 0.14, 'triangle', 0.15, 0.2);
      this.tone(1046.5, 0.4, 'triangle', 0.18, 0.3);
    } else {
      this.tone(392, 0.18, 'triangle', 0.13, 0);
      this.tone(349.23, 0.18, 'triangle', 0.13, 0.16);
      this.tone(329.63, 0.35, 'triangle', 0.13, 0.32);
    }
  }
}

export const soundEngine = new SoundEngine();
