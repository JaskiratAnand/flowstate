import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleMessage,
  handleAlarm,
  handleInstalled,
  handleStorageChange,
} from './background-logic';
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
    declarativeNetRequest: {
      getDynamicRules: vi.fn().mockResolvedValue([]),
      updateDynamicRules: vi.fn().mockResolvedValue(undefined),
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

  describe('handleInstalled', () => {
    it('initializes all defaults when storage is completely empty', async () => {
      vi.mocked(browser.storage.local.get).mockResolvedValue({} as any);

      await handleInstalled();

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.TIMER_CONFIG]: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
        },
      });

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.TIMER_STATE]: {
          status: 'idle',
          remainingSeconds: 25 * 60,
          sessionType: 'work',
          completedSessions: 0,
        },
      });

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.STATS]: {
          dailyPomodoros: 0,
          dailyTasksCompleted: 0,
          currentStreak: 0,
          allTimePomodoros: 0,
          lastActiveDate: '',
        },
      });

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.USER_PREFERENCES]: {
          theme: 'forest',
          colorScheme: 'system',
          fontFamily: 'karla',
          lastActiveTab: 'timer',
          moveHighPriorityToTop: true,
        },
      });

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.BLOCKING_CONFIG]: {
          enabled: true,
          mode: 'blocklist',
          strictMode: false,
          bypassDuration: 5,
          blockedSites: [
            'youtube.com',
            'twitter.com',
            'x.com',
            'reddit.com',
            'instagram.com',
            'facebook.com',
          ],
          allowedSites: [],
        },
      });

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.BYPASS_LIST]: [],
      });

      expect(browser.alarms.create).toHaveBeenCalledWith(
        'midnight-archive',
        expect.objectContaining({
          periodInMinutes: 24 * 60,
        }),
      );
    });

    it('does not overwrite existing configurations but initializes new blocking defaults', async () => {
      const existingConfig = {
        workDuration: 50,
        shortBreakDuration: 10,
        longBreakDuration: 20,
      };
      const existingState = {
        status: 'running',
        remainingSeconds: 600,
        sessionType: 'work',
        completedSessions: 2,
      };
      const existingStats = {
        dailyPomodoros: 3,
        dailyTasksCompleted: 4,
        currentStreak: 2,
        allTimePomodoros: 10,
        lastActiveDate: '2026-05-20',
      };
      const existingPrefs = {
        theme: 'ocean',
        colorScheme: 'dark',
        fontFamily: 'mono',
        lastActiveTab: 'tasks',
      };

      vi.mocked(browser.storage.local.get).mockImplementation(async (key) => {
        if (key === STORAGE_KEYS.TIMER_CONFIG)
          return { [STORAGE_KEYS.TIMER_CONFIG]: existingConfig };
        if (key === STORAGE_KEYS.TIMER_STATE)
          return { [STORAGE_KEYS.TIMER_STATE]: existingState };
        if (key === STORAGE_KEYS.STATS)
          return { [STORAGE_KEYS.STATS]: existingStats };
        if (key === STORAGE_KEYS.USER_PREFERENCES)
          return { [STORAGE_KEYS.USER_PREFERENCES]: existingPrefs };
        return {};
      });

      await handleInstalled();

      // Ensure old configs are not re-set to defaults
      expect(browser.storage.local.set).not.toHaveBeenCalledWith({
        [STORAGE_KEYS.TIMER_CONFIG]: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
        },
      });

      // Ensure moveHighPriorityToTop is added to existing preferences if missing
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.USER_PREFERENCES]: {
          ...existingPrefs,
          moveHighPriorityToTop: true,
        },
      });

      // Ensure new blocking config and bypass list are initialized
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.BLOCKING_CONFIG]: {
          enabled: true,
          mode: 'blocklist',
          strictMode: false,
          bypassDuration: 5,
          blockedSites: [
            'youtube.com',
            'twitter.com',
            'x.com',
            'reddit.com',
            'instagram.com',
            'facebook.com',
          ],
          allowedSites: [],
        },
      });

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.BYPASS_LIST]: [],
      });
    });
  });

  describe('Focus Shield Blocker Integration', () => {
    beforeEach(() => {
      vi.mocked(browser.storage.local.get).mockReset();
      vi.mocked(browser.storage.local.set).mockReset();
      vi.mocked(browser.declarativeNetRequest.updateDynamicRules).mockReset();
      vi.mocked(browser.declarativeNetRequest.getDynamicRules).mockReset();
    });

    it('syncs blocking rules when relevant storage keys change', async () => {
      const mockConfig = {
        enabled: true,
        mode: 'blocklist' as const,
        strictMode: true,
        bypassDuration: 5,
        blockedSites: ['youtube.com'],
        allowedSites: [],
      };
      const mockState = {
        status: 'idle' as const,
        remainingSeconds: 1500,
        sessionType: 'work' as const,
        completedSessions: 0,
      };

      vi.mocked(browser.storage.local.get).mockImplementation(async (key) => {
        if (key === STORAGE_KEYS.BLOCKING_CONFIG)
          return { [STORAGE_KEYS.BLOCKING_CONFIG]: mockConfig };
        if (key === STORAGE_KEYS.TIMER_STATE)
          return { [STORAGE_KEYS.TIMER_STATE]: mockState };
        if (key === STORAGE_KEYS.BYPASS_LIST)
          return { [STORAGE_KEYS.BYPASS_LIST]: [] };
        return {};
      });

      vi.mocked(
        browser.declarativeNetRequest.getDynamicRules,
      ).mockResolvedValue([{ id: 1001 }] as any);

      await handleStorageChange({ [STORAGE_KEYS.BLOCKING_CONFIG]: {} });

      // Should check existing rules
      expect(browser.declarativeNetRequest.getDynamicRules).toHaveBeenCalled();

      // Should call updateDynamicRules with removeIds: [1001] and addRules: youtube.com rule
      expect(
        browser.declarativeNetRequest.updateDynamicRules,
      ).toHaveBeenCalledWith({
        removeRuleIds: [1001],
        addRules: expect.arrayContaining([
          expect.objectContaining({
            id: 1001,
            condition: expect.objectContaining({
              regexFilter: '^https?://(?:[^/]*\\.)?youtube\\.com(?:/.*)?$',
            }),
          }),
        ]),
      });
    });

    it('cleans expired bypasses and saves active ones during check-bypass-expiry alarm', async () => {
      const expiredTime = Date.now() - 5000;
      const activeTime = Date.now() + 50000;
      const bypassList = [
        { domain: 'youtube.com', expiresAt: expiredTime },
        { domain: 'facebook.com', expiresAt: activeTime },
      ];

      vi.mocked(browser.storage.local.get).mockImplementation(async (key) => {
        if (key === STORAGE_KEYS.BYPASS_LIST)
          return { [STORAGE_KEYS.BYPASS_LIST]: bypassList };
        return {};
      });

      await handleAlarm({ name: 'check-bypass-expiry' } as any);

      // Should filter out the expired 'youtube.com' and keep 'facebook.com'
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.BYPASS_LIST]: [
          { domain: 'facebook.com', expiresAt: activeTime },
        ],
      });
    });

    it('handles BYPASS_SITE message and adds the domain to bypass list with future expiration', async () => {
      const mockConfig = {
        enabled: true,
        mode: 'blocklist' as const,
        strictMode: false,
        bypassDuration: 10,
        blockedSites: ['instagram.com'],
        allowedSites: [],
      };

      vi.mocked(browser.storage.local.get).mockImplementation(async (key) => {
        if (key === STORAGE_KEYS.BLOCKING_CONFIG)
          return { [STORAGE_KEYS.BLOCKING_CONFIG]: mockConfig };
        if (key === STORAGE_KEYS.BYPASS_LIST)
          return { [STORAGE_KEYS.BYPASS_LIST]: [] };
        return {};
      });

      const beforeTime = Date.now();
      await handleMessage({
        type: 'BYPASS_SITE',
        payload: { domain: 'instagram.com' },
      });
      const afterTime = Date.now();

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.BYPASS_LIST]: [
          expect.objectContaining({
            domain: 'instagram.com',
            expiresAt: expect.any(Number),
          }),
        ],
      });

      // Verify the expiresAt is ~10 minutes in the future
      const setCall = vi.mocked(browser.storage.local.set).mock
        .calls[0][0] as any;
      const expiresAt = setCall[STORAGE_KEYS.BYPASS_LIST][0].expiresAt;
      expect(expiresAt).toBeGreaterThanOrEqual(beforeTime + 10 * 60 * 1000);
      expect(expiresAt).toBeLessThanOrEqual(afterTime + 10 * 60 * 1000);
    });
  });
});
