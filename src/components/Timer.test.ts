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
});
