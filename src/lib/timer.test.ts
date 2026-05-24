import { describe, it, expect } from 'vitest';
import {
  startTimer,
  pauseTimer,
  tickTimer,
  resetTimer,
  skipTimer,
} from './timer';
import type { TimerState, TimerConfig } from './types';

describe('Timer Logic', () => {
  const config: TimerConfig = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  };

  it('starts a work session from idle with remainingSeconds = 0 using config', () => {
    const initialState: TimerState = {
      status: 'idle',
      remainingSeconds: 0,
      sessionType: 'work',
      completedSessions: 0,
    };

    const nextState = startTimer(initialState, config);

    expect(nextState.status).toBe('running');
    expect(nextState.remainingSeconds).toBe(config.workDuration * 60);
  });

  it('starts a short-break session from idle with remainingSeconds = 0 using config', () => {
    const initialState: TimerState = {
      status: 'idle',
      remainingSeconds: 0,
      sessionType: 'short-break',
      completedSessions: 0,
    };

    const nextState = startTimer(initialState, config);

    expect(nextState.status).toBe('running');
    expect(nextState.remainingSeconds).toBe(config.shortBreakDuration * 60);
  });

  it('starts a long-break session from idle with remainingSeconds = 0 using config', () => {
    const initialState: TimerState = {
      status: 'idle',
      remainingSeconds: 0,
      sessionType: 'long-break',
      completedSessions: 0,
    };

    const nextState = startTimer(initialState, config);

    expect(nextState.status).toBe('running');
    expect(nextState.remainingSeconds).toBe(config.longBreakDuration * 60);
  });

  it('preserves preloaded remaining duration when starting from idle state if remainingSeconds > 0', () => {
    const initialState: TimerState = {
      status: 'idle',
      remainingSeconds: 120, // preloaded (e.g. 2 minutes)
      sessionType: 'short-break',
      completedSessions: 0,
    };

    const nextState = startTimer(initialState, config);

    expect(nextState.status).toBe('running');
    expect(nextState.remainingSeconds).toBe(120);
  });

  it('transitions from running to paused without changing remaining seconds', () => {
    const runningState: TimerState = {
      status: 'running',
      remainingSeconds: 1500,
      sessionType: 'work',
      completedSessions: 0,
    };

    const nextState = pauseTimer(runningState);

    expect(nextState.status).toBe('paused');
    expect(nextState.remainingSeconds).toBe(1500);
  });

  it('decrements remainingSeconds when tickTimer is called on a running timer', () => {
    const runningState: TimerState = {
      status: 'running',
      remainingSeconds: 1500,
      sessionType: 'work',
      completedSessions: 0,
    };

    const nextState = tickTimer(runningState, config);

    expect(nextState.remainingSeconds).toBe(1499);
  });

  it('completes a work session, increments count, and suggests short break', () => {
    const endingState: TimerState = {
      status: 'running',
      remainingSeconds: 0,
      sessionType: 'work',
      completedSessions: 0,
    };

    const nextState = tickTimer(endingState, config);

    expect(nextState.status).toBe('idle');
    expect(nextState.sessionType).toBe('short-break');
    expect(nextState.completedSessions).toBe(1);
    expect(nextState.remainingSeconds).toBe(5 * 60);
  });

  it('suggests a long break after 4 work sessions', () => {
    const endingState: TimerState = {
      status: 'running',
      remainingSeconds: 0,
      sessionType: 'work',
      completedSessions: 3,
    };

    const nextState = tickTimer(endingState, config);

    expect(nextState.status).toBe('idle');
    expect(nextState.sessionType).toBe('long-break');
    expect(nextState.completedSessions).toBe(4);
    expect(nextState.remainingSeconds).toBe(15 * 60);
  });

  it('transitions from break to work when break ends', () => {
    const endingState: TimerState = {
      status: 'running',
      remainingSeconds: 0,
      sessionType: 'short-break',
      completedSessions: 1,
    };

    const nextState = tickTimer(endingState, config);

    expect(nextState.status).toBe('idle');
    expect(nextState.sessionType).toBe('work');
    expect(nextState.remainingSeconds).toBe(25 * 60);
    expect(nextState.completedSessions).toBe(1); // doesn't increment on break
  });

  it('resets timer to idle with full duration for current session type', () => {
    const pausedState: TimerState = {
      status: 'paused',
      remainingSeconds: 100,
      sessionType: 'work',
      completedSessions: 2,
    };

    const nextState = resetTimer(pausedState, config);

    expect(nextState.status).toBe('idle');
    expect(nextState.remainingSeconds).toBe(25 * 60);
    expect(nextState.sessionType).toBe('work');
    expect(nextState.completedSessions).toBe(2);
  });

  describe('skipTimer', () => {
    it('skips a work session, transitions to short-break, and does NOT increment completedSessions', () => {
      const state: TimerState = {
        status: 'running',
        remainingSeconds: 1000,
        sessionType: 'work',
        completedSessions: 0,
      };

      const nextState = skipTimer(state, config);

      expect(nextState.status).toBe('idle');
      expect(nextState.sessionType).toBe('short-break');
      expect(nextState.completedSessions).toBe(0);
      expect(nextState.remainingSeconds).toBe(5 * 60);
    });

    it('skips a work session when completedSessions = 3, transitioning to long-break', () => {
      const state: TimerState = {
        status: 'running',
        remainingSeconds: 500,
        sessionType: 'work',
        completedSessions: 3,
      };

      const nextState = skipTimer(state, config);

      expect(nextState.status).toBe('idle');
      expect(nextState.sessionType).toBe('long-break');
      expect(nextState.completedSessions).toBe(3);
      expect(nextState.remainingSeconds).toBe(15 * 60);
    });

    it('skips a short-break session and transitions back to work', () => {
      const state: TimerState = {
        status: 'running',
        remainingSeconds: 200,
        sessionType: 'short-break',
        completedSessions: 1,
      };

      const nextState = skipTimer(state, config);

      expect(nextState.status).toBe('idle');
      expect(nextState.sessionType).toBe('work');
      expect(nextState.completedSessions).toBe(1);
      expect(nextState.remainingSeconds).toBe(25 * 60);
    });

    it('skips a long-break session and transitions back to work', () => {
      const state: TimerState = {
        status: 'running',
        remainingSeconds: 500,
        sessionType: 'long-break',
        completedSessions: 4,
      };

      const nextState = skipTimer(state, config);

      expect(nextState.status).toBe('idle');
      expect(nextState.sessionType).toBe('work');
      expect(nextState.completedSessions).toBe(4);
      expect(nextState.remainingSeconds).toBe(25 * 60);
    });
  });
});
