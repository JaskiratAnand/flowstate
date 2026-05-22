<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { fade } from 'svelte/transition';
import type { TabType, UserPreferences } from '../../lib/types';
import { getStorageItem, setStorageItem } from '../../lib/storage';
import TabBar from '../../components/TabBar.svelte';
import ThemePicker from '../../components/ThemePicker.svelte';

// Placeholder components
import Timer from '../../components/Timer.svelte';
import TodoList from '../../components/TodoList.svelte';
import StatsDashboard from '../../components/StatsDashboard.svelte';
import About from '../../components/About.svelte';
import BlockingModal from '../../components/BlockingModal.svelte';

let activeTab: TabType = 'timer';
let preferences: UserPreferences | null = null;
let systemDarkMode = false;
let mediaQuery: MediaQueryList;
let showBlockingModal = false;

let showSettingsScrollHint = false;

function handleScroll(e: Event) {
  if (activeTab === 'settings') {
    const target = e.currentTarget as HTMLElement;
    if (target.scrollTop > 10) {
      showSettingsScrollHint = false;
    } else {
      showSettingsScrollHint = true;
    }
  }
}

$: if (activeTab === 'settings') {
  showSettingsScrollHint = true;
  setTimeout(() => {
    const container = document.querySelector('.tab-content');
    if (container) {
      container.scrollTop = 0;
    }
  }, 0);
} else {
  showSettingsScrollHint = false;
}

function handleSystemThemeChange(e: MediaQueryListEvent | MediaQueryList) {
  systemDarkMode = e.matches;
}

onMount(async () => {
  let prefs = await getStorageItem('USER_PREFERENCES');
  let updated = false;
  if (!prefs) {
    prefs = {
      theme: 'forest',
      colorScheme: 'system',
      fontFamily: 'karla',
      lastActiveTab: 'timer',
      moveHighPriorityToTop: true,
    };
    updated = true;
  }
  // migration for existing users
  if (!prefs.fontFamily) {
    prefs.fontFamily = 'karla';
    updated = true;
  }
  if (prefs.moveHighPriorityToTop === undefined) {
    prefs.moveHighPriorityToTop = true;
    updated = true;
  }

  // Lock pro features if active
  if (prefs.theme === 'custom') {
    prefs.theme = 'forest';
    updated = true;
  }
  if (prefs.fontFamily !== 'karla') {
    prefs.fontFamily = 'karla';
    updated = true;
  }

  if (updated) {
    await setStorageItem('USER_PREFERENCES', prefs);
  }

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
        <header class="h-16 pt-4 px-8 flex items-center justify-between z-10">
            <button
                class="flex items-center gap-3 group text-left"
                on:click={() => handleTabChange("about")}
                aria-label="About FlowState"
            >
                <div
                    class="w-9 h-9 rounded-xl bg-surface shadow-(--shadow-ambient) flex items-center justify-center transition-all group-hover:scale-105 active:shadow-(--shadow-pressed) {activeTab ===
                    'about'
                        ? 'text-accent shadow-(--shadow-pressed)'
                        : 'text-accent'}"
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
            </button>

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

        <div class="flex-1 overflow-hidden px-8 pt-2 pb-4">
            <div
                class="tab-content h-full overflow-y-auto scrollbar-none animate-in fade-in duration-700"
                on:scroll={handleScroll}
            >
                {#if activeTab === "timer"}
                    <Timer onOpenFocusShield={() => (showBlockingModal = true)} />
                {:else if activeTab === "tasks"}
                    <TodoList />
                {:else if activeTab === "stats"}
                    <StatsDashboard />
                {:else if activeTab === "about"}
                    <About />
                {:else if activeTab === "settings"}
                    <div class="space-y-8 pb-24">
                        <ThemePicker
                            {preferences}
                            onUpdate={handlePrefsUpdate}
                        />
                        <div class="space-y-4 pt-4 border-t border-border/50">
                            <span
                                class="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary px-1"
                                >Focus Shield</span
                            >
                            <button
                                type="button"
                                class="w-full p-4 flex items-center justify-between bg-surface rounded-2xl shadow-(--shadow-ambient) border border-border hover:scale-[1.01] active:scale-[0.99] transition-all"
                                on:click={() => (showBlockingModal = true)}
                            >
                                <div class="flex items-center gap-3">
                                    <svg
                                        class="w-5 h-5 text-accent"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    <div
                                        class="flex flex-col items-start text-left gap-0.5"
                                    >
                                        <span
                                            class="text-xs font-semibold text-text-primary"
                                            >Configure Blocker</span
                                        >
                                        <span
                                            class="text-[10px] text-text-tertiary"
                                            >Set blocked domains & bypass
                                            durations</span
                                        >
                                    </div>
                                </div>
                                <svg
                                    class="w-4 h-4 text-text-tertiary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {#if showSettingsScrollHint}
                        <div
                            transition:fade={{ duration: 200 }}
                            class="fixed bottom-22 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-border shadow-(--shadow-ambient) text-text-secondary text-[10px] font-semibold uppercase tracking-wider pointer-events-none transition-all duration-300"
                            style="background-color: var(--surface-raised);"
                            aria-hidden="true"
                        >
                            <span>Scroll to explore</span>
                            <svg
                                class="w-3.5 h-3.5 text-accent animate-bounce"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                viewBox="0 0 24 24"
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>

        <TabBar {activeTab} onTabChange={handleTabChange} />
        {#if showBlockingModal}
            <BlockingModal onClose={() => (showBlockingModal = false)} />
        {/if}
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
