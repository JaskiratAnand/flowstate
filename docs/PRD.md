# PRD: FocusFlow — Pomodoro Timer & Todo Browser Extension

## Problem Statement

Productivity-focused users struggle to maintain deep work habits because their tools are fragmented. They switch between a separate timer app, a todo list, and a habit tracker — each in a different place, with no shared context. This context-switching itself undermines focus. Browser extensions are the natural home for a productivity tool since users are already in the browser, but existing Pomodoro extensions are either too bare-bones (no todos, no stats) or too heavy (require accounts, cloud sync, onboarding). Users want a fast, self-contained tool that lives in their browser, respects their privacy (no accounts, no cloud), and gives them just enough structure to stay focused without becoming a productivity app in itself.

## Solution

FocusFlow is a cross-browser extension (Chrome, Firefox, Edge) that combines a configurable Pomodoro timer, a daily todo checklist with categories, and a local stats dashboard — all in a single tabbed popup. It requires no account, stores all data locally, and is designed to load instantly. Three pre-built color themes (Ocean, Forest, Sunset) plus light/dark mode give users a sense of ownership. The extension is architected to support future premium features (cloud sync, integrations, additional themes) without requiring a rewrite.

## User Stories

### Timer
1. As a user, I want to start a 25-minute focus session so that I can work without distraction.
2. As a user, I want to pause and resume the timer so that I can handle unexpected interruptions without losing my session progress.
3. As a user, I want to reset the timer so that I can start fresh if my session was derailed.
4. As a user, I want the timer to keep running when I close the popup so that I don't have to keep the extension open while working.
5. As a user, I want to receive a browser notification when my work session ends so that I know it's time for a break even if I'm in another tab.
6. As a user, I want to receive a browser notification when my break ends so that I know it's time to get back to work.
7. As a user, I want to see a short break (5 min) automatically suggested after each work session so that I follow the Pomodoro method without thinking.
8. As a user, I want to see a long break (15 min) suggested after every 4 completed sessions so that I recover properly during extended work blocks.
9. As a user, I want to skip the current break and go straight back to work so that I can stay in flow when I feel ready.
10. As a user, I want to configure the work session duration so that I can adapt the timer to my personal focus style.
11. As a user, I want to configure the short break duration so that I can take the right amount of recovery time for me.
12. As a user, I want to configure the long break duration so that I can customise my rest periods.
13. As a user, I want to see the current session type (work / short break / long break) clearly labelled so that I always know what mode I'm in.
14. As a user, I want the timer to display minutes and seconds in a large, readable format so that I can glance at it quickly.
15. As a user, I want the timer state (running/paused/remaining time) to be preserved if I close and reopen the popup so that I never lose my place.

### Todo Checklist
16. As a user, I want to add a new task so that I can capture what I need to work on today.
17. As a user, I want to check off a completed task so that I can track my progress through the day.
18. As a user, I want to delete a task so that I can remove items I no longer need.
19. As a user, I want to reorder tasks by dragging and dropping so that I can prioritise what to work on next.
20. As a user, I want to assign a category/tag to each task so that I can organise my work by area (e.g. Work, Personal, Study).
21. As a user, I want to see my tasks grouped or labelled by category so that I can scan my list at a glance.
22. As a user, I want completed tasks to be automatically archived at midnight so that my active list stays clean each new day.
23. As a user, I want incomplete tasks to carry over to the next day so that nothing is lost overnight.
24. As a user, I want my tasks to persist across browser sessions so that I don't have to re-enter them every time I open the browser.
25. As a user, I want to edit the text of an existing task so that I can correct typos or refine what I wrote.

### Stats Dashboard
26. As a user, I want to see how many Pomodoro sessions I completed today so that I can gauge my daily output.
27. As a user, I want to see my current daily streak so that I stay motivated to maintain consistent focus habits.
28. As a user, I want to see how many tasks I completed today so that I can feel a sense of accomplishment.
29. As a user, I want to see my all-time total Pomodoro sessions so that I can appreciate my cumulative effort over time.
30. As a user, I want my stats to update immediately after each completed session or task so that the dashboard always reflects reality.
31. As a user, I want my stats to persist locally across browser sessions and restarts so that my history is never lost.
32. As a user, I want my streak to reset to zero if I miss a day with no completed sessions so that the streak is meaningful.

