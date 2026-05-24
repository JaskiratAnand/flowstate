import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock browser before any imports
const mockListeners = new Set<(changes: any, areaName: string) => void>();
vi.mock('wxt/browser', () => {
  return {
    browser: {
      storage: {
        local: {
          get: vi.fn(),
          onChanged: {
            addListener: vi.fn((fn) => mockListeners.add(fn)),
            removeListener: vi.fn((fn) => mockListeners.delete(fn)),
          },
        },
      },
      runtime: {
        sendMessage: vi.fn().mockResolvedValue(undefined),
      },
    },
  };
});

import { browser } from 'wxt/browser';
import { useTimer } from './timer-store.svelte';
import type { TimerState } from './types';

describe('useTimer Store', () => {
  const mockInitialState: TimerState = {
    status: 'idle',
    remainingSeconds: 1500,
    sessionType: 'work',
    completedSessions: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockListeners.clear();
    vi.mocked(browser.storage.local.get).mockResolvedValue({
      timer_state: mockInitialState,
    } as any);
  });

  it('should initialize state from storage', async () => {
    const timer = useTimer();

    // Allow microtasks to complete to process getStorageItem promise
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(timer.state).toEqual(mockInitialState);
  });

  it('should update state when local storage changes', async () => {
    const timer = useTimer();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const updatedState: TimerState = {
      ...mockInitialState,
      status: 'running',
      expectedEndTime: Date.now() + 1500 * 1000,
    };

    // Simulate storage change event
    mockListeners.forEach((listener) =>
      listener(
        {
          timer_state: {
            newValue: updatedState,
          },
        },
        'local',
      ),
    );

    expect(timer.state).toEqual(updatedState);
  });

  it('should send runtime messages for actions', async () => {
    const timer = useTimer();

    await timer.start();
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'START_TIMER',
    });

    await timer.pause();
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'PAUSE_TIMER',
    });

    await timer.reset();
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'RESET_TIMER',
    });

    await timer.skip();
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'SKIP_SESSION',
    });
  });
});
