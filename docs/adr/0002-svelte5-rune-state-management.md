# Svelte 5 Rune-based State Management for Timer

We decided to migrate the timer store from a Svelte 4 `writable` store to a Svelte 5 rune-based reactive object returned by `useTimer()`. Instead of using Svelte 4 store auto-subscriptions (`$timer`), components will directly access a reactive `state` property (`timer.state`).

This is because Svelte 5 runes (`$state`, `$derived`, `$effect`) provide a cleaner, more performant, and modern approach to reactivity compared to Svelte 4 stores. Exposing a reactive state object aligns the extension's UI state management with Svelte 5 best practices and makes the component logic more straightforward to read and test.
