import {
  handleMessage,
  handleAlarm,
  handleStorageChange,
  handleInstalled,
} from '../lib/background-logic';

export default defineBackground(() => {
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
