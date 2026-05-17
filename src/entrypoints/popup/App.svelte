<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import type { TabType, UserPreferences } from '../../lib/types';
import { getStorageItem, setStorageItem } from '../../lib/storage';
import TabBar from '../../components/TabBar.svelte';
import ThemePicker from '../../components/ThemePicker.svelte';

// Placeholder components
import Timer from '../../components/Timer.svelte';
import TodoList from '../../components/TodoList.svelte';
import StatsDashboard from '../../components/StatsDashboard.svelte';

let activeTab: TabType = 'timer';
let preferences: UserPreferences | null = null;
let systemDarkMode = false;
let mediaQuery: MediaQueryList;

function handleSystemThemeChange(e: MediaQueryListEvent | MediaQueryList) {
  systemDarkMode = e.matches;
}

onMount(async () => {
  let prefs = await getStorageItem('USER_PREFERENCES');
  if (!prefs) {
    prefs = {
      theme: 'forest',
      colorScheme: 'system',
      fontFamily: 'karla',
      lastActiveTab: 'timer',
    };
  }
  // migration for existing users
  if (!prefs.fontFamily) prefs.fontFamily = 'karla';

  preferences = prefs;
  activeTab = prefs.lastActiveTab;

  // System theme detection
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  handleSystemThemeChange(mediaQuery);
  mediaQuery.addEventListener('change', handleSystemThemeChange);

  applyTheme(prefs);
});

onDestroy(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }
});

$: effectiveDarkMode =
  preferences?.colorScheme === 'system'
    ? systemDarkMode
    : preferences?.colorScheme === 'dark';

$: if (preferences) {
  applyTheme(preferences);
}

function applyTheme(prefs: UserPreferences) {
  document.documentElement.setAttribute('data-theme', prefs.theme);
  document.documentElement.setAttribute(
    'data-dark',
    effectiveDarkMode.toString(),
  );

  // Font mapping
  const fonts: Record<string, string> = {
    karla: '"Karla", sans-serif',
    fraunces: '"Fraunces", serif',
    mono: '"JetBrains Mono", monospace',
    system: 'system-ui, sans-serif',
  };
  document.documentElement.style.setProperty(
    '--font-main',
    fonts[prefs.fontFamily] || fonts.karla,
  );

  if (prefs.theme === 'custom' && prefs.customAccentColor) {
    document.documentElement.style.setProperty(
      '--accent',
      prefs.customAccentColor,
    );
  } else {
    document.documentElement.style.removeProperty('--accent');
  }
}
async function handleTabChange(tab: TabType) {
  activeTab = tab;
  if (preferences) {
    const newPrefs = { ...preferences, lastActiveTab: tab };
    preferences = newPrefs;
    await setStorageItem('USER_PREFERENCES', newPrefs);
  }
}

function handlePrefsUpdate(newPrefs: UserPreferences) {
  preferences = newPrefs;
  applyTheme(newPrefs);
}
</script>

{#if preferences}
    <main
        class="flex flex-col h-full bg-bg-primary transition-colors duration-500 overflow-hidden"
    >
        <!-- Minimalist Header -->
        <header class="h-16 px-8 flex items-center justify-between z-10">
            <div class="flex items-center gap-3 group">
                <div
                    class="w-9 h-9 rounded-xl bg-surface shadow-(--shadow-ambient) flex items-center justify-center transition-all group-hover:scale-105 active:shadow-(--shadow-pressed)"
                >
                    <svg
                        class="w-5 h-5 text-accent"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path
                            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                        />
                    </svg>
                </div>
                <h1 class="text-xl font-bold tracking-tight text-text-primary">
                    {activeTab === "timer"
                        ? "FlowState"
                        : activeTab.charAt(0).toUpperCase() +
                          activeTab.slice(1)}
                </h1>
            </div>

            <button
                class="w-9 h-9 rounded-xl bg-surface shadow-(--shadow-ambient) flex items-center justify-center transition-all hover:scale-105 active:shadow-(--shadow-pressed) {activeTab ===
                'settings'
                    ? 'text-accent'
                    : 'text-text-tertiary'}"
                on:click={() => handleTabChange("settings")}
                aria-label="Settings"
            >
                <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path
                        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                    />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </button>
        </header>

        <div class="flex-1 overflow-hidden px-8 py-4">
            <div
                class="tab-content h-full pb-1 overflow-y-auto scrollbar-none animate-in fade-in duration-700"
            >
                {#if activeTab === "timer"}
                    <Timer />
                {:else if activeTab === "tasks"}
                    <TodoList />
                {:else if activeTab === "stats"}
                    <StatsDashboard />
                {:else if activeTab === "settings"}
                    <div class="space-y-8">
                        <ThemePicker
                            {preferences}
                            onUpdate={handlePrefsUpdate}
                        />
                    </div>
                {/if}
            </div>
        </div>

        <TabBar {activeTab} onTabChange={handleTabChange} />
    </main>
{:else}
    <div class="flex items-center justify-center h-full">
        <p class="text-(--text-secondary)">Loading...</p>
    </div>
{/if}

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>
