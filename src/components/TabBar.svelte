<script lang="ts">
import type { TabType } from '../lib/types';

export let activeTab: TabType;
export let onTabChange: (tab: TabType) => void;

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'timer', label: 'Timer', icon: '⏱️' },
  { id: 'tasks', label: 'Tasks', icon: '✅' },
  { id: 'stats', label: 'Stats', icon: '📊' },
];
</script>

<nav class="flex border-t border-[var(--border)] bg-[var(--surface)]">
  {#each tabs as tab}
    <button
      class="flex-1 py-3 flex flex-col items-center gap-1 transition-colors {activeTab === tab.id ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'}"
      on:click={() => onTabChange(tab.id)}
    >
      <span class="text-xl">{tab.icon}</span>
      <span class="text-xs">{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  button:hover {
    background-color: var(--surface);
    opacity: 0.8;
  }
</style>
