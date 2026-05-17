import type { Stats } from './types';

export function computeStreak(stats: Stats, currentDate: string): number {
  if (!stats.lastActiveDate) return 1;
  if (stats.lastActiveDate === currentDate) return stats.currentStreak;

  const lastDate = new Date(stats.lastActiveDate);
  const current = new Date(currentDate);

  // Calculate difference in days
  const diffTime = Math.abs(current.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return stats.currentStreak + 1;
  }

  return 1;
}

export function incrementPomodoro(stats: Stats, currentDate: string): Stats {
  const isSameDay = stats.lastActiveDate === currentDate;

  return {
    ...stats,
    dailyPomodoros: isSameDay ? stats.dailyPomodoros + 1 : 1,
    dailyTasksCompleted: isSameDay ? stats.dailyTasksCompleted : 0,
    allTimePomodoros: stats.allTimePomodoros + 1,
    currentStreak: computeStreak(stats, currentDate),
    lastActiveDate: currentDate,
  };
}

export function incrementTasksCompleted(
  stats: Stats,
  currentDate: string,
): Stats {
  const isSameDay = stats.lastActiveDate === currentDate;

  return {
    ...stats,
    dailyPomodoros: isSameDay ? stats.dailyPomodoros : 0,
    dailyTasksCompleted: isSameDay ? stats.dailyTasksCompleted + 1 : 1,
    currentStreak: computeStreak(stats, currentDate),
    lastActiveDate: currentDate,
  };
}
