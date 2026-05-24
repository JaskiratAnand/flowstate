/**
 * Synthesizes a brief, subtle mechanical-sounding click using the Web Audio API.
 * This runs on user gesture contexts (like holding/releasing the button).
 */
export function playClickSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // We synthesize a mechanical switch click sound:
    // It consists of a high-pitch transient frequency sweep that decays quickly.
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Short transient frequency sweep starting high and dropping down
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.03);

    // Quick exponential volume decay to simulate mechanical release (< 50ms)
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (err) {
    console.error('Failed to synthesize mechanical click audio:', err);
  }
}
