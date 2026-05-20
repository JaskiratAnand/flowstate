import { browser } from 'wxt/browser';
import type { StoragePort, AlarmPort, FeedbackPort } from './timer-engine';
import { getStorageItem, setStorageItem } from './storage';
import type { TimerState, TimerConfig } from './types';

export class WxtStorageAdapter implements StoragePort {
  async getState(): Promise<TimerState> {
    return (await getStorageItem('TIMER_STATE'))!;
  }
  async setState(state: TimerState): Promise<void> {
    await setStorageItem('TIMER_STATE', state);
  }
  async getConfig(): Promise<TimerConfig> {
    return (await getStorageItem('TIMER_CONFIG'))!;
  }
}

export class WxtAlarmAdapter implements AlarmPort {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private onTick?: () => void) {}

  async scheduleTick(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      if (this.onTick) {
        this.onTick();
      }
    }, 1000);
  }

  async clearTick(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export class WxtFeedbackAdapter implements FeedbackPort {
  async notify(title: string, message: string): Promise<void> {
    await browser.notifications.create({
      type: 'basic',
      iconUrl: '/icon/128.png',
      title,
      message,
    });
  }

  async playChime(): Promise<void> {
    const OFFSCREEN_PATH = '/offscreen.html';

    // 1. Try to use offscreen API if available (Chrome MV3)
    if (typeof (browser as any).offscreen !== 'undefined') {
      try {
        // @ts-ignore
        const contexts = (await (browser.runtime as any).getContexts({
          contextTypes: ['OFFSCREEN_DOCUMENT'],
        })) as any[];

        if (contexts.length === 0) {
          await (browser as any).offscreen.createDocument({
            url: browser.runtime.getURL(OFFSCREEN_PATH),
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'Play notification sound when timer ends',
          });
        }
      } catch {
        try {
          await (browser as any).offscreen.createDocument({
            url: browser.runtime.getURL(OFFSCREEN_PATH),
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'Play notification sound when timer ends',
          });
        } catch {
          // Ignore if already exists
        }
      }
    }

    // 2. Send message - if offscreen is open, it will play.
    // If we are in Firefox/MV2, the background page might be able to handle this message itself
    // if we add a listener there, or we can try to play directly here if AudioContext exists.
    try {
      await browser.runtime.sendMessage({
        type: 'PLAY_SOUND',
      });
    } catch {
      // If no one is listening, try direct playback as fallback (for Firefox/MV2)
      if (typeof window !== 'undefined' && (window as any).AudioContext) {
        this.directChime();
      }
    }
  }

  private directChime() {
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
      console.error('Direct chime failed:', e);
    }
  }
}
