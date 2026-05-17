<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { browser } from 'wxt/browser';
import { getStorageItem, STORAGE_KEYS } from '../lib/storage';
import type { Stats } from '../lib/types';

let stats: Stats | null = null;

onMount(async () => {
  stats = await getStorageItem('STATS');
  browser.storage.onChanged.addListener(handleStorageChange);
});

onDestroy(() => {
  browser.storage.onChanged.removeListener(handleStorageChange);
});

function handleStorageChange(changes: Record<string, any>, areaName: string) {
  if (areaName === 'local' && changes[STORAGE_KEYS.STATS]) {
    stats = changes[STORAGE_KEYS.STATS].newValue;
  }
}

const cards = [
  { label: 'Current Streak', key: 'currentStreak', unit: 'days', icon: '🔥' },
  {
    label: "Today's Focus",
    key: 'dailyPomodoros',
    unit: 'sessions',
    icon: '⏱️',
  },
  {
    label: 'Tasks Completed',
    key: 'dailyTasksCompleted',
    unit: 'tasks',
    icon: '✅',
  },
  {
    label: 'All-Time Total',
    key: 'allTimePomodoros',
    unit: 'sessions',
    icon: '🏆',
  },
];
</script>

<div class="grid grid-cols-2 gap-4">
  {#each cards as card}
    <div class="p-5 bg-bg-secondary border border-border rounded-[24px] flex flex-col gap-4 group hover:border-accent transition-all hover:shadow-md">
      <div class="w-10 h-10 rounded-xl bg-bg-primary border border-border flex items-center justify-center text-xl group-hover:bg-accent-soft transition-colors">
        {card.icon}
      </div>
      <div class="flex flex-col">
        <span class="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">{card.label}</span>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-bold tracking-tight text-text-primary">
            {stats ? (stats as any)[card.key] : 0}
          </span>
          <span class="text-[10px] font-medium text-text-tertiary">{card.unit}</span>
        </div>
      </div>
    </div>
  {/each}
</div>
