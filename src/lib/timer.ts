import type { TimerState, TimerConfig } from './types';

// Implement the minimal code to pass the first test
export function startTimer(state: TimerState, config: TimerConfig): TimerState {
  if (state.status !== 'idle' && state.status !== 'paused') return state;

  let remaining = state.remainingSeconds;
  if (state.status === 'idle' && remaining <= 0) {
    if (state.sessionType === 'short-break') {
      remaining = config.shortBreakDuration * 60;
    } else if (state.sessionType === 'long-break') {
      remaining = config.longBreakDuration * 60;
    } else {
      remaining = config.workDuration * 60;
    }
  }

  return {
    ...state,
    status: 'running',
    remainingSeconds: remaining,
  };
}

export function pauseTimer(state: TimerState): TimerState {
  if (state.status !== 'running') return state;

  return {
    ...state,
    status: 'paused',
  };
}

export function tickTimer(state: TimerState, config: TimerConfig): TimerState {
  if (state.status !== 'running') return state;

  if (state.remainingSeconds > 0) {
    return { ...state, remainingSeconds: state.remainingSeconds - 1 };
  }

  // Session complete
  if (state.sessionType === 'work') {
    const nextCompleted = state.completedSessions + 1;
    const isLongBreak = nextCompleted % 4 === 0;
    return {
      ...state,
      status: 'idle',
      sessionType: isLongBreak ? 'long-break' : 'short-break',
      completedSessions: nextCompleted,
      remainingSeconds: isLongBreak
        ? config.longBreakDuration * 60
        : config.shortBreakDuration * 60,
    };
  } else {
    // Break ends, go back to work
    return {
      ...state,
      status: 'idle',
      sessionType: 'work',
      remainingSeconds: config.workDuration * 60,
    };
  }
}

export function resetTimer(state: TimerState, config: TimerConfig): TimerState {
  let seconds = config.workDuration * 60;
  if (state.sessionType === 'short-break')
    seconds = config.shortBreakDuration * 60;
  if (state.sessionType === 'long-break')
    seconds = config.longBreakDuration * 60;

  return {
    ...state,
    status: 'idle',
    remainingSeconds: seconds,
  };
}

export function skipTimer(state: TimerState, config: TimerConfig): TimerState {
  if (state.sessionType === 'work') {
    const nextIndexForBreak = state.completedSessions + 1;
    const isLongBreak = nextIndexForBreak % 4 === 0;
    const sessionType = isLongBreak ? 'long-break' : 'short-break';
    const remainingSeconds = isLongBreak
      ? config.longBreakDuration * 60
      : config.shortBreakDuration * 60;
    return {
      ...state,
      status: 'idle',
      sessionType,
      remainingSeconds,
      expectedEndTime: undefined,
    };
  } else {
    return {
      ...state,
      status: 'idle',
      sessionType: 'work',
      remainingSeconds: config.workDuration * 60,
      expectedEndTime: undefined,
    };
  }
}
