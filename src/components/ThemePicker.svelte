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

const fonts: {
  id: FontFamily;
  label: string;
  class: string;
  isPro?: boolean;
}[] = [
  { id: 'karla', label: 'Sans', class: 'font-[Karla]' },
  {
    id: 'fraunces',
    label: 'Serif',
    class: 'font-[Fraunces]',
    isPro: true,
  },
  {
    id: 'mono',
    label: 'Mono',
    class: 'font-["JetBrains_Mono"]',
    isPro: true,
  },
  { id: 'system', label: 'Sys', class: 'font-sans', isPro: true },
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
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1"
            >Appearance</span
        >
        <div
            class="flex p-1.5 bg-bg-primary rounded-2xl shadow(--shadow-pressed)"
        >
            {#each modes as mode}
                <button
                    class="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all {preferences.colorScheme ===
                    mode.id
                        ? 'bg-surface text-text-primary shadow-(--shadow-ambient)'
                        : 'text-text-tertiary hover:text-text-secondary'}"
                    on:click={() => updatePrefs({ colorScheme: mode.id })}
                >
                    <span class="text-sm">{mode.icon}</span>
                    <span>{mode.label}</span>
                </button>
            {/each}
        </div>
    </div>

    <div class="space-y-4">
        <span
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1"
            >Accent Color</span
        >
        <div class="flex flex-wrap gap-4">
            {#each themes as theme}
                <button
                    class="w-11 h-11 rounded-full border-4 transition-all hover:scale-105 active:scale-95 shadow-(--shadow-ambient) {preferences.theme ===
                    theme.id
                        ? 'border-text-primary'
                        : 'border-transparent'}"
                    style="background-color: {theme.var}"
                    on:click={() => updatePrefs({ theme: theme.id })}
                    title={theme.label}
                    aria-label={theme.label}
                ></button>
            {/each}

            <div class="relative w-11 h-11 group">
                <div
                    class="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg bg-text-primary text-bg-primary text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 shadow-lg translate-y-1 group-hover:translate-y-0 whitespace-nowrap"
                >
                    Unlock Pro
                </div>
                <div
                    class="absolute inset-0 bg-surface/40 backdrop-blur-[0.5px] rounded-full z-10 flex items-center justify-center cursor-not-allowed border-2 border-dashed border-border/50"
                >
                    <svg
                        class="w-3.5 h-3.5 text-text-tertiary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <input
                    id="custom-color-pro"
                    type="color"
                    disabled
                    class="absolute inset-0 w-full h-full opacity-0 cursor-not-allowed z-20"
                />
                <label
                    for="custom-color-pro"
                    class="flex items-center justify-center w-11 h-11 rounded-full border-4 border-transparent shadow-(--shadow-ambient) bg-bg-primary"
                >
                    <svg
                        class="w-5 h-5 text-text-tertiary/30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </label>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <span
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1"
            >Typography</span
        >
        <div
            class="flex p-1.5 bg-bg-primary rounded-2xl shadow-(--shadow-pressed)"
        >
            {#each fonts as font}
                <button
                    disabled={font.isPro}
                    class="flex-1 py-2.5 flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all {font.class}
                 {preferences.fontFamily === font.id
                        ? 'bg-surface text-text-primary shadow-(--shadow-ambient)'
                        : 'text-text-tertiary'}
                 {font.isPro
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:text-text-secondary'}"
                    on:click={() => updatePrefs({ fontFamily: font.id })}
                >
                    <span>{font.label}</span>
                    {#if font.isPro}
                        <span
                            class="text-[7px] font-black uppercase tracking-tighter opacity-60"
                            >Pro</span
                        >
                    {/if}
                </button>
            {/each}
        </div>
    </div>
</div>
