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

<nav class="flex p-2 gap-1 bg-bg-secondary border-t border-border">
  {#each tabs as tab}
    <button
      class="flex-1 py-3 flex flex-col items-center gap-1 rounded-2xl transition-all {activeTab === tab.id ? 'bg-bg-primary text-accent shadow-sm' : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-primary/50'}"
      on:click={() => onTabChange(tab.id)}
    >
      <span class="text-lg transition-transform {activeTab === tab.id ? 'scale-110' : 'grayscale opacity-70'}">{tab.icon}</span>
      <span class="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
    </button>
  {/each}
</nav>
