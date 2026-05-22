import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

  afterEach(() => {
    // Reset env variable to prevent test pollution
    import.meta.env.WXT_PRO_VERSION = undefined;
  });

  describe('Free version (WXT_PRO_VERSION !== "true")', () => {
    beforeEach(() => {
      import.meta.env.WXT_PRO_VERSION = 'false';
    });

    it('disables the custom color picker and shows Unlock Pro overlay', () => {
      const { queryByText, container } = render(ThemePicker, {
        preferences: initialPrefs,
        onUpdate: onUpdateMock,
      });

      // Verify "Unlock Pro" tooltip/text exists
      expect(queryByText('Unlock Pro')).toBeInTheDocument();

      // Custom color input should be disabled
      const colorInput = container.querySelector(
        '#custom-color-pro',
      ) as HTMLInputElement;
      expect(colorInput).toBeInTheDocument();
      expect(colorInput.disabled).toBe(true);
      expect(colorInput).toHaveClass('cursor-not-allowed');
    });

    it('disables premium typography choices and displays Pro labels', () => {
      const { getByText } = render(ThemePicker, {
        preferences: initialPrefs,
        onUpdate: onUpdateMock,
      });

      // Karla (Sans) is enabled
      const sansBtn = getByText('Sans').closest('button');
      expect(sansBtn).toBeInTheDocument();
      expect(sansBtn?.disabled).toBe(false);

      // Premium fonts should be disabled and have "Pro" badge
      const serifBtn = getByText('Serif').closest('button');
      expect(serifBtn?.disabled).toBe(true);
      expect(serifBtn).toHaveClass('opacity-40');
      expect(serifBtn).toHaveClass('cursor-not-allowed');

      const monoBtn = getByText('Mono').closest('button');
      expect(monoBtn?.disabled).toBe(true);

      const sysBtn = getByText('Sys').closest('button');
      expect(sysBtn?.disabled).toBe(true);
    });
  });

  describe('Pro version (WXT_PRO_VERSION === "true")', () => {
    beforeEach(() => {
      import.meta.env.WXT_PRO_VERSION = 'true';
    });

    it('enables the custom color picker and hides padlock overlay', () => {
      const { queryByText, container } = render(ThemePicker, {
        preferences: initialPrefs,
        onUpdate: onUpdateMock,
      });

      // Verify "Unlock Pro" tooltip/text is hidden
      expect(queryByText('Unlock Pro')).not.toBeInTheDocument();

      // Custom color input should be enabled and clickable
      const colorInput = container.querySelector(
        '#custom-color-pro',
      ) as HTMLInputElement;
      expect(colorInput).toBeInTheDocument();
      expect(colorInput.disabled).toBe(false);
      expect(colorInput).toHaveClass('cursor-pointer');
    });

    it('enables premium typography choices and hides Pro labels', () => {
      const { getByText, queryByText } = render(ThemePicker, {
        preferences: initialPrefs,
        onUpdate: onUpdateMock,
      });

      // Premium fonts should be enabled
      const serifBtn = getByText('Serif').closest('button');
      expect(serifBtn?.disabled).toBe(false);
      expect(serifBtn).not.toHaveClass('opacity-40');
      expect(serifBtn).not.toHaveClass('cursor-not-allowed');

      const monoBtn = getByText('Mono').closest('button');
      expect(monoBtn?.disabled).toBe(false);

      const sysBtn = getByText('Sys').closest('button');
      expect(sysBtn?.disabled).toBe(false);

      // Pro indicators should be hidden
      const proLabels = queryByText('Pro');
      expect(proLabels).not.toBeInTheDocument();
    });

    it('updates accent color and theme configuration on custom color input', async () => {
      const { container } = render(ThemePicker, {
        preferences: initialPrefs,
        onUpdate: onUpdateMock,
      });

      const colorInput = container.querySelector(
        '#custom-color-pro',
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
        'label[for="custom-color-pro"]',
      ) as HTMLElement;
      expect(label).toBeInTheDocument();
      expect(label.style.backgroundColor).toBe('rgb(255, 0, 85)'); // HSL/hex converts to rgb in DOM query
      expect(label).toHaveClass('border-text-primary');

      // Check for checkmark icon (polyline points="20 6 9 17 4 12")
      const checkmark = label.querySelector('polyline');
      expect(checkmark).toBeInTheDocument();
    });
  });
});