### Theming
33. As a user, I want to switch between light and dark mode so that the extension suits my environment and time of day.
34. As a user, I want to choose from 3 pre-built colour themes (Ocean, Forest, Sunset) so that the extension feels personalised.
35. As a user, I want my theme choice to persist across browser sessions so that I don't have to reselect it every time.
36. As a user, I want the extension to default to my OS light/dark preference so that it feels native immediately on first use.

### General UX
37. As a user, I want the popup to open instantly with no loading delay so that I can check my timer without breaking flow.
38. As a user, I want a tabbed interface (Timer / Tasks / Stats) so that each feature has its own dedicated space and doesn't feel cluttered.
39. As a user, I want my last active tab to be remembered so that reopening the popup takes me back to where I was.
40. As a user, I want the extension to work on Chrome, Firefox, and Edge so that I'm not locked into one browser.
41. As a user, I want the extension to work entirely offline with no account required so that my data stays private.

## Implementation Decisions

### Architecture

- **Build tool:** WXT — provides cross-browser Manifest V3 support, HMR during development, and a unified `browser` API wrapper that abstracts Chrome/Firefox differences.
- **UI framework:** Svelte + TypeScript — compiles to minimal JS (~5KB), ideal for an extension popup that loads on every click. Reactive primitives map cleanly to timer state.
- **Styling:** Tailwind CSS with a custom CSS variable layer for theming.
- **Package manager:** pnpm — strict dependency resolution, no phantom dependencies.

### Modules

#### `background.ts` — Timer Engine
The core of the extension. Runs as a persistent background service worker.
- Owns all timer state (status, remainingSeconds, sessionType, completedSessions).
- Uses `chrome.alarms` (not `setInterval`) for tick scheduling — alarms survive service worker sleep cycles.
- Stores a `lastTickAt` timestamp on every tick and computes elapsed time on the next tick to correct for drift.
- Responds to messages: `START_TIMER`, `PAUSE_TIMER`, `RESET_TIMER`, `SKIP_SESSION`, `UPDATE_CONFIG`.
- Fires `chrome.notifications` on session end.
- Registers a `midnight-archive` alarm to trigger daily todo archiving.
- On session complete: increments stats, writes to storage, fires notification.

#### `lib/storage.ts` — Storage Abstraction
Typed wrappers around `chrome.storage.local`. All reads/writes go through this module.
- Exposes strongly-typed `get<T>` and `set<T>` helpers keyed against a central `STORAGE_KEYS` const.
- Single source of truth for all persisted state.
- No in-memory caching — always reads from storage to avoid popup/background state drift.

#### `lib/timer.ts` — Timer State Machine
Pure logic module (no browser APIs) that encodes valid state transitions:
- `idle → running`, `running → paused`, `paused → running`, `running → break`, `break → idle`.
- Computes next session type (work / short-break / long-break) based on completed session count.
- Easily unit-testable in isolation.

#### `lib/stats.ts` — Stats Aggregation
Pure logic module for computing and updating stats.
- `incrementPomodoro(date, stats)` — bumps daily count + all-time total, updates streak.
- `incrementTasksCompleted(date, stats)` — bumps daily task count.
- `computeStreak(lastActiveDate, currentDate, stats)` — resets streak if a day was missed.
- All functions are pure (input → output), no side effects.

#### `lib/archive.ts` — Daily Todo Archiving
Pure logic module.
- `archiveCompletedTasks(tasks, date)` — separates completed from active, returns archive entry.
- `carryOverIncompleteTasks(tasks)` — returns incomplete tasks for the next day.
- Triggered by background at midnight via `chrome.alarms`.

#### `lib/types.ts` — Shared Interfaces
Single file for all TypeScript interfaces: `TimerConfig`, `TimerState`, `Task`, `DailyArchive`, `Stats`, `UserPreferences`. No logic, just types.

#### Svelte Components
- `App.svelte` — root, manages active tab state, reads preferences from storage on mount.
- `TabBar.svelte` — fixed bottom navigation, emits tab change events.
- `Timer.svelte` — reads timer state from storage, sends messages to background, displays countdown.
- `TimerConfig.svelte` — settings form for session durations, writes config to storage and notifies background.
- `TodoList.svelte` — task list with drag-to-reorder (`svelte-dnd-action`), manages add/delete/complete.
- `TodoItem.svelte` — single task row with checkbox, label, category tag, delete button.
- `StatsDashboard.svelte` — reads stats from storage, renders metric cards.
- `ThemePicker.svelte` — renders colour swatches + light/dark toggle, writes preference to storage.

