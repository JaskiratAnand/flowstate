# Contributing to FlowState

Thank you for your interest in contributing to **FlowState**! We welcome contributions, bug reports, and feature suggestions from the community.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](file:///Users/jas/Code/flowstate/CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- **Node.js:** v18.x or higher
- **Package Manager:** `pnpm` (v9 or higher recommended)

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/flowstate.git
   cd flowstate
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   - For Chrome: `pnpm dev`
   - For Firefox: `pnpm dev:firefox`

4. **Load the unpacked extension in your browser:**
   - **Chrome:** Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the `.output/chrome-mv3` folder.
   - **Firefox:** Open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `manifest.json` inside `.output/firefox-mv2`.

## Project Structure

- `src/entrypoints/`: WXT entrypoints (popup, background service worker, offscreen document, content script, blocked app page).
- `src/components/`: Svelte 5 UI components using neomorphic/tactile design.
- `src/lib/`: Core functional logic (timer engine, Focus Shield blocking rules, storage wrapper, stats calculations).
- `src/styles/`: Theme CSS custom properties and global styles.
- `docs/`: Technical specifications and Architecture Decision Records (ADRs).

## Development Guidelines

### Styling & Design
- FlowState follows a **Calm Technology & Tactile UI** design ethos.
- Leverage CSS custom variables defined in `src/styles/themes.css` and Neomorphic elevation tokens (`--shadow-ambient`, `--shadow-pressed`).
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state.

### Testing & Quality Checks

Before submitting a Pull Request, please ensure all quality checks pass:

```bash
# Run unit and component tests
pnpm test

# Run Svelte type-checking
pnpm check

# Run Oxlint linter
pnpm lint

# Format code with Biome
pnpm fmt

# Run full pre-build suite (fmt + lint + check)
pnpm prebuild
```

### Git Commit Conventions

We follow clear, descriptive commit messages:
- `feat: add sound volume control`
- `fix: resolve timer drift when tab is backgrounded`
- `docs: update setup instructions in README`
- `style: refine shadow elevation in dark mode`

## Submitting Pull Requests

1. Create a feature branch off `main` (`git checkout -b feat/my-new-feature`).
2. Make your changes and add tests where appropriate.
3. Ensure `pnpm prebuild` and `pnpm test` pass without errors.
4. Push your branch and open a Pull Request against `main`.
5. Provide a clear description of the changes and motivation in the PR template.

## License

By contributing, you agree that your contributions will be licensed under the project's [Apache License 2.0](file:///Users/jas/Code/flowstate/LICENSE).
