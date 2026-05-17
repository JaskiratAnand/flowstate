# FlowState: Organic Studio

FlowState is a tactile, sensory-focused Pomodoro and Todo browser extension that grounds digital work in analog warmth. It trades stressful digital counters for a sweeping, physical-feeling clock face that visualizes time as a tangible resource.

## Project Overview

- **Core Mission:** Calm Technology. Analog desk object meets modern UI.
- **Tech Stack:**
  - **Framework:** [WXT](https://wxt.dev/) (Web Extension Toolbox)
  - **UI Library:** [Svelte 5](https://svelte.dev/)
  - **Styling:** [TailwindCSS 4](https://tailwindcss.com/) with Vanilla CSS variables for themes.
  - **Runtime:** Browser Extension (Chrome, Firefox, etc.)
  - **State Management:** WXT Storage API (`browser.storage.local`) with custom wrappers.
  - **Testing:** [Vitest](https://vitest.dev/) with Svelte Testing Library.
  - **Linting/Formatting:** [Oxlint](https://github.com/oxc-project/oxlint) and [Biome](https://biomejs.dev/).

## Architecture

- `src/entrypoints/`: Extension entry points (background, popup, offscreen, content).
- `src/lib/`: Core logic, types, and utilities.
  - `storage.ts`: Strongly typed wrapper for extension storage.
  - `timer.ts`: Pure functional logic for the Pomodoro timer.
  - `background-logic.ts`: Message handlers and alarm logic for the background service.
- `src/components/`: Svelte 5 components using neomorphic/tactile design patterns.
- `src/styles/`: Global styles and theme definitions using CSS variables.
- `docs/DESIGN.md`: Detailed design specifications, color tokens, and UI vision.

## Building and Running

Ensure you have `pnpm` installed.

- **Development:** `pnpm dev` (Starts WXT dev mode with auto-reload).
- **Production Build:** `pnpm build` (Outputs to `.output/`).
- **Testing:** `pnpm test` (Runs Vitest).
- **Linting:** `pnpm lint` (Runs Oxlint).
- **Formatting:** `pnpm fmt` (Runs Biome format).
- **Type Checking:** `pnpm check` (Runs svelte-check).

## Versioning Strategy

This project follows [Semantic Versioning (SemVer)](https://semver.org/).

- **Source of Truth:** The `version` field in `package.json`.
- **Changelog:** All notable changes must be documented in `CHANGELOG.md` following the [Keep a Changelog](https://keepachangelog.com/) format.
- **Workflow:**
  1. Ensure you are on the `main` branch and it's up to date.
  2. Run `pnpm version <patch|minor|major>`. This will:
     - Run `prebuild` (lint, format, check) and `test` via the `preversion` hook.
     - Bump the version in `package.json`.
     - Create a git commit and tag automatically.
  3. Update `CHANGELOG.md` with the new version and date.
  4. Push changes and tags: `git push && git push --tags`.

## Git Branching Strategy

FlowState uses a simplified GitHub Flow for versioning and releases:

- **`main` Branch (Stable):** Always reflects the current or next stable release. All commits to `main` should ideally be associated with a version bump or documentation update.
- **Feature/Fix Branches:** Use short-lived branches for development (e.g., `feat/timer-sounds`, `fix/styling-glitch`).
- **Release Process:**
  1. Merge your feature branch into `main`.
  2. Switch to `main` and run `pnpm version <patch|minor|major>`.
  3. Update `CHANGELOG.md` (move items from `[Unreleased]` to a new version header).
  4. Commit changelog changes: `git add CHANGELOG.md && git commit -m "docs: update changelog"`.
  5. Push: `git push && git push --tags`.
  6. Build for production: `pnpm zip`.

## Development Conventions

### Styling & Design
- **Tactile UI:** Use neomorphic shadows (`--shadow-ambient`, `--shadow-pressed`) to create depth.
- **Themes:** Themes are controlled via `data-theme` (forest, ocean, sunset) and `data-dark` (true/false) attributes on the root element.
- **Color Mix:** Use `color-mix(in srgb, var(--accent) 15%, transparent)` for soft backgrounds.
- **Tailwind 4:** Prefer standard CSS variables defined in `themes.css` over hardcoded values.

### State & Storage
- **Storage Keys:** Defined in `src/lib/storage.ts`. Always use `getStorageItem` and `setStorageItem` to ensure type safety.
- **Reactivity:** Leverage Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state.

### Logic
- **Functional Core:** Keep core logic (like `timer.ts` and `stats.ts`) pure and functional to simplify testing.
- **Background Communication:** Use `browser.runtime.sendMessage` to communicate between the popup and background script.

### Testing
- Follow a TDD approach where possible.
- New features should include unit tests in `src/lib/*.test.ts` or component tests in `src/components/*.test.ts`.
