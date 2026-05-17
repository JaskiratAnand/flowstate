import { browser } from 'wxt/browser';

function chime() {
  try {
    // @ts-ignore
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.24;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.start(t);
      osc.stop(t + 0.75);
    });
  } catch (e) {
    console.error('Chime failed:', e);
  }
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'PLAY_SOUND') {
    chime();
  }
});
