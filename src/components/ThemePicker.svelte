<script lang="ts">
import type {
  Theme,
  UserPreferences,
  ColorScheme,
  FontFamily,
} from '../lib/types';
import { setStorageItem } from '../lib/storage';
import Icon from './Icon.svelte';
import ToggleSwitch from './ToggleSwitch.svelte';

let { preferences, onUpdate } = $props<{
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
}>();

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

const fonts: {
  id: FontFamily;
  label: string;
  class: string;
}[] = [
  { id: 'karla', label: 'Sans', class: 'font-[Karla]' },
  {
    id: 'fraunces',
    label: 'Serif',
    class: 'font-[Fraunces]',
  },
  {
    id: 'mono',
    label: 'Mono',
    class: 'font-["JetBrains_Mono"]',
  },
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

<div
    class="space-y-6 p-6 bg-surface rounded-3xl shadow-(--shadow-ambient) border border-border"
>
    <div class="space-y-4">
        <span
            class="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1 mb-2"
            >Appearance</span
        >
        <div
            class="flex p-1.5 bg-bg-primary rounded-2xl shadow(--shadow-pressed)"
        >
            {#each modes as mode}
                <button
                    class="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all cursor-pointer {preferences.colorScheme ===
                    mode.id
                        ? 'bg-surface text-text-primary shadow-(--shadow-ambient)'
                        : 'text-text-tertiary hover:text-text-secondary'}"
                    onclick={() => updatePrefs({ colorScheme: mode.id })}
                >
                    <span class="text-sm">{mode.icon}</span>
                    <span>{mode.label}</span>
                </button>
            {/each}
        </div>
    </div>

    <div class="space-y-4">
        <span
            class="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1 mb-2"
            >Accent Color</span
        >
        <div class="flex flex-wrap gap-4">
            {#each themes as theme}
                <button
                    class="w-11 h-11 rounded-full border-4 transition-all hover:scale-105 active:scale-95 shadow-(--shadow-ambient) cursor-pointer {preferences.theme ===
                    theme.id
                        ? 'border-text-primary'
                        : 'border-transparent'}"
                    style="background-color: {theme.var}"
                    onclick={() => updatePrefs({ theme: theme.id })}
                    title={theme.label}
                    aria-label={theme.label}
                ></button>
            {/each}

            <div class="relative w-11 h-11 group">
                <input
                    id="custom-color-picker"
                    type="color"
                    value={preferences.customAccentColor || '#000000'}
                    oninput={handleCustomColorChange}
                    class="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                />
                <label
                    for="custom-color-picker"
                    class="flex items-center justify-center w-11 h-11 rounded-full border-4 shadow-(--shadow-ambient) transition-all cursor-pointer
                           {preferences.theme === 'custom' ? 'border-text-primary' : 'border-transparent'}"
                    style="background-color: {preferences.customAccentColor || 'var(--bg-primary)'}"
                >
                    {#if preferences.theme === 'custom'}
                        <Icon name="check" class="w-5 h-5 text-text-primary" />
                    {:else}
                        <Icon name="plus" class="w-5 h-5 text-text-tertiary/30" />
                    {/if}
                </label>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <span
            class="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1 mb-2"
            >Typography</span
        >
        <div
            class="flex p-1.5 bg-bg-primary rounded-2xl shadow-(--shadow-pressed)"
        >
            {#each fonts as font}
                <button
                    class="flex-1 py-2.5 flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all {font.class} cursor-pointer
                 {preferences.fontFamily === font.id
                        ? 'bg-surface text-text-primary shadow-(--shadow-ambient)'
                        : 'text-text-tertiary hover:text-text-secondary'}"
                    onclick={() => updatePrefs({ fontFamily: font.id })}
                >
                    <span>{font.label}</span>
                </button>
            {/each}
        </div>
    </div>

    <div class="space-y-4">
        <span
            class="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1 mb-2"
            >Timer Settings</span
        >
        <div
            class="flex items-center justify-between p-4 bg-bg-primary rounded-2xl shadow-(--shadow-pressed)"
        >
            <div class="flex flex-col gap-0.5">
                <span class="text-xs font-semibold text-text-primary">Show Skip Button</span>
                <span class="text-[10px] text-text-tertiary">Allow skipping focus and break timers</span>
            </div>
            <ToggleSwitch
                checked={preferences.showSkipButton ?? true}
                onchange={(checked) => updatePrefs({ showSkipButton: checked })}
                aria-label="Toggle Show Skip Button"
            />
        </div>
    </div>

    <div class="space-y-4">
        <span
            class="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1 mb-2"
            >Task Settings</span
        >
        <div
            class="flex items-center justify-between p-4 bg-bg-primary rounded-2xl shadow-(--shadow-pressed)"
        >
            <div class="flex flex-col gap-0.5">
                <span class="text-xs font-semibold text-text-primary">Move High Priority to Top</span>
                <span class="text-[10px] text-text-tertiary">Automatically group urgent tasks at the top</span>
            </div>
            <ToggleSwitch
                checked={preferences.moveHighPriorityToTop ?? true}
                onchange={(checked) => updatePrefs({ moveHighPriorityToTop: checked })}
                aria-label="Toggle Move High Priority to Top"
            />
        </div>
    </div>
</div>
