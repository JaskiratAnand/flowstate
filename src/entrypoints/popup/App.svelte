<script lang="ts">
import { onMount, onDestroy } from 'svelte';
const isPro = import.meta.env.WXT_PRO_VERSION === 'true';
import type { TabType, UserPreferences } from '../../lib/types';
import { getStorageItem, setStorageItem } from '../../lib/storage';
import TabBar from '../../components/TabBar.svelte';
import ThemePicker from '../../components/ThemePicker.svelte';

import Timer from '../../components/Timer.svelte';
import TodoList from '../../components/TodoList.svelte';
import StatsDashboard from '../../components/StatsDashboard.svelte';
import About from '../../components/About.svelte';
import BlockingModal from '../../components/BlockingModal.svelte';
import Icon from '../../components/Icon.svelte';
import ScrollHint from '../../components/ScrollHint.svelte';

let activeTab = $state<TabType>('timer');
let preferences = $state<UserPreferences | null>(null);
let systemDarkMode = $state(false);
let mediaQuery: MediaQueryList;
let showBlockingModal = $state(false);

let showSettingsScrollHint = $state(false);

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

$effect(() => {
  if (activeTab === 'settings') {
    showSettingsScrollHint = true;
    const container = document.querySelector('.tab-content');
    if (container) {
      container.scrollTop = 0;
    }
  } else {
    showSettingsScrollHint = false;
  }
});

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
      showSkipButton: true,
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
  if (prefs.showSkipButton === undefined) {
    prefs.showSkipButton = true;
    updated = true;
  }

  // Lock pro features if active
  if (!isPro) {
    if (prefs.theme === 'custom') {
      prefs.theme = 'forest';
      updated = true;
    }
    if (prefs.fontFamily !== 'karla') {
      prefs.fontFamily = 'karla';
      updated = true;
    }
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

let effectiveDarkMode = $derived(
  preferences?.colorScheme === 'system'
    ? systemDarkMode
    : preferences?.colorScheme === 'dark',
);

$effect(() => {
  if (preferences) {
    applyTheme(preferences);
  }
});

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
}
</script>

{#if preferences}
    <main
        class="flex flex-col h-full bg-bg-primary transition-colors duration-500 overflow-hidden"
    >
        <!-- Minimalist Header -->
        <header class="h-16 pt-4 px-8 flex items-center justify-between z-10">
            <button
                class="flex items-center gap-3 group text-left cursor-pointer"
                onclick={() => handleTabChange("about")}
                aria-label="About FlowState"
            >
                <div
                    class="w-9 h-9 rounded-xl bg-surface shadow-(--shadow-ambient) flex items-center justify-center transition-all group-hover:scale-105 active:shadow-(--shadow-pressed) {activeTab ===
                    'about'
                        ? 'text-accent shadow-(--shadow-pressed)'
                        : 'text-accent'}"
                >
                    <Icon name="sun" class="w-5 h-5 text-accent" />
                </div>
                <div class="flex items-center gap-2">
                    <h1
                        class="text-xl font-bold tracking-tight text-text-primary"
                    >
                        {activeTab === "timer"
                            ? "FlowState"
                            : activeTab.charAt(0).toUpperCase() +
                              activeTab.slice(1)}
                    </h1>
                    {#if isPro}
                        <span
                            class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent/15 text-accent select-none"
                            >PRO</span
                        >
                    {/if}
                </div>
            </button>

            <button
                class="w-9 h-9 rounded-xl bg-surface shadow-(--shadow-ambient) flex items-center justify-center transition-all hover:scale-105 active:shadow-(--shadow-pressed) cursor-pointer {activeTab ===
                'settings'
                    ? 'text-accent'
                    : 'text-text-tertiary'}"
                onclick={() => handleTabChange("settings")}
                aria-label="Settings"
            >
                <Icon name="settings" class="w-5 h-5" />
            </button>
        </header>

        <div class="flex-1 overflow-hidden px-8 pt-2 pb-4">
            <div
                class="tab-content h-full overflow-y-auto scrollbar-none animate-in fade-in duration-700"
                onscroll={handleScroll}
            >
                {#if activeTab === "timer"}
                    <Timer
                        onOpenFocusShield={() => (showBlockingModal = true)}
                    />
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
                                class="w-full p-4 flex items-center justify-between bg-surface rounded-2xl shadow-(--shadow-ambient) border border-border hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                                onclick={() => (showBlockingModal = true)}
                            >
                                <div class="flex items-center gap-3">
                                    <Icon name="shield" class="w-5 h-5 text-accent" />
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
                                <Icon name="chevron-right" class="w-4 h-4 text-text-tertiary" />
                            </button>
                        </div>
                    </div>
                    <ScrollHint show={showSettingsScrollHint} />
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
