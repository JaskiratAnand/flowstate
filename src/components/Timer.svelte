<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { browser } from 'wxt/browser';
import { getStorageItem, STORAGE_KEYS } from '../lib/storage';
import { useTimer } from '../lib/timer-store.svelte';
import type { TimerConfig } from '../lib/types';
import TimerConfigComp from './TimerConfig.svelte';
import Icon from './Icon.svelte';

let { onOpenFocusShield = () => {} } = $props<{
  onOpenFocusShield?: () => void;
}>();

const timer = useTimer();
let config = $state<TimerConfig | null>(null);
let showConfig = $state(false);
let blockingEnabled = $state(true);

onMount(async () => {
  config = (await getStorageItem('TIMER_CONFIG')) || {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  };

  const blockingConfig = await getStorageItem('BLOCKING_CONFIG');
  blockingEnabled = blockingConfig ? blockingConfig.enabled : true;

  browser.storage.onChanged.addListener(handleStorageChange);
});

onDestroy(() => {
  browser.storage.onChanged.removeListener(handleStorageChange);
});

function handleStorageChange(changes: Record<string, any>, areaName: string) {
  if (areaName !== 'local') return;

  if (changes[STORAGE_KEYS.TIMER_CONFIG]) {
    config = changes[STORAGE_KEYS.TIMER_CONFIG].newValue;
  }

  if (changes[STORAGE_KEYS.BLOCKING_CONFIG]) {
    const newBlockingConfig = changes[STORAGE_KEYS.BLOCKING_CONFIG].newValue;
    blockingEnabled = newBlockingConfig ? newBlockingConfig.enabled : true;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

let timerState = $derived(timer.state);

let label = $derived(
  timerState?.sessionType === 'work'
    ? 'Focus'
    : timerState?.sessionType === 'short-break'
      ? 'Short Break'
      : 'Long Break',
);

let totalSeconds = $derived(
  config
    ? (timerState?.sessionType === 'work'
        ? config.workDuration
        : timerState?.sessionType === 'short-break'
          ? config.shortBreakDuration
          : config.longBreakDuration) * 60
    : 25 * 60,
);

// Local visual timer countdown emulation
let displaySeconds = $state(25 * 60);

$effect(() => {
  const s = timerState;
  if (s?.status === 'running' && s.expectedEndTime) {
    const update = () => {
      displaySeconds = Math.max(
        0,
        Math.ceil((s.expectedEndTime! - Date.now()) / 1000),
      );
    };
    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  } else {
    displaySeconds = s ? s.remainingSeconds : 25 * 60;
  }
});

let progress = $derived(
  timerState ? Math.max(0, Math.min(1, 1 - displaySeconds / totalSeconds)) : 0,
);
let dashArray = 2 * Math.PI * 106; // radius = 106
let dashOffset = $derived(dashArray * (1 - progress));

function handleDialClick() {
  if (timerState?.status === 'running') {
    timer.pause();
  } else {
    timer.start();
  }
}
</script>

<div class="flex flex-col items-center pb-20">
    <!-- Mode Label -->
    <header class="pt-0 pb-4 text-center">
        <h1
            class="text-text-tertiary text-[12px] font-bold tracking-[0.2em] uppercase"
        >
            {label}
        </h1>
    </header>

    <!-- Main Dial Area -->
    <main class="flex flex-col items-center justify-center relative">
        <button
            class="relative w-55 h-55 rounded-full bg-surface flex items-center justify-center transition-all duration-300 group select-none active:scale-[0.98]
             {timerState?.status === 'running'
                ? 'shadow-(--shadow-ambient)'
                : 'shadow-(--shadow-pressed)'}"
            onclick={handleDialClick}
            aria-label={timerState?.status === "running" ? "Pause" : "Start"}
        >
            <!-- SVG Progress Ring -->
            <svg
                class="absolute inset-0 w-full h-full pointer-events-none -rotate-90"
                viewBox="0 0 220 220"
            >
                <!-- Track -->
                <circle
                    cx="110"
                    cy="110"
                    r="106"
                    fill="transparent"
                    stroke="currentColor"
                    stroke-width="4"
                    class="text-border opacity-20"
                />
                <!-- Progress -->
                <circle
                    cx="110"
                    cy="110"
                    r="106"
                    fill="transparent"
                    stroke="var(--accent)"
                    stroke-width="4"
                    stroke-linecap="round"
                    style="stroke-dasharray: {dashArray}; stroke-dashoffset: {dashOffset};"
                    class="transition-all duration-1000 ease-linear {timerState?.status ===
                    'running'
                        ? 'opacity-100'
                        : 'opacity-0'}"
                />
            </svg>

            <!-- Timer Display -->
            <div
                class="timer-text text-text-primary text-[56px] font-light tracking-tight tabular-nums transition-opacity duration-300
                  {timerState?.status === 'paused'
                    ? 'opacity-50 animate-pulse'
                    : 'opacity-100'}"
            >
                {timerState ? formatTime(displaySeconds) : "25:00"}
            </div>
        </button>
    </main>

    <!-- Session Progress Dots -->
    <div class="py-6 flex gap-4">
        {#each Array(4) as _, i}
            <div
                class="w-3 h-3 rounded-full transition-all duration-500
               {(timerState?.completedSessions || 0) % 4 > i
                    ? 'bg-accent shadow-[0_0_12px_var(--accent-soft)] scale-110'
                    : 'bg-bg-secondary shadow-(--shadow-pressed)'}"
            ></div>
        {/each}
    </div>

    <!-- Quick Actions -->
    <div class="flex items-center gap-8 mb-10">
        <button
            class="p-4 rounded-full bg-surface shadow-(--shadow-ambient) text-text-tertiary hover:text-text-primary transition-all active:shadow-(--shadow-pressed) active:scale-95"
            onclick={() => timer.reset()}
            title="Reset"
        >
            <Icon name="reset" class="w-5 h-5" />
        </button>

        <button
            class="p-5 rounded-full bg-surface shadow-(--shadow-ambient) text-accent transition-all active:shadow-(--shadow-pressed) active:scale-95"
            onclick={handleDialClick}
            title={timerState?.status === "running" ? "Pause" : "Start"}
        >
            {#if timerState?.status === "running"}
                <Icon name="pause" class="w-6 h-6" />
            {:else}
                <Icon name="play" class="w-6 h-6 translate-x-0.5" />
            {/if}
        </button>

        <button
            class="p-4 rounded-full bg-surface shadow-(--shadow-ambient) text-text-tertiary hover:text-text-primary transition-all active:shadow-(--shadow-pressed) active:scale-95"
            onclick={() => timer.skip()}
            title="Skip"
        >
            <Icon name="skip" class="w-5 h-5" />
        </button>
    </div>

    <!-- Settings Expandable -->
    <div class="w-full">
        <button
            class="w-full py-4 px-6 flex items-center justify-between rounded-2xl bg-surface shadow-(--shadow-ambient) hover:bg-bg-primary transition-all active:shadow-(--shadow-pressed)"
            onclick={() => (showConfig = !showConfig)}
        >
            <span class="text-sm font-semibold text-text-secondary"
                >Adjust Durations</span
            >
            <Icon name="chevron-down" class="w-4 h-4 text-text-tertiary transition-transform duration-300 {showConfig ? 'rotate-180' : ''}" />
        </button>

        {#if showConfig && config}
            <div
                class="mt-4 animate-in fade-in slide-in-from-top-4 duration-500"
            >
                <TimerConfigComp bind:config />
            </div>
        {/if}
    </div>

    <!-- Focus Shield Shortcut -->
    <button
        type="button"
        class="w-full mt-4 py-4 px-6 flex items-center justify-between rounded-2xl bg-surface shadow-(--shadow-ambient) hover:bg-bg-primary transition-all active:shadow-(--shadow-pressed) select-none"
        onclick={onOpenFocusShield}
    >
        <div class="flex items-center gap-3">
            <Icon name="shield" class="w-5 h-5 text-accent" />
            <span class="text-sm font-semibold text-text-secondary">Focus Shield</span>
        </div>
        <div class="flex items-center gap-2">
            <span
                class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style="background-color: color-mix(in srgb, {blockingEnabled ? 'var(--color-green)' : 'var(--text-tertiary)'} 15%, transparent); color: {blockingEnabled ? 'var(--color-green)' : 'var(--text-tertiary)'};"
            >
                {blockingEnabled ? 'Active' : 'Off'}
            </span>
            <Icon name="chevron-right" class="w-4 h-4 text-text-tertiary" />
        </div>
    </button>
</div>
