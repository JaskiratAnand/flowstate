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
</script>

<div class="grid grid-cols-2 gap-4">
  <div class="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col gap-1">
    <span class="text-[10px] uppercase font-bold tracking-wider opacity-60">Daily Streak</span>
    <span class="text-3xl font-bold">{stats?.currentStreak || 0}</span>
    <span class="text-[10px] opacity-60">days active</span>
  </div>

  <div class="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col gap-1">
    <span class="text-[10px] uppercase font-bold tracking-wider opacity-60">Today's Focus</span>
    <span class="text-3xl font-bold">{stats?.dailyPomodoros || 0}</span>
    <span class="text-[10px] opacity-60">sessions</span>
  </div>

  <div class="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col gap-1">
    <span class="text-[10px] uppercase font-bold tracking-wider opacity-60">Daily Tasks</span>
    <span class="text-3xl font-bold">{stats?.dailyTasksCompleted || 0}</span>
    <span class="text-[10px] opacity-60">completed</span>
  </div>

  <div class="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col gap-1">
    <span class="text-[10px] uppercase font-bold tracking-wider opacity-60">Total Sessions</span>
    <span class="text-3xl font-bold">{stats?.allTimePomodoros || 0}</span>
    <span class="text-[10px] opacity-60">all-time</span>
  </div>
</div>
