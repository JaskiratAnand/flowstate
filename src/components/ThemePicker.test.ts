import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ThemePicker from './ThemePicker.svelte';
import type { UserPreferences } from '../lib/types';

describe('ThemePicker Component', () => {
  let initialPrefs: UserPreferences;
  let onUpdateMock: any;

  beforeEach(() => {
    initialPrefs = {
      theme: 'forest',
      colorScheme: 'system',
      fontFamily: 'karla',
      lastActiveTab: 'timer',
      moveHighPriorityToTop: true,
    };
    onUpdateMock = vi.fn();
  });

  it('enables the custom color picker and hides padlock overlay', () => {
    const { queryByText, container } = render(ThemePicker, {
      preferences: initialPrefs,
      onUpdate: onUpdateMock,
    });

    // Verify "Unlock Pro" tooltip/text is not present
    expect(queryByText('Unlock Pro')).not.toBeInTheDocument();

    // Custom color input should be enabled and clickable
    const colorInput = container.querySelector(
      '#custom-color-picker',
    ) as HTMLInputElement;
    expect(colorInput).toBeInTheDocument();
    expect(colorInput.disabled).toBe(false);
    expect(colorInput).toHaveClass('cursor-pointer');
  });

  it('enables all typography choices', () => {
    const { getByText, queryByText } = render(ThemePicker, {
      preferences: initialPrefs,
      onUpdate: onUpdateMock,
    });

    // All fonts should be enabled
    const sansBtn = getByText('Sans').closest('button');
    expect(sansBtn?.disabled).toBe(false);

    const serifBtn = getByText('Serif').closest('button');
    expect(serifBtn?.disabled).toBe(false);

    const monoBtn = getByText('Mono').closest('button');
    expect(monoBtn?.disabled).toBe(false);

    const sysBtn = getByText('Sys').closest('button');
    expect(sysBtn?.disabled).toBe(false);

    // Pro indicators should be hidden
    expect(queryByText('Pro')).not.toBeInTheDocument();
  });

  it('updates accent color and theme configuration on custom color input', async () => {
    const { container } = render(ThemePicker, {
      preferences: initialPrefs,
      onUpdate: onUpdateMock,
    });

    const colorInput = container.querySelector(
      '#custom-color-picker',
    ) as HTMLInputElement;
    await fireEvent.input(colorInput, { target: { value: '#ff00ff' } });

    expect(onUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'custom',
        customAccentColor: '#ff00ff',
      }),
    );
  });

  it('displays custom background color, checked border, and checkmark when custom theme is active', () => {
    initialPrefs.theme = 'custom';
    initialPrefs.customAccentColor = '#ff0055';

    const { container } = render(ThemePicker, {
      preferences: initialPrefs,
      onUpdate: onUpdateMock,
    });

    const label = container.querySelector(
      'label[for="custom-color-picker"]',
    ) as HTMLElement;
    expect(label).toBeInTheDocument();
    expect(label.style.backgroundColor).toBe('rgb(255, 0, 85)'); // HSL/hex converts to rgb in DOM query
    expect(label).toHaveClass('border-text-primary');

    // Check for checkmark icon (polyline points="20 6 9 17 4 12")
    const checkmark = label.querySelector('polyline');
    expect(checkmark).toBeInTheDocument();
  });

  it('renders the "Show Skip Button" toggle and calls onUpdate/setStorageItem on toggle', async () => {
    initialPrefs.showSkipButton = true;
    const { getByLabelText } = render(ThemePicker, {
      preferences: initialPrefs,
      onUpdate: onUpdateMock,
    });

    const toggle = getByLabelText('Toggle Show Skip Button');
    expect(toggle).toBeInTheDocument();

    await fireEvent.click(toggle);
    expect(onUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        showSkipButton: false,
      }),
    );
  });
});
