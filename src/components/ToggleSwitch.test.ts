import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ToggleSwitch from './ToggleSwitch.svelte';

describe('ToggleSwitch Component', () => {
  it('renders correctly with checked status and calls onchange on click', async () => {
    const onchangeMock = vi.fn();
    const { container } = render(ToggleSwitch, {
      checked: false,
      onchange: onchangeMock,
      'aria-label': 'Test Toggle',
    });

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Test Toggle');
    expect(button).not.toHaveClass('bg-accent/20');

    const knob = container.querySelector('button > div');
    expect(knob).toHaveClass('translate-x-0');

    await fireEvent.click(button!);
    expect(onchangeMock).toHaveBeenCalledWith(true);
  });

  it('displays checked state correctly', () => {
    const { container } = render(ToggleSwitch, {
      checked: true,
      onchange: () => {},
    });

    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-accent/20');

    const knob = container.querySelector('button > div');
    expect(knob).toHaveClass('translate-x-5.5');
  });

  it('respects disabled prop', async () => {
    const onchangeMock = vi.fn();
    const { container } = render(ToggleSwitch, {
      checked: false,
      onchange: onchangeMock,
      disabled: true,
    });

    const button = container.querySelector('button');
    expect(button).toBeDisabled();

    await fireEvent.click(button!);
    expect(onchangeMock).not.toHaveBeenCalled();
  });
});
