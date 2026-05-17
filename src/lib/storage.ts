import { browser } from 'wxt/browser';
import type {
  TimerState,
  TimerConfig,
  Task,
  DailyArchive,
  Stats,
  UserPreferences,
} from './types';

export const STORAGE_KEYS = {
  TIMER_STATE: 'timer_state',
  TIMER_CONFIG: 'timer_config',
  TASKS: 'tasks',
  DAILY_ARCHIVE: 'daily_archive',
  STATS: 'stats',
  USER_PREFERENCES: 'user_preferences',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

export interface StorageValueMap {
  TIMER_STATE: TimerState;
  TIMER_CONFIG: TimerConfig;
  TASKS: Task[];
  DAILY_ARCHIVE: DailyArchive;
  STATS: Stats;
  USER_PREFERENCES: UserPreferences;
}

export async function getStorageItem<K extends StorageKey>(
  key: K,
): Promise<StorageValueMap[K] | null> {
  const browserKey = STORAGE_KEYS[key];
  const result = await browser.storage.local.get(browserKey);
  return (result[browserKey] as StorageValueMap[K]) || null;
}

export async function setStorageItem<K extends StorageKey>(
  key: K,
  value: StorageValueMap[K],
): Promise<void> {
  const browserKey = STORAGE_KEYS[key];
  await browser.storage.local.set({ [browserKey]: value });
}