### Storage Schema

| Key | Type | Description |
|---|---|---|
| `timer_state` | `TimerState` | Current timer status, remaining seconds, session count |
| `timer_config` | `TimerConfig` | User-configured durations |
| `tasks` | `Task[]` | Active task list |
| `daily_archive` | `DailyArchive` | Completed tasks keyed by `YYYY-MM-DD` |
| `stats` | `Stats` | Streak, daily counts, all-time total |
| `user_preferences` | `UserPreferences` | Theme, dark mode, last active tab |

### Popup ↔ Background Sync
- Popup never holds in-memory timer state. On every open, it reads `timer_state` from `chrome.storage.local`.
- Popup listens to `chrome.storage.onChanged` to reactively update the countdown display while open.
- All timer mutations (start, pause, reset) are sent as messages to the background — the background writes to storage, which triggers `onChanged` in the popup.

### Theming
- Three theme tokens defined in `themes.css` as CSS variable sets on data attributes: `[data-theme="ocean"]`, `[data-theme="forest"]`, `[data-theme="sunset"]`.
- Light/dark handled via `[data-dark="true"]` on the root element, overriding surface/text variables.
- `App.svelte` applies both attributes on mount based on stored preferences.

## Testing Decisions

### What makes a good test
Tests should verify external behaviour — what a module returns or what side effects it produces — not how it achieves it internally. Tests should not assert on internal variable names, private function calls, or implementation order. A good test can survive a complete internal refactor as long as the module's public contract stays the same.

### Modules to test

**`lib/timer.ts`** — highest priority. Pure state machine with no browser dependencies. Test every valid transition (`idle → running`, `running → paused`, etc.), every invalid transition (should be a no-op or throw), and session-type sequencing (4 work sessions → long break).

**`lib/stats.ts`** — high priority. Pure functions, no side effects. Test streak increment, streak reset on missed day, daily pomodoro count increment, all-time total accumulation, edge cases (first ever session, session on day after a gap).

**`lib/archive.ts`** — medium priority. Pure functions. Test that completed tasks are separated correctly, incomplete tasks carry over, archive is keyed correctly by date, empty list edge case.

**`lib/storage.ts`** — low priority. Thin wrapper; test that it correctly serialises/deserialises typed data. Mock `chrome.storage.local` using `jest-chrome` or WXT's built-in test utilities.

### What not to test
- Svelte components (UI behaviour belongs in E2E/manual testing for v1)
- `background.ts` directly (too coupled to browser APIs; test the pure logic modules it delegates to instead)
- `chrome.alarms` or `chrome.notifications` (mock at the boundary, don't test the browser APIs themselves)

## Out of Scope

- Cloud sync / cross-device data persistence
- User accounts or authentication
- Payment gating or license key validation
- Integrations with external services (Notion, Google Tasks, Todoist)
- Additional theme packs beyond the 3 included
- Custom notification sounds
- Task due dates, priority levels, or subtasks
- Historical stats charts or visualisations beyond summary numbers
- Safari support
- A dedicated options page (settings live in the Timer tab config panel)
- Onboarding flow or tutorial

## Further Notes

- **Premium roadmap:** Cloud sync and integrations are the planned premium features. The storage abstraction (`lib/storage.ts`) should be designed with a swappable backend in mind — a future `lib/cloud-storage.ts` should be droppable in without changing callers.
- **Manifest V3 service worker lifecycle:** Background service workers can be terminated by the browser after ~30 seconds of inactivity. `chrome.alarms` is the correct solution (not `setInterval`) since alarms survive worker termination and wake the worker when they fire. This is already accounted for in the architecture.
- **Firefox compatibility:** Firefox supports Manifest V3 as of Firefox 109 but has some `chrome.alarms` quirks. WXT's `browser` wrapper handles the majority of these. Test on Firefox explicitly before release.
- **10MB storage limit:** `chrome.storage.local` has a 10MB cap. The daily archive (completed tasks per day) is the main growth vector. For v1 this is not a concern, but a future cleanup job that prunes archives older than 90 days should be planned before adding cloud sync.
