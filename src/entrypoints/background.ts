import {
  handleMessage,
  handleAlarm,
  handleStorageChange,
  handleInstalled,
  handleStartup,
  syncBlockingRules,
} from '../lib/background-logic';

export default defineBackground(() => {
  // Re-sync DNR rules on every SW wake-up (runs before any event listeners)
  syncBlockingRules().catch(console.error);

  // Belt-and-suspenders: also sync on explicit browser startup
  browser.runtime.onStartup.addListener(() => {
    handleStartup().catch(console.error);
  });

  // Initialize storage if empty
  browser.runtime.onInstalled.addListener(async () => {
    await handleInstalled();
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message)
      .then(() => {
        sendResponse();
      })
      .catch(console.error);
    return true; // Keep channel open if needed
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    handleAlarm(alarm);
  });

  browser.storage.local.onChanged.addListener((changes) => {
    handleStorageChange(changes);
  });
});
