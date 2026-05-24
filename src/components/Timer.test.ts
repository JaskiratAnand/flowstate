import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import Timer from './Timer.svelte';
import { browser } from 'wxt/browser';

const mockStorage: Record<string, any> = {};
const storageListeners = new Set<
  (changes: Record<string, any>, areaName: string) => void
>();

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      id: 'mock-extension-id',
      getURL: (path: string) => `chrome-extension://mock-extension-id/${path}`,
      sendMessage: vi.fn(),
    },
    storage: {
      local: {
        get: vi.fn((key: string) =>
          Promise.resolve({ [key]: mockStorage[key] }),
        ),
        set: vi.fn((data: Record<string, any>) => {
          Object.assign(mockStorage, data);
          return Promise.resolve();
        }),
        onChanged: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
        },
      },
      onChanged: {
        addListener: vi.fn((listener) => {
          storageListeners.add(listener);
        }),
        removeListener: vi.fn((listener) => {
          storageListeners.delete(listener);
        }),
      },
    },
  },
}));

describe('Timer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageListeners.clear();
    for (const key in mockStorage) {
      delete mockStorage[key];
    }
  });

  it('renders Focus Shield card with initial Off state when config is disabled', async () => {
    mockStorage['blocking_config'] = { enabled: false };
    const { getByText } = render(Timer);

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalledWith('blocking_config');
    });

    expect(getByText('Focus Shield')).toBeInTheDocument();
    expect(getByText('Off')).toBeInTheDocument();
  });

  it('renders Focus Shield card with initial Active state when config is enabled', async () => {
    mockStorage['blocking_config'] = { enabled: true };
    const { getByText } = render(Timer);

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalledWith('blocking_config');
    });

    expect(getByText('Focus Shield')).toBeInTheDocument();
    expect(getByText('Active')).toBeInTheDocument();
  });

  it('invokes onOpenFocusShield callback when the card is clicked', async () => {
    mockStorage['blocking_config'] = { enabled: true };
    const onOpenFocusShield = vi.fn();
    const { getByText } = render(Timer, { onOpenFocusShield });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalledWith('blocking_config');
    });

    const card = getByText('Focus Shield').closest('button');
    expect(card).toBeInTheDocument();

    await fireEvent.click(card!);
    expect(onOpenFocusShield).toHaveBeenCalled();
  });

  it('dynamically updates status text on the card when blocking_config changes in storage', async () => {
    mockStorage['blocking_config'] = { enabled: false };
    const { getByText, queryByText } = render(Timer);

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalledWith('blocking_config');
    });

    expect(getByText('Off')).toBeInTheDocument();
    expect(queryByText('Active')).not.toBeInTheDocument();

    // Trigger storage change to enable blocking
    const changes = {
      blocking_config: {
        newValue: { enabled: true },
        oldValue: { enabled: false },
      },
    };
    storageListeners.forEach((listener) => listener(changes, 'local'));

    await waitFor(() => {
      expect(getByText('Active')).toBeInTheDocument();
    });
    expect(queryByText('Off')).not.toBeInTheDocument();
  });

  describe('Timer Skipping Behavior', () => {
    let sendMessageMock: any;

    beforeEach(() => {
      sendMessageMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(browser.runtime.sendMessage).mockImplementation(
        sendMessageMock,
      );
    });

    it('hides the skip button and renders an invisible layout placeholder if showSkipButton is false', async () => {
      mockStorage['user_preferences'] = { showSkipButton: false };
      mockStorage['timer_state'] = {
        status: 'idle',
        remainingSeconds: 1500,
        sessionType: 'work',
        completedSessions: 0,
      };

      const { queryByTitle, container } = render(Timer);

      await waitFor(() => {
        expect(browser.storage.local.get).toHaveBeenCalledWith(
          'user_preferences',
        );
      });

      expect(queryByTitle('Skip')).not.toBeInTheDocument();
      const placeholder = container.querySelector('[aria-hidden="true"]');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveClass('invisible');
      expect(placeholder).toHaveClass('pointer-events-none');
    });

    it('shows the skip button if showSkipButton is true or undefined', async () => {
      mockStorage['user_preferences'] = { showSkipButton: true };
      mockStorage['timer_state'] = {
        status: 'idle',
        remainingSeconds: 1500,
        sessionType: 'work',
        completedSessions: 0,
      };

      const { getByTitle } = render(Timer);

      await waitFor(() => {
        expect(browser.storage.local.get).toHaveBeenCalledWith(
          'user_preferences',
        );
      });

      expect(getByTitle('Skip')).toBeInTheDocument();
    });

    it('triggers skip immediately on click during breaks', async () => {
      mockStorage['user_preferences'] = { showSkipButton: true };
      mockStorage['timer_state'] = {
        status: 'idle',
        remainingSeconds: 300,
        sessionType: 'short-break',
        completedSessions: 0,
      };

      const { getByTitle } = render(Timer);

      await waitFor(() => {
        expect(browser.storage.local.get).toHaveBeenCalledWith('timer_state');
      });

      const skipBtn = getByTitle('Skip');
      await fireEvent.click(skipBtn);

      expect(sendMessageMock).toHaveBeenCalledWith({ type: 'SKIP_SESSION' });
    });

    it('does not skip on simple click during work session', async () => {
      mockStorage['user_preferences'] = { showSkipButton: true };
      mockStorage['timer_state'] = {
        status: 'idle',
        remainingSeconds: 1500,
        sessionType: 'work',
        completedSessions: 0,
      };

      const { getByTitle } = render(Timer);

      await waitFor(() => {
        expect(browser.storage.local.get).toHaveBeenCalledWith('timer_state');
      });

      const skipBtn = getByTitle('Skip');
      await fireEvent.click(skipBtn);

      expect(sendMessageMock).not.toHaveBeenCalled();
    });

    it('triggers skip after holding skip button for 1.5s during work session', async () => {
      vi.useFakeTimers();
      mockStorage['user_preferences'] = { showSkipButton: true };
      mockStorage['timer_state'] = {
        status: 'idle',
        remainingSeconds: 1500,
        sessionType: 'work',
        completedSessions: 0,
      };

      const { getByTitle } = render(Timer);

      await waitFor(() => {
        expect(browser.storage.local.get).toHaveBeenCalledWith('timer_state');
      });

      const skipBtn = getByTitle('Skip');

      // Start hold
      await fireEvent.mouseDown(skipBtn);

      // Fast-forward by 1s (should not trigger yet)
      vi.advanceTimersByTime(1000);
      expect(sendMessageMock).not.toHaveBeenCalled();

      // Fast-forward by another 500ms (total 1.5s, should trigger)
      vi.advanceTimersByTime(500);
      expect(sendMessageMock).toHaveBeenCalledWith({ type: 'SKIP_SESSION' });

      vi.useRealTimers();
    });

    it('resets progress and does not skip if pointer leaves or releases before 1.5s', async () => {
      vi.useFakeTimers();
      mockStorage['user_preferences'] = { showSkipButton: true };
      mockStorage['timer_state'] = {
        status: 'idle',
        remainingSeconds: 1500,
        sessionType: 'work',
        completedSessions: 0,
      };

      const { getByTitle } = render(Timer);

      await waitFor(() => {
        expect(browser.storage.local.get).toHaveBeenCalledWith('timer_state');
      });

      const skipBtn = getByTitle('Skip');

      // Hold and release early
      await fireEvent.mouseDown(skipBtn);
      vi.advanceTimersByTime(500);
      await fireEvent.mouseUp(skipBtn);

      vi.advanceTimersByTime(1500);
      expect(sendMessageMock).not.toHaveBeenCalled();

      // Hold and leave early
      await fireEvent.mouseDown(skipBtn);
      vi.advanceTimersByTime(500);
      await fireEvent.mouseLeave(skipBtn);

      vi.advanceTimersByTime(1500);
      expect(sendMessageMock).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('prevents double skipping when mouseup/click fires after long press completion', async () => {
      vi.useFakeTimers();
      mockStorage['user_preferences'] = { showSkipButton: true };
      mockStorage['timer_state'] = {
        status: 'idle',
        remainingSeconds: 1500,
        sessionType: 'work',
        completedSessions: 0,
      };

      const { getByTitle } = render(Timer);

      await waitFor(() => {
        expect(browser.storage.local.get).toHaveBeenCalledWith('timer_state');
      });

      const skipBtn = getByTitle('Skip');

      // Hold until skip triggers
      await fireEvent.mouseDown(skipBtn);
      vi.advanceTimersByTime(1500);
      expect(sendMessageMock).toHaveBeenCalledTimes(1);

      // Simulate mouseUp and click events following hold completion
      await fireEvent.mouseUp(skipBtn);
      await fireEvent.click(skipBtn);

      // Verify skip was not called a second time
      expect(sendMessageMock).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});
