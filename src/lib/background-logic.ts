import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storage';
import { archiveCompletedTasks, carryOverIncompleteTasks } from './archive';
import { incrementPomodoro } from './stats';
import type { ActionMessage } from './types';
import { TimerEngineImpl } from './timer-engine';
import {
  WxtStorageAdapter,
  WxtAlarmAdapter,
  WxtFeedbackAdapter,
} from './wxt-adapters';

const engine = new TimerEngineImpl(
  new WxtStorageAdapter(),
  new WxtAlarmAdapter(),
  new WxtFeedbackAdapter(),
);

export async function handleMessage(message: ActionMessage) {
  switch (message.type) {
    case 'START_TIMER':
      await engine.execute('START');
      break;
    case 'PAUSE_TIMER':
      await engine.execute('PAUSE');
      break;
    case 'RESET_TIMER':
      await engine.execute('RESET');
      break;
    case 'SKIP_SESSION':
      await engine.execute('SKIP');
      break;
  }
}

export async function handleStorageChange(changes: Record<string, any>) {
  if (changes[STORAGE_KEYS.TIMER_CONFIG]) {
    await engine.syncWithConfig();
  }
}

export async function handleAlarm(alarm: { name: string }) {
  if (alarm.name === 'pomodoro-tick') {
    const stateBefore = await getStorageItem('TIMER_STATE');
    await engine.tick();

    // Handle stats on work session completion
    if (
      stateBefore?.status === 'running' &&
      stateBefore.remainingSeconds === 0 &&
      stateBefore.sessionType === 'work'
    ) {
      const stats = await getStorageItem('STATS');
      if (stats) {
        const date = new Date().toISOString().split('T')[0];
        const nextStats = incrementPomodoro(stats, date);
        await setStorageItem('STATS', nextStats);
      }
    }
  } else if (alarm.name === 'midnight-archive') {
    await handleMidnightArchive();
  }
}

export async function handleMidnightArchive() {
  const tasks = await getStorageItem('TASKS');
  if (!tasks) return;

  const archivedTasks = archiveCompletedTasks(tasks);
  const carryOverTasks = carryOverIncompleteTasks(tasks);

  const dateKey = new Date().toISOString().split('T')[0];
  const archive = (await getStorageItem('DAILY_ARCHIVE')) || {};
  archive[dateKey] = archivedTasks;

  await setStorageItem('TASKS', carryOverTasks);
  await setStorageItem('DAILY_ARCHIVE', archive);
}
