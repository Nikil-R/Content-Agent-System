/**
 * ORION Neural Engine - Tactical Audio Utility
 * Generates futuristic, high-frequency "tech" chirps using the Web Audio API.
 * This avoids the need for external assets and demonstrates low-level browser API knowledge.
 */

class TacticalAudio {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).AudioContext;
      this.ctx = new AudioContextClass();
    }
  }

  /**
   * Short, high-frequency chirp for agent transitions
   */
  public playChirp() {
    this.init();
    if (!this.ctx) return;
    const context = this.ctx;

    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.1);
  }

  /**
   * "Success" chime for synthesis finalization
   */
  public playSuccess() {
    this.init();
    if (!this.ctx) return;
    const context = this.ctx; // Stable reference for closure

    const now = context.currentTime;
    
    [440, 880].forEach((freq, i) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      
      gain.gain.setValueAtTime(0.1, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(context.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.3);
    });
  }

  /**
   * Subtle pulse for UI micro-interactions
   */
  public playPulse() {
    this.init();
    if (!this.ctx) return;
    const context = this.ctx;

    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, context.currentTime);

    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.05);
  }
}

export const tacticalAudio = new TacticalAudio();
