import {
  handleMessage,
  handleAlarm,
  handleStorageChange,
  handleInstalled,
  handleStartup,
} from '../lib/background-logic';

export default defineBackground(() => {
  // Sync rules after browser restarts (DNR rules persist across SW restarts
  // but not across full browser restarts or extension reloads — those are
  // covered by onStartup and onInstalled respectively).
  browser.runtime.onStartup.addListener(() => {
    handleStartup().catch(console.error);
  });

  // Initialize storage if empty, and always re-sync DNR rules
  // (rules don't survive extension reload/update).
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
