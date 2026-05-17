<script lang="ts">
import { onMount } from 'svelte';
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

onMount(async () => {
  let prefs = await getStorageItem('USER_PREFERENCES');
  if (!prefs) {
    prefs = {
      theme: 'ocean',
      darkMode: false,
      lastActiveTab: 'timer',
    };
  }
  preferences = prefs;
  activeTab = prefs.lastActiveTab;
  applyTheme(prefs);
});

function applyTheme(prefs: UserPreferences) {
  document.documentElement.setAttribute('data-theme', prefs.theme);
  document.documentElement.setAttribute('data-dark', prefs.darkMode.toString());
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
    <header class="p-4 flex items-center justify-between border-b border-[var(--border)]">
      <h1 class="text-xl font-bold tracking-tight">FocusFlow</h1>
      <!-- Theme picker could also be here or in settings, PRD says in Timer Config -->
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
