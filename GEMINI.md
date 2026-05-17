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
