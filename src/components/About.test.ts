import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import About from './About.svelte';

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      getManifest: () => ({
        version: '1.0.0',
      }),
    },
  },
}));

describe('About Component', () => {
  it('renders version and developer info', () => {
    const { getByText } = render(About);
    expect(getByText(/Version 1.0.0/)).toBeInTheDocument();
    expect(getByText('Jaskirat Anand')).toBeInTheDocument();
  });

  it('renders "How it works" divider label', () => {
    const { getByText } = render(About);
    expect(getByText('How it works')).toBeInTheDocument();
  });

  it('renders scroll hint on mount and toggles it on scroll', async () => {
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    document.body.appendChild(tabContent);

    const { getByText, queryByText } = render(About);
    expect(getByText('Scroll to explore')).toBeInTheDocument();

    // Trigger scroll > 10
    tabContent.scrollTop = 20;
    await fireEvent.scroll(tabContent);

    // Wait for fade out transition and removal from DOM
    await waitFor(() => {
      expect(queryByText('Scroll to explore')).not.toBeInTheDocument();
    });

    // Scroll back to top
    tabContent.scrollTop = 0;
    await fireEvent.scroll(tabContent);

    // Should reappear
    await waitFor(() => {
      expect(getByText('Scroll to explore')).toBeInTheDocument();
    });

    document.body.removeChild(tabContent);
  });

  it('renders all four accordion card titles', () => {
    const { getByText } = render(About);
    expect(getByText('What is Pomodoro?')).toBeInTheDocument();
    expect(getByText('Timer Modes')).toBeInTheDocument();
    expect(getByText('Task List')).toBeInTheDocument();
    expect(getByText('Focus Shield')).toBeInTheDocument();
  });

  it('cards are collapsed by default on mount', () => {
    const { getByText } = render(About);

    const pomodoroBtn = getByText('What is Pomodoro?').closest('button');
    const modesBtn = getByText('Timer Modes').closest('button');
    const tasksBtn = getByText('Task List').closest('button');
    const shieldBtn = getByText('Focus Shield').closest('button');

    expect(pomodoroBtn).toHaveAttribute('aria-expanded', 'false');
    expect(modesBtn).toHaveAttribute('aria-expanded', 'false');
    expect(tasksBtn).toHaveAttribute('aria-expanded', 'false');
    expect(shieldBtn).toHaveAttribute('aria-expanded', 'false');

    const pomodoroContent = document.getElementById('card-pomodoro-content');
    const modesContent = document.getElementById('card-modes-content');
    const tasksContent = document.getElementById('card-tasks-content');
    const shieldContent = document.getElementById('card-shield-content');

    expect(pomodoroContent).toHaveAttribute('aria-hidden', 'true');
    expect(modesContent).toHaveAttribute('aria-hidden', 'true');
    expect(tasksContent).toHaveAttribute('aria-hidden', 'true');
    expect(shieldContent).toHaveAttribute('aria-hidden', 'true');
  });

  it('toggles accordion content when clicking header', async () => {
    const { getByText } = render(About);

    const pomodoroBtn = getByText('What is Pomodoro?').closest('button')!;
    const pomodoroContent = document.getElementById('card-pomodoro-content')!;

    // Initial state: closed
    expect(pomodoroBtn).toHaveAttribute('aria-expanded', 'false');
    expect(pomodoroContent).toHaveAttribute('aria-hidden', 'true');

    // Click to expand
    await fireEvent.click(pomodoroBtn);
    expect(pomodoroBtn).toHaveAttribute('aria-expanded', 'true');
    expect(pomodoroContent).toHaveAttribute('aria-hidden', 'false');

    // Click to collapse again
    await fireEvent.click(pomodoroBtn);
    expect(pomodoroBtn).toHaveAttribute('aria-expanded', 'false');
    expect(pomodoroContent).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports independent card toggles without force-collapsing others', async () => {
    const { getByText } = render(About);

    const pomodoroBtn = getByText('What is Pomodoro?').closest('button')!;
    const modesBtn = getByText('Timer Modes').closest('button')!;
    const pomodoroContent = document.getElementById('card-pomodoro-content')!;
    const modesContent = document.getElementById('card-modes-content')!;

    // Open first card
    await fireEvent.click(pomodoroBtn);
    expect(pomodoroBtn).toHaveAttribute('aria-expanded', 'true');
    expect(pomodoroContent).toHaveAttribute('aria-hidden', 'false');
    expect(modesBtn).toHaveAttribute('aria-expanded', 'false');
    expect(modesContent).toHaveAttribute('aria-hidden', 'true');

    // Open second card
    await fireEvent.click(modesBtn);
    expect(pomodoroBtn).toHaveAttribute('aria-expanded', 'true');
    expect(pomodoroContent).toHaveAttribute('aria-hidden', 'false');
    expect(modesBtn).toHaveAttribute('aria-expanded', 'true');
    expect(modesContent).toHaveAttribute('aria-hidden', 'false');
  });

  it('has accessible buttons and decorative aria-hidden elements', () => {
    const { container } = render(About);

    const buttons = container.querySelectorAll('button[type="button"]');
    expect(buttons.length).toBe(4);

    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-controls');
      expect(btn).toHaveAttribute('aria-expanded');

      const svgs = btn.querySelectorAll('svg');
      svgs.forEach((svg) => {
        if (
          svg.getAttribute('aria-hidden') === 'true' ||
          svg.classList.contains('rotate-180')
        ) {
          expect(svg).toHaveAttribute('aria-hidden', 'true');
        }
      });
    });
  });
});
