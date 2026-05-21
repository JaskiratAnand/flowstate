import { browser } from 'wxt/browser';
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
import { generateDynamicRules, getCleanDomain } from './blocking';

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
    case 'BYPASS_SITE':
      await handleBypassSite(message.payload?.domain || message.payload);
      break;
  }
}

export async function handleStorageChange(changes: Record<string, any>) {
  if (changes[STORAGE_KEYS.TIMER_CONFIG]) {
    await engine.syncWithConfig();
  }
  if (
    changes[STORAGE_KEYS.BLOCKING_CONFIG] ||
    changes[STORAGE_KEYS.BYPASS_LIST] ||
    changes[STORAGE_KEYS.TIMER_STATE]
  ) {
    await syncBlockingRules();
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
  } else if (alarm.name === 'check-bypass-expiry') {
    await checkAndCleanBypasses();
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

export async function handleInstalled() {
  const existingConfig = await getStorageItem('TIMER_CONFIG');
  if (!existingConfig) {
    await setStorageItem('TIMER_CONFIG', {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
    });
  }

  const existingState = await getStorageItem('TIMER_STATE');
  if (!existingState) {
    await setStorageItem('TIMER_STATE', {
      status: 'idle',
      remainingSeconds: 25 * 60,
      sessionType: 'work',
      completedSessions: 0,
    });
  }

  const existingStats = await getStorageItem('STATS');
  if (!existingStats) {
    await setStorageItem('STATS', {
      dailyPomodoros: 0,
      dailyTasksCompleted: 0,
      currentStreak: 0,
      allTimePomodoros: 0,
      lastActiveDate: '',
    });
  }

  const existingPrefs = await getStorageItem('USER_PREFERENCES');
  if (!existingPrefs) {
    await setStorageItem('USER_PREFERENCES', {
      theme: 'forest',
      colorScheme: 'system',
      fontFamily: 'karla',
      lastActiveTab: 'timer',
      moveHighPriorityToTop: true,
    });
  } else if (existingPrefs.moveHighPriorityToTop === undefined) {
    existingPrefs.moveHighPriorityToTop = true;
    await setStorageItem('USER_PREFERENCES', existingPrefs);
  }

  const existingBlockingConfig = await getStorageItem('BLOCKING_CONFIG');
  if (!existingBlockingConfig) {
    await setStorageItem('BLOCKING_CONFIG', {
      enabled: true,
      mode: 'blocklist',
      strictMode: false,
      bypassDuration: 5,
      blockedSites: [
        'youtube.com',
        'twitter.com',
        'x.com',
        'reddit.com',
        'instagram.com',
        'facebook.com',
      ],
      allowedSites: [],
    });
  }

  const existingBypassList = await getStorageItem('BYPASS_LIST');
  if (!existingBypassList) {
    await setStorageItem('BYPASS_LIST', []);
  }

  // Schedule midnight archive alarm
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0);
  browser.alarms.create('midnight-archive', {
    when: nextMidnight.getTime(),
    periodInMinutes: 24 * 60,
  });

  // Schedule check-bypass-expiry alarm
  browser.alarms.create('check-bypass-expiry', {
    periodInMinutes: 1,
  });

  // Always sync DNR rules — they don't survive extension reloads
  await syncBlockingRules();
}

export async function handleStartup() {
  await syncBlockingRules();
}

export async function syncBlockingRules() {
  const config = await getStorageItem('BLOCKING_CONFIG');
  const timerState = await getStorageItem('TIMER_STATE');
  const bypassList = (await getStorageItem('BYPASS_LIST')) || [];

  if (!config || !timerState) {
    return;
  }

  const newRules = generateDynamicRules(config, timerState, bypassList);

  if (browser.declarativeNetRequest) {
    const existingRules = await browser.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map((rule) => rule.id);

    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: newRules,
    });
  }
}

export async function handleBypassSite(domain: string) {
  if (!domain) return;
  const config = await getStorageItem('BLOCKING_CONFIG');
  const bypassDuration = config?.bypassDuration || 5; // default 5 mins
  const expiresAt = Date.now() + bypassDuration * 60 * 1000;

  const bypassList = (await getStorageItem('BYPASS_LIST')) || [];
  const cleanDomain = getCleanDomain(domain);

  // Filter out existing bypasses for the same domain
  const updatedBypassList = bypassList.filter(
    (item) => getCleanDomain(item.domain) !== cleanDomain,
  );

  updatedBypassList.push({
    domain: cleanDomain,
    expiresAt,
  });

  await setStorageItem('BYPASS_LIST', updatedBypassList);
}

export async function checkAndCleanBypasses() {
  const bypassList = await getStorageItem('BYPASS_LIST');
  if (!bypassList || bypassList.length === 0) return;

  const now = Date.now();
  const activeBypasses = bypassList.filter((item) => item.expiresAt > now);

  if (activeBypasses.length !== bypassList.length) {
    await setStorageItem('BYPASS_LIST', activeBypasses);
  }
}
