# FlowState

<p align="center">
  <img src="public/icon/128.png" alt="FlowState Logo" width="96" height="96" />
</p>

> **Calm Technology.** An analog desk object meets modern web architecture.

FlowState is a tactile, sensory-focused Pomodoro and Todo browser extension that grounds digital work in analog warmth. It trades stressful digital countdown counters for a sweeping, physical-feeling clock face that visualizes time as a tangible resource.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Framework](https://img.shields.io/badge/Framework-WXT_MV3-emerald)](https://wxt.dev/)
[![UI Library](https://img.shields.io/badge/UI-Svelte_5-orange)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)

---

### Install Extension

<p align="center">
  <a href="https://chromewebstore.google.com/detail/flowstate-pomodoro-timer/doikpbcgobfmbefibjjheipkgmgkgifk">
    <img src="https://img.shields.io/badge/Chrome_Web_Store-Get_FlowState-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Get FlowState on Chrome Web Store" />
  </a>
  &nbsp;&nbsp;
  <a href="https://addons.mozilla.org/en-GB/firefox/addon/flowstate/">
    <img src="https://img.shields.io/badge/Firefox_Add--ons-Get_FlowState-FF7139?style=for-the-badge&logo=firefoxbrowser&logoColor=white" alt="Get FlowState on Firefox Add-ons" />
  </a>
</p>

---

## Highlights & Features

- ⏱️ **Analog Pomodoro Timer:** Sweeping time-dial visualizer with customizable work & break durations, ambient audio chimes, and state persistence.
- 🛡️ **Focus Shield (Website Blocker):** Full website blocking support with **Blocklist** and **Allowlist** modes, complete with mindful breathing exercises upon blocked navigation.
- 📋 **Integrated Todo Management:** Tactile task list embedded directly in your focus space with priority sorting, drag-and-drop ordering, and completion archiving.
- 🎨 **Deep Customization:** Neomorphic design system featuring multiple curated color palettes (Forest, Ocean, Sunset), dark/light/system schemes, custom typography (Sans, Serif, Mono, System), and custom accent color selection.
- 🔒 **100% Private & Offline:** Operates entirely within `browser.storage.local`. Zero tracking, zero telemetry, zero external APIs, and no account required.

---

## Tech Stack & Architecture

- **Extension Framework:** [WXT](https://wxt.dev/) (Web Extension Toolbox) supporting Manifest V3 (Chrome) & Manifest V2/V3 (Firefox)
- **UI Framework:** [Svelte 5](https://svelte.dev/) with reactive runes (`$state`, `$derived`, `$effect`)
- **Styling:** [TailwindCSS 4](https://tailwindcss.com/) with CSS Custom Properties for theme tokens
- **Testing:** [Vitest](https://vitest.dev/) & [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/)
- **Linting & Formatting:** [Oxlint](https://github.com/oxc-project/oxlint) & [Biome](https://biomejs.dev/)

```
flowstate/
├── src/
│   ├── components/       # Svelte 5 UI components (Timer, Focus Shield, TodoList, ThemePicker)
│   ├── entrypoints/      # WXT entrypoints (popup, background service worker, offscreen, blocked page)
│   ├── lib/              # Pure functional core (timer engine, storage adapters, blocking rules)
│   └── styles/           # Theme definitions, CSS variables, and neomorphic shadow tokens
├── docs/                 # Design specs and Architecture Decision Records (ADRs)
└── public/               # Extension icons and static assets
```

---

## Quick Start

### Prerequisites

Ensure you have **Node.js** (v18+) and **`pnpm`** installed:

```bash
node -v
pnpm -v
```

### Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/flowstate.git
   cd flowstate
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server with HMR:**
   ```bash
   # Chromium browsers (Chrome, Brave, Edge)
   pnpm dev

   # Firefox
   pnpm dev:firefox
   ```

4. **Load into Browser:**
   - **Chrome / Brave:** Go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the `.output/chrome-mv3` folder.
   - **Firefox:** Go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `manifest.json` inside `.output/firefox-mv2`.

---

## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `pnpm dev` | `wxt` | Start development mode for Chrome with hot reload |
| `pnpm dev:firefox` | `wxt -b firefox` | Start development mode for Firefox |
| `pnpm build` | `wxt build` | Build production extension bundle |
| `pnpm test` | `vitest run` | Run all 140+ unit and component tests |
| `pnpm check` | `svelte-check` | Validate TypeScript and Svelte types |
| `pnpm lint` | `oxlint` | Run ultra-fast Oxlint linter |
| `pnpm fmt` | `biome format` | Format project files using Biome |
| `pnpm prebuild` | `fmt && lint && check` | Run complete code-quality check suite |

---

## Contributing

We welcome community contributions! Please read our guidelines before submitting a pull request:

- 📖 **[Contributing Guide](file:///Users/jas/Code/flowstate/CONTRIBUTING.md):** Setup workflow, standards, and guidelines.
- 🤝 **[Code of Conduct](file:///Users/jas/Code/flowstate/CODE_OF_CONDUCT.md):** Community standards (Contributor Covenant 2.1).
- 🛡️ **[Security Policy](file:///Users/jas/Code/flowstate/SECURITY.md):** Responsible vulnerability disclosure policy.

---

## License

Distributed under the **Apache License 2.0**. See [`LICENSE`](file:///Users/jas/Code/flowstate/LICENSE) for full details.
