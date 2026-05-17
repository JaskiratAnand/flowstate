import { browser } from 'wxt/browser';
import { getStorageItem, setStorageItem } from './storage';
import { startTimer, pauseTimer, tickTimer, resetTimer } from './timer';
import { archiveCompletedTasks, carryOverIncompleteTasks } from './archive';
import { incrementPomodoro } from './stats';
import type { ActionMessage, TimerState } from './types';

export async function handleMessage(message: ActionMessage) {
  const state = await getStorageItem('TIMER_STATE');
  const config = await getStorageItem('TIMER_CONFIG');

  if (!state || !config) return;

  let nextState: TimerState = state;

  switch (message.type) {
    case 'START_TIMER':
      nextState = startTimer(state, config);
      await browser.alarms.create('pomodoro-tick', { periodInMinutes: 1 / 60 });
      break;
    case 'PAUSE_TIMER':
      nextState = pauseTimer(state);
      await browser.alarms.clear('pomodoro-tick');
      break;
    case 'RESET_TIMER':
      nextState = resetTimer(state, config);
      await browser.alarms.clear('pomodoro-tick');
      break;
    case 'SKIP_SESSION':
      // Force end current session
      const endState = { ...state, remainingSeconds: 0 };
      nextState = tickTimer(endState, config);
      await browser.alarms.clear('pomodoro-tick');
      break;
  }

  await setStorageItem('TIMER_STATE', nextState);
}

async function playSound() {
  const OFFSCREEN_PATH = '/offscreen.html';

  try {
    // @ts-ignore
    const contexts = (await (browser.runtime as any).getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
    })) as any[];

    if (contexts.length === 0) {
      await (browser as any).offscreen.createDocument({
        url: browser.runtime.getURL(OFFSCREEN_PATH),
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play notification sound when timer ends',
      });
    }
  } catch {
    // Fallback if getContexts is not supported or document creation fails
    try {
      await (browser as any).offscreen.createDocument({
        url: browser.runtime.getURL(OFFSCREEN_PATH),
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play notification sound when timer ends',
      });
    } catch {
      // Ignore if already exists
    }
  }

  // Trigger the programmatic chime
  await browser.runtime.sendMessage({
    type: 'PLAY_SOUND',
  });
}

export async function handleAlarm(alarm: { name: string }) {
  if (alarm.name === 'pomodoro-tick') {
    const state = await getStorageItem('TIMER_STATE');
    const config = await getStorageItem('TIMER_CONFIG');

    if (!state || !config || state.status !== 'running') return;

    const nextState = tickTimer(state, config);

    if (state.remainingSeconds === 0) {
      // Session finished
      await browser.alarms.clear('pomodoro-tick');

      // Play sound
      playSound().catch((err) => console.error('Audio playback failed:', err));

      if (state.sessionType === 'work') {
        const stats = await getStorageItem('STATS');
        if (stats) {
          const date = new Date().toISOString().split('T')[0];
          const nextStats = incrementPomodoro(stats, date);
          await setStorageItem('STATS', nextStats);
        }
      }

      await browser.notifications.create({
        type: 'basic',
        iconUrl: '/icon/128.png',
        title:
          state.sessionType === 'work'
            ? 'Work Session Complete!'
            : 'Break Over!',
        message:
          state.sessionType === 'work'
            ? 'Time for a break.'
            : 'Time to get back to work.',
      });
    }

    await setStorageItem('TIMER_STATE', nextState);
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
