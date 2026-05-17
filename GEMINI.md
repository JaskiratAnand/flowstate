# FocusFlow — Pomodoro & Todo Browser Extension

FocusFlow is a privacy-first, cross-browser extension that integrates a Pomodoro timer, a daily todo checklist, and a local stats dashboard into a single, cohesive tool.

## Project Overview

- **Purpose:** Provide a seamless deep-work environment within the browser without external dependencies or accounts.
- **Key Features:**
  - **Pomodoro Timer:** Background-persistent timer using `chrome.alarms`.
  - **Todo Checklist:** Daily tasks with categories and drag-to-reorder support.
  - **Stats Dashboard:** Local tracking of streaks, daily sessions, and task completions.
  - **Theming:** Light/Dark mode and 3 pre-built color themes (Ocean, Forest, Sunset).
- **Core Philosophy:** All data stays local; no accounts, no cloud sync (v1), no tracking.

## Technical Stack

- **Framework:** [WXT](https://wxt.dev/) (Web Extension Toolbox) for cross-browser Manifest V3 support.
- **UI:** [Svelte](https://svelte.dev/) + TypeScript.
- **Styling:** Tailwind CSS with CSS Variables for theming.
- **Storage:** `chrome.storage.local` (WXT storage API).
- **Package Manager:** `pnpm` (Node 24 recommended).

## Building and Running

Since the project is in the initial planning phase, these are the intended commands:

- **Setup:** `pnpm install`
- **Development:** `pnpm dev` (starts extension in development mode with HMR)
- **Production Build:** `pnpm build`
- **Testing:** `pnpm test` (intended for unit tests of pure logic modules)

## Architecture & Conventions

### Directory Structure (Planned)
```
.
├── entrypoints/
│   ├── popup/             # Main UI (App.svelte, main.ts)
│   └── background.ts      # Persistent timer engine & alarms
├── components/            # Reusable Svelte components
├── lib/                   # Pure logic and shared utilities
│   ├── storage.ts         # Typed storage wrappers
│   ├── timer.ts           # Timer state machine
│   ├── stats.ts           # Stats aggregation logic
│   └── archive.ts         # Todo archiving logic
├── styles/                # Global styles and theme tokens
└── wxt.config.ts          # WXT configuration
```

### Key Implementation Principles

1. **Storage as Single Source of Truth:** The popup should never hold long-lived state. It should read from and write to `chrome.storage.local`, using `chrome.storage.onChanged` for reactivity.
2. **Timer Persistence:** Use `chrome.alarms` for timer ticks. `setInterval` in the background script is unreliable in Manifest V3 as the service worker can be suspended.
3. **Pure Logic Separation:** Keep business logic (timer transitions, stats math, archiving) in pure TypeScript modules under `lib/` to facilitate unit testing without browser mocks.
4. **WXT Unified API:** Use the `browser` object (from WXT) instead of `chrome` to ensure cross-browser compatibility (Firefox/Edge).
5. **Drift Correction:** For the timer, store `lastTickAt` timestamps and calculate elapsed time on each alarm fire to account for browser scheduling delays.

Refer to `docs/PRD.md` and `docs/PLAN.md` for detailed requirements and implementation decisions.
