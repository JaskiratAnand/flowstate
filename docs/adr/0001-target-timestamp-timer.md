# Target Timestamp-based Background Timer

We decided to calculate and store the absolute target end timestamp (`expectedEndTime`) in extension storage when starting a Focus Session or Break Session, and schedule a single Chrome alarm targeting that timestamp (`browser.alarms.create({ when: expectedEndTime })`). When the popup is open, it reads this timestamp and runs a local `setInterval` to update the visual countdown display.

This is because Chrome Manifest V3 background service workers are ephemeral and clamp standard recurring alarms to a minimum of 1 minute (or 30 seconds for unpacked extensions). Ticking iterative state updates every second in a background service worker leads to significant drift, high CPU usage, and background worker termination.
