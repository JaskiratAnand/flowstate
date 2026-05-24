import { browser } from 'wxt/browser';
import { getStorageItem, STORAGE_KEYS } from './storage';
import type { TimerState, MessageType } from './types';

export interface TimerStore {
  readonly state: TimerState | null;
  start(): Promise<void>;
  pause(): Promise<void>;
  reset(): Promise<void>;
  skip(): Promise<void>;
}

export function useTimer(): TimerStore {
  let timerState = $state<TimerState | null>(null);

  // Initialize
  getStorageItem('TIMER_STATE').then((state) => {
    if (state) timerState = state;
  });

  // Listen for changes
  browser.storage.local.onChanged.addListener((changes) => {
    const timerChange = changes[STORAGE_KEYS.TIMER_STATE];
    if (timerChange) {
      timerState = timerChange.newValue as TimerState;
    }
  });

  const sendMessage = (type: MessageType) => {
    return browser.runtime.sendMessage({ type });
  };

  return {
    get state() {
      return timerState;
    },
    start: () => sendMessage('START_TIMER'),
    pause: () => sendMessage('PAUSE_TIMER'),
    reset: () => sendMessage('RESET_TIMER'),
    skip: () => sendMessage('SKIP_SESSION'),
  };
}
