<script lang="ts">
import type { TabType } from '../lib/types';

let { activeTab, onTabChange } = $props<{
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}>();

const tabs: { id: TabType; label: string; icon: string }[] = [
  {
    id: 'timer',
    label: 'Timer',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];
</script>

<nav
    class="fixed bottom-0 w-full px-8 pb-5 pt-12 flex justify-between items-end bg-linear-to-t from-bg-primary via-bg-primary/90 to-transparent pointer-events-none"
>
    {#each tabs as tab}
        <button
            class="w-14 h-14 flex items-center justify-center rounded-full transition-all pointer-events-auto cursor-pointer
             {activeTab === tab.id
                ? 'bg-surface text-accent shadow-(--shadow-ambient)'
                : 'text-text-tertiary hover:text-text-primary hover:bg-surface/50'}"
            onclick={() => onTabChange(tab.id)}
            aria-label={tab.label}
        >
            <svg
                class="w-6 h-6 transition-transform {activeTab === tab.id
                    ? 'scale-110'
                    : ''}"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d={tab.icon} />
            </svg>
        </button>
    {/each}
</nav>
