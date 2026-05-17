<script lang="ts">
import type { Theme, UserPreferences, ColorScheme } from '../lib/types';
import { setStorageItem } from '../lib/storage';

export let preferences: UserPreferences;
export let onUpdate: (prefs: UserPreferences) => void;

const themes: { id: Theme; color: string; label: string }[] = [
  { id: 'forest', color: '#8A9A86', label: 'Forest' },
  { id: 'ocean', color: '#7A90A4', label: 'Ocean' },
  { id: 'sunset', color: '#C17767', label: 'Sunset' },
];

const modes: { id: ColorScheme; icon: string; label: string }[] = [
  { id: 'light', icon: '☀️', label: 'Light' },
  { id: 'dark', icon: '🌙', label: 'Dark' },
  { id: 'system', icon: '💻', label: 'System' },
];

async function updatePrefs(patch: Partial<UserPreferences>) {
  const newPrefs = { ...preferences, ...patch };
  await setStorageItem('USER_PREFERENCES', newPrefs);
  onUpdate(newPrefs);
}

function handleCustomColorChange(e: Event) {
  const color = (e.target as HTMLInputElement).value;
  updatePrefs({ theme: 'custom', customAccentColor: color });
}
</script>

<div class="space-y-6 p-6 bg-surface rounded-[24px] shadow-[var(--shadow-ambient)] border border-border">
  <div class="space-y-4">
    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1">Appearance</span>
    <div class="flex p-1.5 bg-bg-primary rounded-2xl shadow-[var(--shadow-pressed)]">
      {#each modes as mode}
        <button
          class="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all {preferences.colorScheme === mode.id ? 'bg-surface text-text-primary shadow-[var(--shadow-ambient)]' : 'text-text-tertiary hover:text-text-secondary'}"
          on:click={() => updatePrefs({ colorScheme: mode.id })}
        >
          <span class="text-sm">{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="space-y-4">
    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1">Accent Color</span>
    <div class="flex flex-wrap gap-4">
      {#each themes as theme}
        <button
          class="w-11 h-11 rounded-full border-4 transition-all hover:scale-105 active:scale-95 {preferences.theme === theme.id ? 'border-text-primary shadow-[var(--shadow-ambient)]' : 'border-transparent shadow-[var(--shadow-ambient)]'}"
          style="background-color: {theme.color}"
          on:click={() => updatePrefs({ theme: theme.id })}
          title={theme.label}
          aria-label={theme.label}
        ></button>
      {/each}
      
      <div class="relative w-11 h-11">
        <input
          type="color"
          value={preferences.customAccentColor || '#8A9A86'}
          on:input={handleCustomColorChange}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          id="custom-color"
        />
        <label
          for="custom-color"
          class="flex items-center justify-center w-11 h-11 rounded-full border-4 transition-all hover:scale-105 active:scale-95 {preferences.theme === 'custom' ? 'border-text-primary shadow-[var(--shadow-ambient)]' : 'border-transparent shadow-[var(--shadow-ambient)]'}"
          style="background-color: {preferences.customAccentColor || '#8A9A86'}"
        >
          <svg class="w-5 h-5 text-white/90 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </label>
      </div>
    </div>
  </div>
</div>
