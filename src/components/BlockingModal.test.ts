import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import BlockingModal from './BlockingModal.svelte';
import { browser } from 'wxt/browser';

// Mock storage
const mockStorage: Record<string, any> = {};

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
  },
}));

describe('BlockingModal Component', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const defaultConfig = {
    enabled: true,
    mode: 'blocklist',
    strictMode: false,
    bypassDuration: 5,
    blockedSites: ['youtube.com', 'twitter.com'],
    allowedSites: ['wikipedia.org'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock storage
    mockStorage['blocking_config'] = { ...defaultConfig };
  });

  it('loads configuration from storage on render', async () => {
    const onClose = vi.fn();
    const { getByText, getByDisplayValue } = render(BlockingModal, { onClose });

    // Wait for onMount storage loading
    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalledWith('blocking_config');
    });

    expect(getByText('Focus Shield')).toBeInTheDocument();

    // Check if defaults are displayed
    const select = getByDisplayValue('5 Minutes') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
  });

  it('toggles Blocker enabled state and updates storage', async () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(BlockingModal, { onClose });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalled();
    });

    const toggle = getByLabelText('Toggle Block Distractions');
    await fireEvent.click(toggle);

    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        blocking_config: expect.objectContaining({
          enabled: false,
        }),
      }),
    );
  });

  it('toggles Strict Mode and updates storage', async () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(BlockingModal, { onClose });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalled();
    });

    const toggle = getByLabelText('Toggle Strict Mode');
    await fireEvent.click(toggle);

    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        blocking_config: expect.objectContaining({
          strictMode: true,
        }),
      }),
    );
  });

  it('updates bypass duration and updates storage', async () => {
    const onClose = vi.fn();
    const { getByDisplayValue } = render(BlockingModal, { onClose });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalled();
    });

    const select = getByDisplayValue('5 Minutes') as HTMLSelectElement;
    await fireEvent.change(select, { target: { value: '15' } });

    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        blocking_config: expect.objectContaining({
          bypassDuration: 15,
        }),
      }),
    );
  });

  it('switches tabs between Blocklist and Allowlist when PRO', async () => {
    vi.stubEnv('WXT_PRO_VERSION', 'true');
    const onClose = vi.fn();
    const { getByText, queryByText } = render(BlockingModal, { onClose });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalled();
    });

    // Currently showing blocklist items
    expect(getByText('youtube.com')).toBeInTheDocument();
    expect(queryByText('wikipedia.org')).not.toBeInTheDocument();

    const allowlistTab = getByText('Allowlist');
    await fireEvent.click(allowlistTab);

    // Should switch mode and show allowlist items
    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        blocking_config: expect.objectContaining({
          mode: 'allowlist',
        }),
      }),
    );
    expect(getByText('wikipedia.org')).toBeInTheDocument();
    expect(queryByText('youtube.com')).not.toBeInTheDocument();
  });

  describe('Non-Pro Restrictions', () => {
    it('gracefully degrades to blocklist if allowlist was configured', async () => {
      vi.stubEnv('WXT_PRO_VERSION', 'false');
      mockStorage['blocking_config'] = { ...defaultConfig, mode: 'allowlist' };
      const onClose = vi.fn();
      render(BlockingModal, { onClose });

      await waitFor(() => {
        expect(browser.storage.local.get).toHaveBeenCalled();
        expect(browser.storage.local.set).toHaveBeenCalledWith(
          expect.objectContaining({
            blocking_config: expect.objectContaining({
              mode: 'blocklist',
            }),
          }),
        );
      });
    });

    it('disables Allowlist tab and shows Unlock Pro tooltip', async () => {
      vi.stubEnv('WXT_PRO_VERSION', 'false');
      const onClose = vi.fn();
      const { getByText, getByRole } = render(BlockingModal, { onClose });

      await waitFor(() => {
        expect(browser.storage.local.get).toHaveBeenCalled();
      });

      const allowlistTab = getByRole('button', { name: 'Allowlist' });
      expect(allowlistTab).toBeDisabled();

      // Tooltip
      expect(getByText('Unlock Pro')).toBeInTheDocument();
    });
  });

  it('shows error validation for invalid domain input', async () => {
    const onClose = vi.fn();
    const { getByPlaceholderText, getByText } = render(BlockingModal, {
      onClose,
    });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalled();
    });

    const input = getByPlaceholderText('Add site to block (e.g. facebook.com)');
    const addButton = getByText('Add');

    await fireEvent.input(input, { target: { value: 'invalid_domain' } });
    await fireEvent.click(addButton);

    expect(getByText('Please enter a valid domain name.')).toBeInTheDocument();
  });

  it('successfully adds valid domain to list and clears input', async () => {
    const onClose = vi.fn();
    const { getByPlaceholderText, getByText } = render(BlockingModal, {
      onClose,
    });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalled();
    });

    const input = getByPlaceholderText(
      'Add site to block (e.g. facebook.com)',
    ) as HTMLInputElement;
    const addButton = getByText('Add');

    await fireEvent.input(input, {
      target: { value: 'https://instagram.com/p/123' },
    });
    await fireEvent.click(addButton);

    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        blocking_config: expect.objectContaining({
          blockedSites: expect.arrayContaining([
            'youtube.com',
            'twitter.com',
            'instagram.com',
          ]),
        }),
      }),
    );

    expect(input.value).toBe('');
    expect(getByText('instagram.com')).toBeInTheDocument();
  });

  it('shows error when adding a duplicate domain', async () => {
    const onClose = vi.fn();
    const { getByPlaceholderText, getByText } = render(BlockingModal, {
      onClose,
    });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalled();
    });

    const input = getByPlaceholderText('Add site to block (e.g. facebook.com)');
    const addButton = getByText('Add');

    await fireEvent.input(input, { target: { value: 'youtube.com' } });
    await fireEvent.click(addButton);

    expect(getByText('Domain is already in the list.')).toBeInTheDocument();
  });

  it('removes a site from the list', async () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(BlockingModal, { onClose });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalled();
    });

    const removeBtn = getByLabelText('Remove youtube.com');
    await fireEvent.click(removeBtn);

    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        blocking_config: expect.objectContaining({
          blockedSites: ['twitter.com'],
        }),
      }),
    );
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(BlockingModal, { onClose });

    await waitFor(() => {
      expect(browser.storage.local.get).toHaveBeenCalled();
    });

    const closeBtn = getByLabelText('Close settings');
    await fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
