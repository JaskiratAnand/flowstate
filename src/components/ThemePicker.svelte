<script lang="ts">
import type {
  Theme,
  UserPreferences,
  ColorScheme,
  FontFamily,
} from '../lib/types';
import { setStorageItem } from '../lib/storage';

export let preferences: UserPreferences;
export let onUpdate: (prefs: UserPreferences) => void;

const themes: { id: Theme; var: string; label: string }[] = [
  { id: 'forest', var: 'var(--color-forest)', label: 'Forest' },
  { id: 'ocean', var: 'var(--color-ocean)', label: 'Ocean' },
  { id: 'sunset', var: 'var(--color-sunset)', label: 'Sunset' },
];

const modes: { id: ColorScheme; icon: string; label: string }[] = [
  { id: 'light', icon: '☀️', label: 'Light' },
  { id: 'dark', icon: '🌙', label: 'Dark' },
  { id: 'system', icon: '💻', label: 'System' },
];

const fonts: { id: FontFamily; label: string; class: string }[] = [
  { id: 'karla', label: 'Sans', class: 'font-[Karla]' },
  { id: 'fraunces', label: 'Serif', class: 'font-[Fraunces]' },
  { id: 'mono', label: 'Mono', class: 'font-["JetBrains_Mono"]' },
  { id: 'system', label: 'Sys', class: 'font-sans' },
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
          class="w-11 h-11 rounded-full border-4 transition-all hover:scale-105 active:scale-95 shadow-[var(--shadow-ambient)] {preferences.theme === theme.id ? 'border-text-primary' : 'border-transparent'}"
          style="background-color: {theme.var}"
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
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          id="custom-color"
        />
        <label
          for="custom-color"
          class="flex items-center justify-center w-11 h-11 rounded-full border-4 transition-all hover:scale-105 active:scale-95 shadow-[var(--shadow-ambient)]
                 {preferences.theme === 'custom' ? 'border-text-primary' : 'border-transparent'}"
          style="background-color: {preferences.theme === 'custom' ? (preferences.customAccentColor || 'var(--accent)') : 'var(--bg-primary)'}"
        >
          <svg 
            class="w-5 h-5 drop-shadow-sm transition-colors {preferences.theme === 'custom' ? 'text-white' : 'text-text-tertiary'}" 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </label>
      </div>
    </div>
  </div>

  <div class="space-y-4">
    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1">Typography</span>
    <div class="flex p-1.5 bg-bg-primary rounded-2xl shadow-[var(--shadow-pressed)]">
      {#each fonts as font}
        <button
          class="flex-1 py-2.5 flex items-center justify-center rounded-xl text-xs font-semibold transition-all {font.class} {preferences.fontFamily === font.id ? 'bg-surface text-text-primary shadow-[var(--shadow-ambient)]' : 'text-text-tertiary hover:text-text-secondary'}"
          on:click={() => updatePrefs({ fontFamily: font.id })}
        >
          <span>{font.label}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
