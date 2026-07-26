# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] - 2026-07-26

### Added
- Open sourced FlowState under the **Apache License 2.0**.
- Added community and governance files: `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- Added GitHub Actions CI pipeline (`ci.yml`) and automated Chrome & Firefox release packaging workflow (`release.yml`) on Node.js 22.
- Added Chrome Web Store and Firefox Add-ons download badges to `README.md`.

### Changed
- Unlocked all previously locked features for all users (Focus Shield Allowlist mode, custom accent color picker, and premium typography options).
- Rewrote `README.md` with comprehensive open-source documentation, installation steps, and architecture overview.
- Updated `tsconfig.json` compiler options to include `vitest` and `@testing-library/jest-dom` type declarations.

### Removed
- Removed `WXT_PRO_VERSION` environment variable checks, PRO badges, and PRO lock overlays across components and tests.
- Removed unused template boilerplate files (`Counter.svelte`, `svelte.svg`).
- Removed legacy `dev:pro`, `build:pro`, and `zip:pro` package scripts.

## [0.1.1] - 2026-05-17

### Fixed
- Accessibility warning in ThemePicker (label/input association).

## [0.1.0] - 2026-05-17

### Added
- Real-time task sorting with smooth glide animation.
- Custom font selection system.

## [0.0.0] - 2026-05-17

### Added
- Initial project structure using WXT and Svelte 5.
- Core Pomodoro and Todo logic.
- Neomorphic UI components and theme support.
- Vitest, Oxlint, and Biome integration.
