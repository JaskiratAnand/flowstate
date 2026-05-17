## Parent PRD
`docs/PRD.md`

## What to build
Implement `background.ts`. Integrate `chrome.alarms` for the timer and midnight archive. Connect the pure logic modules (from issue 002) to read/write from storage (issue 003). Implement `chrome.notifications` logic and message listeners.

## Acceptance criteria
- [ ] Service worker handles `pomodoro-tick` alarms and calculates drift.
- [ ] Service worker handles `midnight-archive` alarms.
- [ ] Service worker listens to `START_TIMER`, `PAUSE_TIMER`, etc., updates storage, and schedules alarms.
- [ ] End of session triggers a notification.

## Blocked by
- Blocked by `issues/002-pure-logic-modules.md`
- Blocked by `issues/003-storage-abstraction-layer.md`

## User stories addressed
- User stories 4, 5, 6, 22, 30

## Implementation Workflow (TDD)
**MANDATORY:** You must use the TDD RED -> GREEN -> REFACTOR loop.
Mock the browser APIs (`chrome.alarms`, `chrome.notifications`, `chrome.runtime.onMessage`). Write a single test for an event (e.g., receiving START_TIMER), implement the handler, and iterate.