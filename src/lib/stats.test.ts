import { describe, it, expect } from 'vitest';
import { incrementPomodoro, incrementTasksCompleted } from './stats';
import type { Stats } from './types';

describe('Stats Logic', () => {
  const getInitialStats = (): Stats => ({
    dailyPomodoros: 0,
    dailyTasksCompleted: 0,
    currentStreak: 0,
    allTimePomodoros: 0,
    lastActiveDate: '',
  });

  it('increments pomodoros and starts a streak for the first session', () => {
    const stats = getInitialStats();
    const date = '2023-10-01';

    const nextStats = incrementPomodoro(stats, date);

    expect(nextStats.dailyPomodoros).toBe(1);
    expect(nextStats.allTimePomodoros).toBe(1);
    expect(nextStats.currentStreak).toBe(1);
    expect(nextStats.lastActiveDate).toBe('2023-10-01');
  });

  it('increments pomodoros without increasing streak if on the same day', () => {
    const stats: Stats = {
      ...getInitialStats(),
      dailyPomodoros: 1,
      allTimePomodoros: 1,
      currentStreak: 1,
      lastActiveDate: '2023-10-01',
    };
    const date = '2023-10-01';

    const nextStats = incrementPomodoro(stats, date);

    expect(nextStats.dailyPomodoros).toBe(2);
    expect(nextStats.allTimePomodoros).toBe(2);
    expect(nextStats.currentStreak).toBe(1);
    expect(nextStats.lastActiveDate).toBe('2023-10-01');
  });

  it('increases streak if active on consecutive days, resets daily counters', () => {
    const stats: Stats = {
      ...getInitialStats(),
      dailyPomodoros: 2,
      dailyTasksCompleted: 5,
      allTimePomodoros: 10,
      currentStreak: 3,
      lastActiveDate: '2023-10-01',
    };
    const date = '2023-10-02';

    const nextStats = incrementPomodoro(stats, date);

    expect(nextStats.dailyPomodoros).toBe(1);
    expect(nextStats.dailyTasksCompleted).toBe(0);
    expect(nextStats.allTimePomodoros).toBe(11);
    expect(nextStats.currentStreak).toBe(4);
    expect(nextStats.lastActiveDate).toBe('2023-10-02');
  });

  it('resets streak if a day is missed', () => {
    const stats: Stats = {
      ...getInitialStats(),
      dailyPomodoros: 2,
      allTimePomodoros: 10,
      currentStreak: 3,
      lastActiveDate: '2023-10-01',
    };
    const date = '2023-10-03';

    const nextStats = incrementPomodoro(stats, date);

    expect(nextStats.dailyPomodoros).toBe(1);
    expect(nextStats.allTimePomodoros).toBe(11);
    expect(nextStats.currentStreak).toBe(1);
    expect(nextStats.lastActiveDate).toBe('2023-10-03');
  });

  it('increments daily tasks completed', () => {
    const stats: Stats = {
      ...getInitialStats(),
      dailyTasksCompleted: 2,
      lastActiveDate: '2023-10-01',
    };
    const date = '2023-10-01';

    const nextStats = incrementTasksCompleted(stats, date);

    expect(nextStats.dailyTasksCompleted).toBe(3);
    expect(nextStats.lastActiveDate).toBe('2023-10-01');
  });
});
