<script lang="ts">
import type { Theme, UserPreferences, ColorScheme } from '../lib/types';
import { setStorageItem } from '../lib/storage';

export let preferences: UserPreferences;
export let onUpdate: (prefs: UserPreferences) => void;

const themes: { id: Theme; color: string; label: string }[] = [
  { id: 'ocean', color: '#0ea5e9', label: 'Ocean' },
  { id: 'forest', color: '#10b981', label: 'Forest' },
  { id: 'sunset', color: '#f59e0b', label: 'Sunset' },
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

<div class="space-y-6 p-5 bg-bg-secondary rounded-[24px] border border-border shadow-sm">
  <div class="space-y-3">
    <span class="text-[10px] font-bold uppercase tracking-widest text-text-tertiary px-1">Appearance</span>
    <div class="flex p-1 bg-bg-primary border border-border rounded-xl">
      {#each modes as mode}
        <button
          class="flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all {preferences.colorScheme === mode.id ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}"
          on:click={() => updatePrefs({ colorScheme: mode.id })}
        >
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="space-y-3">
    <span class="text-[10px] font-bold uppercase tracking-widest text-text-tertiary px-1">Accent Color</span>
    <div class="flex flex-wrap gap-3">
      {#each themes as theme}
        <button
          class="w-10 h-10 rounded-full border-4 transition-all hover:scale-110 active:scale-95 {preferences.theme === theme.id ? 'border-text-primary' : 'border-transparent'}"
          style="background-color: {theme.color}"
          on:click={() => updatePrefs({ theme: theme.id })}
          title={theme.label}
          aria-label={theme.label}
        ></button>
      {/each}
      
      <div class="relative w-10 h-10">
        <input
          type="color"
          value={preferences.customAccentColor || '#3b82f6'}
          on:input={handleCustomColorChange}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="custom-color"
        />
        <label
          for="custom-color"
          class="flex items-center justify-center w-10 h-10 rounded-full border-4 transition-all hover:scale-110 active:scale-95 {preferences.theme === 'custom' ? 'border-text-primary' : 'border-border-strong'}"
          style="background-color: {preferences.customAccentColor || '#3b82f6'}"
        >
          <svg class="w-4 h-4 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </label>
      </div>
    </div>
  </div>
</div>
