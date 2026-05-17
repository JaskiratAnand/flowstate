import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storage';
import { browser } from 'wxt/browser';
import type { TimerState } from './types';

vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
      },
    },
  },
}));

describe('Storage Abstraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets an item from storage with the correct key', async () => {
    const mockData = { [STORAGE_KEYS.TIMER_STATE]: { status: 'idle' } };
    vi.mocked(browser.storage.local.get).mockResolvedValue(mockData as any);

    const result = await getStorageItem('TIMER_STATE');

    expect(browser.storage.local.get).toHaveBeenCalledWith(
      STORAGE_KEYS.TIMER_STATE,
    );
    expect(result).toEqual({ status: 'idle' });
  });

  it('sets an item in storage with the correct key', async () => {
    const mockState: TimerState = {
      status: 'running',
      remainingSeconds: 1500,
      sessionType: 'work',
      completedSessions: 0,
    };
    vi.mocked(browser.storage.local.set).mockResolvedValue(undefined as any);

    await setStorageItem('TIMER_STATE', mockState);

    expect(browser.storage.local.set).toHaveBeenCalledWith({
      [STORAGE_KEYS.TIMER_STATE]: mockState,
    });
  });
});
