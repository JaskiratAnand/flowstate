import { handleMessage, handleAlarm } from '../lib/background-logic';
import { getStorageItem, setStorageItem } from '../lib/storage';

export default defineBackground(() => {
  // Initialize storage if empty
  browser.runtime.onInstalled.addListener(async () => {
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
        theme: 'ocean',
        darkMode: false,
        lastActiveTab: 'timer',
      });
    }

    // Schedule midnight archive alarm
    // We set it to run every 24 hours, starting at next midnight
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    browser.alarms.create('midnight-archive', {
      when: nextMidnight.getTime(),
      periodInMinutes: 24 * 60,
    });
  });

  browser.runtime.onMessage.addListener((message) => {
    handleMessage(message);
    return true; // Keep channel open if needed
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    handleAlarm(alarm);
  });
});
