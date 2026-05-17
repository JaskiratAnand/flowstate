<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { browser } from 'wxt/browser';
import { getStorageItem, STORAGE_KEYS } from '../lib/storage';
import type { TimerState, TimerConfig } from '../lib/types';
import TimerConfigComp from './TimerConfig.svelte';

let state: TimerState | null = null;
let config: TimerConfig | null = null;
let showConfig = false;

onMount(async () => {
  state = (await getStorageItem('TIMER_STATE')) || {
    status: 'idle',
    remainingSeconds: 25 * 60,
    sessionType: 'work',
    completedSessions: 0,
  };
  config = (await getStorageItem('TIMER_CONFIG')) || {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  };

  browser.storage.onChanged.addListener(handleStorageChange);
});

onDestroy(() => {
  browser.storage.onChanged.removeListener(handleStorageChange);
});

function handleStorageChange(changes: Record<string, any>, areaName: string) {
  if (areaName !== 'local') return;

  if (changes[STORAGE_KEYS.TIMER_STATE]) {
    state = changes[STORAGE_KEYS.TIMER_STATE].newValue;
  }
  if (changes[STORAGE_KEYS.TIMER_CONFIG]) {
    config = changes[STORAGE_KEYS.TIMER_CONFIG].newValue;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function sendMessage(type: string) {
  browser.runtime.sendMessage({ type });
}

$: label =
  state?.sessionType === 'work'
    ? 'Focus'
    : state?.sessionType === 'short-break'
      ? 'Short Break'
      : 'Long Break';

$: totalSeconds = config 
  ? (state?.sessionType === 'work' 
      ? config.workDuration 
      : state?.sessionType === 'short-break' 
        ? config.shortBreakDuration 
        : config.longBreakDuration) * 60
  : 25 * 60;

$: progress = state ? (1 - state.remainingSeconds / totalSeconds) : 0;
$: dashArray = 2 * Math.PI * 106; // radius = 106
$: dashOffset = dashArray * (1 - progress);

function handleDialClick() {
  if (state?.status === 'running') {
    sendMessage('PAUSE_TIMER');
  } else {
    sendMessage('START_TIMER');
  }
}
</script>

<div class="flex flex-col items-center">
  <!-- Mode Label -->
  <header class="pt-2 pb-8 text-center">
    <h1 class="text-text-tertiary text-[12px] font-bold tracking-[0.2em] uppercase">
      {label}
    </h1>
  </header>

  <!-- Main Dial Area -->
  <main class="flex flex-col items-center justify-center relative mb-12">
    <button 
      class="relative w-[220px] h-[220px] rounded-full bg-surface flex items-center justify-center transition-all duration-300 group select-none active:scale-[0.98]
             {state?.status === 'running' ? 'shadow-[var(--shadow-ambient)]' : 'shadow-[var(--shadow-pressed)]'}"
      on:click={handleDialClick}
      aria-label={state?.status === 'running' ? 'Pause' : 'Start'}
    >
      <!-- SVG Progress Ring -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none -rotate-90" viewBox="0 0 220 220">
        <!-- Track -->
        <circle 
          cx="110" cy="110" r="106" 
          fill="transparent" 
          stroke="currentColor" 
          stroke-width="4"
          class="text-border opacity-20"
        />
        <!-- Progress -->
        <circle 
          cx="110" cy="110" r="106" 
          fill="transparent" 
          stroke="var(--accent)" 
          stroke-width="4"
          stroke-linecap="round"
          style="stroke-dasharray: {dashArray}; stroke-dashoffset: {dashOffset};"
          class="transition-all duration-1000 ease-linear {state?.status === 'running' ? 'opacity-100' : 'opacity-0'}"
        />
      </svg>

      <!-- Timer Display -->
      <div class="timer-text text-text-primary text-[56px] font-light tracking-tight tabular-nums transition-opacity duration-300
                  {state?.status === 'paused' ? 'opacity-50 animate-pulse' : 'opacity-100'}">
        {state ? formatTime(state.remainingSeconds) : '25:00'}
      </div>
    </button>
  </main>

  <!-- Quick Actions -->
  <div class="flex items-center gap-8 mb-10">
    <button
      class="p-4 rounded-full bg-surface shadow-[var(--shadow-ambient)] text-text-tertiary hover:text-text-primary transition-all active:shadow-[var(--shadow-pressed)] active:scale-95"
      on:click={() => sendMessage('RESET_TIMER')}
      title="Reset"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
    </button>

    <button
      class="p-4 rounded-full bg-surface shadow-[var(--shadow-ambient)] text-text-tertiary hover:text-text-primary transition-all active:shadow-[var(--shadow-pressed)] active:scale-95"
      on:click={() => sendMessage('SKIP_SESSION')}
      title="Skip"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 4l10 8-10 8V4z"/>
        <line x1="19" y1="5" x2="19" y2="19"/>
      </svg>
    </button>
  </div>

  <!-- Settings Expandable -->
  <div class="w-full">
    <button 
      class="w-full py-4 px-6 flex items-center justify-between rounded-2xl bg-surface shadow-[var(--shadow-ambient)] hover:bg-bg-primary transition-all active:shadow-[var(--shadow-pressed)]"
      on:click={() => (showConfig = !showConfig)}
    >
      <span class="text-sm font-semibold text-text-secondary">Adjust Durations</span>
      <svg 
        class="w-4 h-4 text-text-tertiary transition-transform duration-300 {showConfig ? 'rotate-180' : ''}" 
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>
    
    {#if showConfig && config}
      <div class="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <TimerConfigComp bind:config />
      </div>
    {/if}
  </div>
</div>
