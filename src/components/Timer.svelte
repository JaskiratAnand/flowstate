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
</script>

<div class="flex flex-col items-center py-8">
  <div class="flex flex-col items-center mb-12">
    <div class="px-3 py-1 mb-4 rounded-full bg-accent-soft text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/20">
      {label}
    </div>
    <div class="text-[84px] font-light tabular-nums leading-none tracking-tight text-text-primary">
      {state ? formatTime(state.remainingSeconds) : '25:00'}
    </div>
  </div>

  <div class="flex items-center gap-6 mb-12">
    <button
      class="p-4 rounded-full bg-bg-secondary border border-border hover:border-border-strong transition-all active:scale-95"
      on:click={() => sendMessage('RESET_TIMER')}
      title="Reset"
    >
      <svg class="w-5 h-5 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
    </button>

    {#if state?.status === 'running'}
      <button
        class="w-20 h-20 rounded-full bg-text-primary text-bg-primary flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95"
        on:click={() => sendMessage('PAUSE_TIMER')}
        aria-label="Pause"
      >
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
      </button>
    {:else}
      <button
        class="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center shadow-xl shadow-accent-soft transition-all hover:scale-105 active:scale-95"
        on:click={() => sendMessage('START_TIMER')}
        aria-label="Start"
      >
        <svg class="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 3l14 9-14 9V3z"/>
        </svg>
      </button>
    {/if}

    <button
      class="p-4 rounded-full bg-bg-secondary border border-border hover:border-border-strong transition-all active:scale-95"
      on:click={() => sendMessage('SKIP_SESSION')}
      title="Skip"
    >
      <svg class="w-5 h-5 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 4l10 8-10 8V4z"/>
        <line x1="19" y1="5" x2="19" y2="19"/>
      </svg>
    </button>
  </div>

  <div class="w-full">
    <button 
      class="w-full py-4 px-5 flex items-center justify-between rounded-2xl bg-bg-secondary border border-border hover:bg-surface transition-colors"
      on:click={() => (showConfig = !showConfig)}
    >
      <span class="text-sm font-medium text-text-secondary">Timer Settings</span>
      <svg 
        class="w-4 h-4 text-text-tertiary transition-transform {showConfig ? 'rotate-180' : ''}" 
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>
    
    {#if showConfig && config}
      <div class="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
        <TimerConfigComp bind:config />
      </div>
    {/if}
  </div>
</div>
