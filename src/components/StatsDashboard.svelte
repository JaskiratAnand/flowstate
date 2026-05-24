<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { browser } from 'wxt/browser';
import { getStorageItem, STORAGE_KEYS } from '../lib/storage';
import type { Stats } from '../lib/types';

let stats = $state<Stats | null>(null);

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
  {
    label: 'Current Streak',
    key: 'currentStreak',
    unit: 'days',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'text-orange-500',
  },
  {
    label: "Today's Focus",
    key: 'dailyPomodoros',
    unit: 'sessions',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-accent',
  },
  {
    label: 'Tasks Done',
    key: 'dailyTasksCompleted',
    unit: 'tasks',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-emerald-500',
  },
  {
    label: 'All-Time Total',
    key: 'allTimePomodoros',
    unit: 'sessions',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z',
    color: 'text-amber-500',
  },
];
</script>

<div class="grid grid-cols-2 gap-5 pb-10">
    {#each cards as card}
        <div
            class="p-6 bg-surface shadow-(--shadow-ambient) rounded-[28px] flex flex-col gap-5 transition-all hover:scale-[1.02]"
        >
            <div
                class="w-11 h-11 rounded-2xl bg-bg-primary shadow-(--shadow-pressed) flex items-center justify-center {card.color}"
            >
                <svg
                    class="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d={card.icon} />
                </svg>
            </div>
            <div class="flex flex-col">
                <span
                    class="text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary mb-2"
                    >{card.label}</span
                >
                <div class="flex items-baseline gap-1.5">
                    <span
                        class="text-4xl font-light tracking-tight text-text-primary tabular-nums"
                    >
                        {stats ? (stats as any)[card.key] || 0 : 0}
                    </span>
                    <span
                        class="text-[10px] font-bold uppercase text-text-tertiary tracking-wider opacity-60"
                        >{card.unit}</span
                    >
                </div>
            </div>
        </div>
    {/each}
</div>
