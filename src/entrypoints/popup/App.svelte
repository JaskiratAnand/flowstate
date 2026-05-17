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
      theme: 'ocean',
      colorScheme: 'system',
      lastActiveTab: 'timer',
    };
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
  <main class="flex flex-col h-full overflow-hidden">
    <header class="h-16 px-6 flex items-center justify-between border-b border-border bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent-soft">
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <h1 class="text-lg font-bold tracking-tight text-text-primary">FocusFlow</h1>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
        <span class="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Live</span>
      </div>
    </header>

    <div class="tab-content relative flex-1">
      {#if activeTab === 'timer'}
        <Timer />
        <div class="mt-8">
            <ThemePicker {preferences} onUpdate={handlePrefsUpdate} />
        </div>
      {:else if activeTab === 'tasks'}
        <TodoList />
      {:else if activeTab === 'stats'}
        <StatsDashboard />
      {/if}
    </div>

    <TabBar {activeTab} onTabChange={handleTabChange} />
  </main>
{:else}
  <div class="flex items-center justify-center h-full">
    <p class="text-[var(--text-secondary)]">Loading...</p>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
