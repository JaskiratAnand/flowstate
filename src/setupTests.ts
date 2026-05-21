import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof Element.prototype.animate === 'undefined') {
  Element.prototype.animate = vi.fn().mockImplementation(() => ({
    finished: Promise.resolve(),
    play: vi.fn(),
    pause: vi.fn(),
    cancel: vi.fn(),
    reverse: vi.fn(),
    commitStyles: vi.fn(),
    effect: null,
    currentTime: 0,
    playbackRate: 1,
    onfinish: null,
    oncancel: null,
    onremove: null,
    ready: Promise.resolve(),
  }));
}

vi.mock('svelte/transition', () => {
  const noopTransition = () => ({
    duration: 0,
    tick: () => {},
  });

  return {
    fade: noopTransition,
    fly: noopTransition,
    slide: noopTransition,
    scale: noopTransition,
    draw: noopTransition,
    crossfade: noopTransition,
  };
});
