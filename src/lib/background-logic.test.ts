import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleMessage, handleAlarm } from './background-logic';
import { browser } from 'wxt/browser';
import { STORAGE_KEYS } from './storage';

vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
      },
    },
    alarms: {
      create: vi.fn(),
      clear: vi.fn(),
    },
    notifications: {
      create: vi.fn(),
    },
  },
}));

describe('Background Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles START_TIMER by updating state to running and creating an alarm', async () => {
    const mockState = {
      status: 'idle',
      remainingSeconds: 0,
      sessionType: 'work',
      completedSessions: 0,
    };
    const mockConfig = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
    };

    vi.mocked(browser.storage.local.get).mockImplementation(async (key) => {
      if (key === STORAGE_KEYS.TIMER_STATE)
        return { [STORAGE_KEYS.TIMER_STATE]: mockState };
      if (key === STORAGE_KEYS.TIMER_CONFIG)
        return { [STORAGE_KEYS.TIMER_CONFIG]: mockConfig };
      return {};
    });

    await handleMessage({ type: 'START_TIMER' });

    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        [STORAGE_KEYS.TIMER_STATE]: expect.objectContaining({
          status: 'running',
        }),
      }),
    );
    expect(browser.alarms.create).toHaveBeenCalledWith('pomodoro-tick', {
      periodInMinutes: 1 / 60,
    });
  });

  it('handles PAUSE_TIMER by updating state to paused and clearing the alarm', async () => {
    const mockState = {
      status: 'running',
      remainingSeconds: 1500,
      sessionType: 'work',
      completedSessions: 0,
    };
    const mockConfig = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
    };

    vi.mocked(browser.storage.local.get).mockImplementation(async (key) => {
      if (key === STORAGE_KEYS.TIMER_STATE)
        return { [STORAGE_KEYS.TIMER_STATE]: mockState };
      if (key === STORAGE_KEYS.TIMER_CONFIG)
        return { [STORAGE_KEYS.TIMER_CONFIG]: mockConfig };
      return {};
    });

    await handleMessage({ type: 'PAUSE_TIMER' });

    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        [STORAGE_KEYS.TIMER_STATE]: expect.objectContaining({
          status: 'paused',
        }),
      }),
    );
    expect(browser.alarms.clear).toHaveBeenCalledWith('pomodoro-tick');
  });

  it('handles pomodoro-tick alarm by decrementing time', async () => {
    const mockState = {
      status: 'running',
      remainingSeconds: 1500,
      sessionType: 'work',
      completedSessions: 0,
    };
    const mockConfig = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
    };

    vi.mocked(browser.storage.local.get).mockImplementation(async (key) => {
      if (key === STORAGE_KEYS.TIMER_STATE)
        return { [STORAGE_KEYS.TIMER_STATE]: mockState };
      if (key === STORAGE_KEYS.TIMER_CONFIG)
        return { [STORAGE_KEYS.TIMER_CONFIG]: mockConfig };
      return {};
    });

    await handleAlarm({ name: 'pomodoro-tick' } as any);

    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        [STORAGE_KEYS.TIMER_STATE]: expect.objectContaining({
          remainingSeconds: 1499,
        }),
      }),
    );
  });
});
