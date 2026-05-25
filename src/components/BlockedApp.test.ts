import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import BlockedApp from './BlockedApp.svelte';
import { browser } from 'wxt/browser';

// Mock storage and messages
const mockStorage: Record<string, any> = {};
const mockSendMessage = vi.fn();

vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn((key: string) =>
          Promise.resolve({ [key]: mockStorage[key] }),
        ),
        set: vi.fn((data: Record<string, any>) => {
          Object.assign(mockStorage, data);
          return Promise.resolve();
        }),
      },
    },
    runtime: {
      sendMessage: vi.fn((msg: any) => {
        mockSendMessage(msg);
        return Promise.resolve();
      }),
    },
  },
}));

// Mock window location and matchMedia
const replaceMock = vi.fn();
const closeMock = vi.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('BlockedApp Component', () => {
  const defaultPrefs = {
    theme: 'ocean',
    colorScheme: 'dark',
    fontFamily: 'mono',
    lastActiveTab: 'timer',
  };

  const defaultConfig = {
    enabled: true,
    mode: 'blocklist',
    strictMode: false,
    bypassDuration: 10,
    blockedSites: ['facebook.com'],
    allowedSites: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset storage mocks
    mockStorage['user_preferences'] = { ...defaultPrefs };
    mockStorage['blocking_config'] = { ...defaultConfig };

    // Reset document element attributes
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-dark');
    document.documentElement.style.removeProperty('--font-main');

    // Define window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/blocked.html?url=https%3A%2F%2Ffacebook.com%2Fsome%2Fpath',
        search: '?url=https%3A%2F%2Ffacebook.com%2Fsome%2Fpath',
        replace: replaceMock,
      },
      configurable: true,
      writable: true,
    });
    window.close = closeMock;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function mountAndSetup() {
    const renderResult = render(BlockedApp);
    // Wait for the asynchronous onMount (storage loading & data-theme apply)
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('ocean');
    });
    return renderResult;
  }

  it('loads correct preferences and config from storage and applies to root', async () => {
    await mountAndSetup();

    expect(document.documentElement.getAttribute('data-theme')).toBe('ocean');
    expect(document.documentElement.getAttribute('data-dark')).toBe('true');
    expect(document.documentElement.style.getPropertyValue('--font-main')).toBe(
      '"JetBrains Mono", monospace',
    );
  });

  it('initializes countdown to 15 and ticks down every second', async () => {
    const { getByText, queryByText } = await mountAndSetup();

    // Initial state
    expect(getByText('15')).toBeInTheDocument();
    expect(getByText('Breathe In Slowly...')).toBeInTheDocument();

    // Fast-forward 1 second
    await vi.advanceTimersByTimeAsync(1000);
    expect(getByText('14')).toBeInTheDocument();

    // Fast-forward 14 more seconds to reach 0
    await vi.advanceTimersByTimeAsync(14000);
    expect(queryByText('Breathe In Slowly...')).not.toBeInTheDocument();
  });

  it('cycles through breathing instructions and scaling as countdown ticks', async () => {
    const { getByText } = await mountAndSetup();

    // 0s elapsed: countdown = 15. cycleTime = 0. Inhale
    expect(getByText('Breathe In Slowly...')).toBeInTheDocument();

    // 4s elapsed: countdown = 11. cycleTime = 4. Hold
    await vi.advanceTimersByTimeAsync(4000);
    expect(getByText('Hold...')).toBeInTheDocument();

    // 6s elapsed: countdown = 9. cycleTime = 6. Exhale
    await vi.advanceTimersByTimeAsync(2000);
    expect(getByText('Breathe Out...')).toBeInTheDocument();

    // 10s elapsed: countdown = 5. cycleTime = 10. Hold
    await vi.advanceTimersByTimeAsync(4000);
    expect(getByText('Hold...')).toBeInTheDocument();

    // 12s elapsed: countdown = 3. cycleTime = 0. Inhale
    await vi.advanceTimersByTimeAsync(2000);
    expect(getByText('Breathe In Slowly...')).toBeInTheDocument();
  });

  it('transitions to typing challenge when countdown reaches 0', async () => {
    const { getByText, getByPlaceholderText, queryByText } =
      await mountAndSetup();

    // Let 15 seconds pass
    await vi.advanceTimersByTimeAsync(15000);

    expect(queryByText('Breathe In Slowly...')).not.toBeInTheDocument();
    expect(getByText('Pause & Reflect')).toBeInTheDocument();
    expect(getByText('facebook.com')).toBeInTheDocument();
    expect(
      getByPlaceholderText('Type the phrase to proceed...'),
    ).toBeInTheDocument();
  });

  it('validates input phrase reactively and displays bypass button', async () => {
    const { getByPlaceholderText, getByText, queryByText } =
      await mountAndSetup();

    // Let 15 seconds pass
    await vi.advanceTimersByTimeAsync(15000);

    const input = getByPlaceholderText(
      'Type the phrase to proceed...',
    ) as HTMLInputElement;

    // Partially typed
    await fireEvent.input(input, { target: { value: 'I choose to bypass' } });
    expect(queryByText(/Bypass for 10 Mins/i)).not.toBeInTheDocument();

    // Fully typed but with wrong case/characters
    await fireEvent.input(input, {
      target: { value: 'i choose to bypass my focus right now.' },
    });
    expect(queryByText(/Bypass for 10 Mins/i)).not.toBeInTheDocument();

    // Correctly typed
    await fireEvent.input(input, {
      target: { value: 'I choose to bypass my focus right now.' },
    });
    expect(getByText(/Bypass for 10 Mins/i)).toBeInTheDocument();
  });

  it('sends BYPASS_SITE runtime message and redirects on bypass click', async () => {
    const { getByPlaceholderText, getByText } = await mountAndSetup();

    await vi.advanceTimersByTimeAsync(15000);

    const input = getByPlaceholderText(
      'Type the phrase to proceed...',
    ) as HTMLInputElement;
    await fireEvent.input(input, {
      target: { value: 'I choose to bypass my focus right now.' },
    });

    const bypassBtn = getByText(/Bypass for 10 Mins/i);
    await fireEvent.click(bypassBtn);

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'BYPASS_SITE',
      payload: { domain: 'facebook.com' },
    });

    // Wait for the redirect timeout (150ms)
    await vi.advanceTimersByTimeAsync(150);
    expect(replaceMock).toHaveBeenCalledWith('https://facebook.com/some/path');
  });

  it('triggers bypass when pressing Enter on matching phrase', async () => {
    const { getByPlaceholderText } = await mountAndSetup();

    await vi.advanceTimersByTimeAsync(15000);

    const input = getByPlaceholderText(
      'Type the phrase to proceed...',
    ) as HTMLInputElement;
    await fireEvent.input(input, {
      target: { value: 'I choose to bypass my focus right now.' },
    });

    // Press key other than Enter
    await fireEvent.keyPress(input, { key: 'a', code: 'KeyA', charCode: 97 });
    expect(browser.runtime.sendMessage).not.toHaveBeenCalled();

    // Press Enter
    await fireEvent.keyPress(input, {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    });

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'BYPASS_SITE',
      payload: { domain: 'facebook.com' },
    });

    await vi.advanceTimersByTimeAsync(150);
    expect(replaceMock).toHaveBeenCalledWith('https://facebook.com/some/path');
  });

  it('navigates away when return to safety is clicked', async () => {
    const { getByText } = await mountAndSetup();

    await vi.advanceTimersByTimeAsync(15000);

    const returnBtn = getByText(/Return to Safety/i);
    await fireEvent.click(returnBtn);

    expect(closeMock).toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith('https://google.com');
  });

  it('hides bypass option and shows warning if target domain is missing', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/blocked.html',
        search: '',
        replace: replaceMock,
      },
      configurable: true,
      writable: true,
    });

    const { getByPlaceholderText, getByText, queryByText } =
      await mountAndSetup();

    // Let 15 seconds pass
    await vi.advanceTimersByTimeAsync(15000);

    // Verify warning is displayed
    expect(getByText(/This challenge cannot be bypassed/i)).toBeInTheDocument();

    const input = getByPlaceholderText(
      'Type the phrase to proceed...',
    ) as HTMLInputElement;

    // Type correct phrase
    await fireEvent.input(input, {
      target: { value: 'I choose to bypass my focus right now.' },
    });

    // Verify that bypass button is NOT shown
    expect(queryByText(/Bypass for 10 Mins/i)).not.toBeInTheDocument();
  });
});
