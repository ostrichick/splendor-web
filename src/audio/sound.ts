// High-fidelity Web Audio API synthesizer for board game effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Sound when it becomes YOUR turn (alert chime)
   */
  public playTurnStart() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Pleasant 2-bell alert (C6, G6)
    const tones = [1046.5, 1567.98];
    tones.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  /**
   * Realistic multi-chip clatter sound when taking gem tokens
   */
  public playChip() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Rapid sequence of 3 slight pitch-shifted clicks to sound like casino poker chips
    const pitches = [1200, 1500, 980];
    pitches.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.035;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.04);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    });
  }

  /**
   * Rewarding chord when successfully purchasing a development card
   */
  public playBuy() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Major 7th ascending arpeggio: C5, E5, G5, B5, C6
    const chord = [523.25, 659.25, 783.99, 987.77, 1046.5];

    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  /**
   * Card reservation sound (Slide swoosh + gold coin ding)
   */
  public playReserve() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Swoosh tone
    const oscSwoosh = this.ctx.createOscillator();
    const gainSwoosh = this.ctx.createGain();
    oscSwoosh.type = 'sawtooth';
    oscSwoosh.frequency.setValueAtTime(250, now);
    oscSwoosh.frequency.exponentialRampToValueAtTime(800, now + 0.12);

    gainSwoosh.gain.setValueAtTime(0.1, now);
    gainSwoosh.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    oscSwoosh.connect(gainSwoosh);
    gainSwoosh.connect(this.ctx.destination);
    oscSwoosh.start(now);
    oscSwoosh.stop(now + 0.12);

    // 2. Gold Coin Ding (after card draw)
    const oscCoin = this.ctx.createOscillator();
    const gainCoin = this.ctx.createGain();
    const coinTime = now + 0.1;
    oscCoin.type = 'sine';
    oscCoin.frequency.setValueAtTime(1760, coinTime); // A6
    gainCoin.gain.setValueAtTime(0.25, coinTime);
    gainCoin.gain.exponentialRampToValueAtTime(0.001, coinTime + 0.25);
    oscCoin.connect(gainCoin);
    gainCoin.connect(this.ctx.destination);
    oscCoin.start(coinTime);
    oscCoin.stop(coinTime + 0.25);
  }

  /**
   * Noble visit fanfare (+3 points)
   */
  public playNoble() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const fanfare = [587.33, 739.99, 880.0, 1174.66, 1479.98]; // D major royal fanfare

    fanfare.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }

  /**
   * Soft turn change tick
   */
  public playTurnSwitch() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Low buzzer for illegal action
   */
  public playError() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Final Game Win Fanfare
   */
  public playWin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const timings = [0, 0.12, 0.24, 0.36, 0.52, 0.68];

    fanfare.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = now + timings[idx];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }
}

export const sound = new SoundManager();
