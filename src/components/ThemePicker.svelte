<script lang="ts">
import type { Theme, UserPreferences } from '../lib/types';
import { setStorageItem } from '../lib/storage';

export let preferences: UserPreferences;
export let onUpdate: (prefs: UserPreferences) => void;

const themes: { id: Theme; color: string }[] = [
  { id: 'ocean', color: '#0ea5e9' },
  { id: 'forest', color: '#10b981' },
  { id: 'sunset', color: '#f59e0b' },
];

async function toggleDarkMode() {
  const newPrefs = { ...preferences, darkMode: !preferences.darkMode };
  await setStorageItem('USER_PREFERENCES', newPrefs);
  onUpdate(newPrefs);
}

async function selectTheme(theme: Theme) {
  const newPrefs = { ...preferences, theme };
  await setStorageItem('USER_PREFERENCES', newPrefs);
  onUpdate(newPrefs);
}
</script>

<div class="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
  <div class="flex gap-2">
    {#each themes as theme}
      <button
        class="w-8 h-8 rounded-full border-2 {preferences.theme === theme.id ? 'border-[var(--text-primary)]' : 'border-transparent'}"
        style="background-color: {theme.color}"
        on:click={() => selectTheme(theme.id)}
        title="Select {theme.id} theme"
        aria-label="Select {theme.id} theme"
      ></button>
    {/each}
  </div>

  <button
    class="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-xl"
    on:click={toggleDarkMode}
  >
    {preferences.darkMode ? '☀️' : '🌙'}
  </button>
</div>
