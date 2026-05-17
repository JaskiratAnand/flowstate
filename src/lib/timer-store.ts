import { writable, type Readable } from 'svelte/store';
import { browser } from 'wxt/browser';
import { getStorageItem, STORAGE_KEYS } from './storage';
import type { TimerState, MessageType } from './types';

export interface TimerStore extends Readable<TimerState | null> {
  start(): Promise<void>;
  pause(): Promise<void>;
  reset(): Promise<void>;
  skip(): Promise<void>;
}

export function useTimer(): TimerStore {
  const { subscribe, set } = writable<TimerState | null>(null);

  // Initialize
  getStorageItem('TIMER_STATE').then((state) => {
    if (state) set(state);
  });

  // Listen for changes
  browser.storage.local.onChanged.addListener((changes) => {
    const timerChange = changes[STORAGE_KEYS.TIMER_STATE];
    if (timerChange) {
      set(timerChange.newValue as TimerState);
    }
  });

  const sendMessage = (type: MessageType) => {
    return browser.runtime.sendMessage({ type });
  };

  return {
    subscribe,
    start: () => sendMessage('START_TIMER'),
    pause: () => sendMessage('PAUSE_TIMER'),
    reset: () => sendMessage('RESET_TIMER'),
    skip: () => sendMessage('SKIP_SESSION'),
  };
}
