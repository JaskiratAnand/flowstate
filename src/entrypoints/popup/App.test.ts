import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import App from './App.svelte';

// Mock matchMedia
window.matchMedia =
  window.matchMedia ||
  (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

const mockStorage: Record<string, any> = {};
const storageListeners = new Set<
  (changes: Record<string, any>, areaName: string) => void
>();

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      id: 'mock-extension-id',
      getURL: (path: string) => `chrome-extension://mock-extension-id/${path}`,
      getManifest: () => ({ version: '1.0.0' }),
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

describe('App Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageListeners.clear();
    for (const key in mockStorage) {
      delete mockStorage[key];
    }
    mockStorage['user_preferences'] = {
      theme: 'forest',
      colorScheme: 'system',
      fontFamily: 'karla',
      lastActiveTab: 'timer',
    };
    mockStorage['blocking_config'] = {
      enabled: true,
      mode: 'blocklist',
      strictMode: false,
      bypassDuration: 5,
      blockedSites: [],
      allowedSites: [],
    };
  });

  it('clicking the Focus Shield shortcut card on the Timer page opens the BlockingModal overlay', async () => {
    const { getByText, getByLabelText, queryByLabelText } = render(App);

    await waitFor(() => {
      expect(getByText('Focus Shield')).toBeInTheDocument();
    });

    expect(
      queryByLabelText('Toggle Block Distractions'),
    ).not.toBeInTheDocument();

    const card = getByText('Focus Shield').closest('button');
    expect(card).toBeInTheDocument();

    await fireEvent.click(card!);

    await waitFor(() => {
      expect(getByLabelText('Toggle Block Distractions')).toBeInTheDocument();
    });
  });
});
