import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

  describe('PRO version configurations', () => {
    afterEach(() => {
      import.meta.env.WXT_PRO_VERSION = undefined;
    });

    it('renders the PRO badge when WXT_PRO_VERSION is enabled', async () => {
      import.meta.env.WXT_PRO_VERSION = 'true';
      const { getByText } = render(App);

      await waitFor(() => {
        expect(getByText('PRO')).toBeInTheDocument();
        expect(getByText('PRO')).toHaveClass('bg-accent/15');
      });
    });

    it('does not render the PRO badge when WXT_PRO_VERSION is not enabled', async () => {
      import.meta.env.WXT_PRO_VERSION = 'false';
      const { queryByText } = render(App);

      await waitFor(() => {
        expect(queryByText('PRO')).not.toBeInTheDocument();
      });
    });

    it('bypasses startup preference sanitization in Pro mode', async () => {
      import.meta.env.WXT_PRO_VERSION = 'true';
      mockStorage['user_preferences'] = {
        theme: 'custom',
        customAccentColor: '#aabbcc',
        colorScheme: 'system',
        fontFamily: 'mono',
        lastActiveTab: 'timer',
      };

      render(App);

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe(
          'custom',
        );
        expect(
          document.documentElement.style.getPropertyValue('--accent'),
        ).toBe('#aabbcc');
        expect(
          document.documentElement.style.getPropertyValue('--font-main'),
        ).toContain('JetBrains Mono');
      });
    });

    it('enforces startup preference sanitization in Free mode', async () => {
      import.meta.env.WXT_PRO_VERSION = 'false';
      mockStorage['user_preferences'] = {
        theme: 'custom',
        customAccentColor: '#aabbcc',
        colorScheme: 'system',
        fontFamily: 'mono',
        lastActiveTab: 'timer',
      };

      render(App);

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe(
          'forest',
        );
        expect(
          document.documentElement.style.getPropertyValue('--font-main'),
        ).toContain('Karla');
        expect(
          document.documentElement.style.getPropertyValue('--accent'),
        ).toBe('');
      });
    });
  });
});
