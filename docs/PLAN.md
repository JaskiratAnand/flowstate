# Pomodoro Extension
---

You are an expert browser extension developer. Scaffold a production-ready cross-browser extension called **FlowState** — a Pomodoro timer with a todo checklist and a local stats dashboard.

### Tech Stack
- **Build tool:** WXT (latest) — handles cross-browser (Chrome, Firefox, Edge) and Manifest V3
- **UI framework:** Svelte + TypeScript
- **Styling:** Tailwind CSS
- **Storage:** `chrome.storage.local` (via WXT's unified storage API)
- **Package manager:** `pnpm` (`fnm use 24`)
- **Notifications:** `chrome.notifications` (cross-browser)

---

### Extension Structure

```
flowstate/
├── entrypoints/
│   ├── popup/
│   │   ├── App.svelte         ← Root: tabbed layout (Timer | Tasks | Stats)
│   │   ├── main.ts
│   │   └── index.html
│   ├── background.ts          ← Timer logic, alarms, notifications
├── components/
│   ├── Timer.svelte           ← Countdown display, start/pause/reset
│   ├── TimerConfig.svelte     ← Work/short break/long break duration settings
│   ├── TodoList.svelte        ← Task list with drag-to-reorder
│   ├── TodoItem.svelte        ← Individual task row
│   ├── CategoryTag.svelte     ← Tag/category badge
│   ├── StatsDashboard.svelte  ← Streaks, daily pomodoros, tasks completed
│   ├── ThemePicker.svelte     ← 3 pre-built themes + light/dark toggle
│   └── TabBar.svelte          ← Bottom tab navigation
├── lib/
│   ├── storage.ts             ← Typed wrappers around chrome.storage.local
│   ├── timer.ts               ← Timer state machine logic
│   ├── stats.ts               ← Stats aggregation helpers
│   └── types.ts               ← Shared TypeScript interfaces
├── styles/
│   └── themes.css             ← CSS variables for all themes
├── wxt.config.ts
├── tailwind.config.ts
└── package.json
```

---

### Features to Implement

#### 1. Pomodoro Timer
- Configurable durations: work session (default 25 min), short break (default 5 min), long break (default 15 min after 4 sessions)
- Timer runs in the **background service worker** using `chrome.alarms` so it persists when popup is closed
- Popup syncs with background state on open via `chrome.storage.local`
- Timer states: `idle | running | paused | break`
- On session complete: fire a `chrome.notifications` alert ("Time for a break!" / "Back to work!")
- Auto-start next session: OFF by default (notification prompts user)

#### 2. Todo Checklist
- Add, check off, delete tasks
- Drag-to-reorder (use `svelte-dnd-action`)
- Categories/tags — user can assign one tag per task (free text, stored as string)
- **Daily auto-archive:** at midnight, move all completed tasks to an archive log keyed by date (`YYYY-MM-DD`). Active list only shows today's incomplete + any incomplete carried over.
- Persist active tasks and archive in `chrome.storage.local`

#### 3. Stats Dashboard
Track and display locally:
- **Current streak** — consecutive days with at least 1 completed pomodoro
- **Today's pomodoros** — count of completed work sessions today
- **Tasks completed today** — count of tasks checked off today
- **All-time pomodoros** — lifetime total
- Stats are written to storage after every session/task completion
- Display in a clean card grid — no charts needed for v1

#### 4. Theming System
- **Light** and **Dark** mode (respects `prefers-color-scheme` by default, toggleable)
- **3 pre-built color themes** (in addition to light/dark):
  - `Ocean` — blue/teal accent palette
  - `Forest` — green/sage accent palette  
  - `Sunset` — warm orange/amber accent palette
- Implement themes via CSS custom properties (`--color-accent`, `--color-surface`, etc.) on `:root`
- Theme selection persisted in `chrome.storage.local`
- `ThemePicker.svelte` shows 3 swatches + light/dark toggle

#### 5. Tab Layout
Popup is **380px wide, max 580px tall** with a fixed bottom tab bar:
- **Timer tab** — countdown, start/pause/reset, session type indicator, config gear icon
- **Tasks tab** — todo list
- **Stats tab** — stats dashboard

---

### Data Models (types.ts)

```typescript
interface TimerConfig {
  workDuration: number;       // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number; // default 4
}

interface TimerState {
  status: 'idle' | 'running' | 'paused' | 'break';
  sessionType: 'work' | 'short-break' | 'long-break';
  remainingSeconds: number;
  completedSessionsToday: number;
  lastTickAt: number | null;  // Date.now() timestamp for drift correction
}

interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
  order: number;
}

interface DailyArchive {
  [date: string]: Task[];     // keyed by 'YYYY-MM-DD'
}

interface Stats {
  currentStreak: number;
  lastActiveDate: string;     // 'YYYY-MM-DD'
  allTimePomodorosCompleted: number;
  dailyPomodoros: { [date: string]: number };
  dailyTasksCompleted: { [date: string]: number };
}

interface UserPreferences {
  theme: 'ocean' | 'forest' | 'sunset';
  darkMode: boolean;
  timerConfig: TimerConfig;
}
```

---

### Storage Keys (storage.ts)

```typescript
const KEYS = {
  TIMER_STATE: 'timer_state',
  TASKS: 'tasks',
  ARCHIVE: 'daily_archive',
  STATS: 'stats',
  PREFS: 'user_preferences',
} as const;
```

---

### Background Service Worker (background.ts)

- Listen for `chrome.alarms` named `'pomodoro-tick'` (fires every minute) and `'pomodoro-end'`
- On each tick: decrement `remainingSeconds` in storage, handle drift using `lastTickAt`
- On timer end: fire notification, update stats, write to storage
- Handle `chrome.runtime.onMessage` for: `START_TIMER`, `PAUSE_TIMER`, `RESET_TIMER`, `SKIP_SESSION`
- Handle `chrome.alarms.onAlarm` for `'midnight-archive'` — run daily archive logic

---

### Key Implementation Notes

1. **Timer drift correction:** Don't trust interval timing. Store `lastTickAt: Date.now()` on every tick and compute elapsed time on next tick to correct for drift.

2. **Popup ↔ Background sync:** On popup open, always read fresh state from `chrome.storage.local`. Don't keep in-memory state in the popup — treat storage as the single source of truth.

3. **Cross-browser compatibility:** Use WXT's `browser` import (not `chrome` directly) everywhere except where WXT already wraps it. This ensures Firefox compatibility.

4. **Midnight archive:** Use `chrome.alarms.create('midnight-archive', { when: nextMidnight })` to trigger daily archiving even if the popup isn't open.

5. **Svelte stores:** Use Svelte writable stores that sync bidirectionally with `chrome.storage.local` — read on mount, write on every store change.

---

### Commands to Bootstrap

```bash
npx wxt@latest init flowstate
# Select: Svelte + TypeScript

cd flowstate
npm install
npm install -D tailwindcss svelte-dnd-action
npm run dev
```

---

### What NOT to build yet (future premium features)
- Cloud sync / user accounts
- Integrations (Notion, Google Tasks, Todoist)
- Additional theme packs
- Custom notification sounds
- Analytics beyond local stats
- Payment/license gating

Keep the codebase clean and modular so these can be added as separate entrypoints/modules later without refactoring core logic.
.
