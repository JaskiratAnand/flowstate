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

<div class="flex flex-col items-center justify-center py-10 gap-8">
  <div class="flex flex-col items-center gap-2">
    <span class="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">{label}</span>
    <div class="text-7xl font-bold tabular-nums tracking-tight">
      {state ? formatTime(state.remainingSeconds) : '--:--'}
    </div>
  </div>

  <div class="flex gap-4">
    {#if state?.status === 'running'}
      <button
        class="w-32 py-3 rounded-full bg-[var(--surface)] text-[var(--text-primary)] font-semibold border border-[var(--border)]"
        on:click={() => sendMessage('PAUSE_TIMER')}
      >
        Pause
      </button>
    {:else}
      <button
        class="w-32 py-3 rounded-full bg-[var(--accent)] text-white font-semibold shadow-lg shadow-[var(--accent-soft)]"
        on:click={() => sendMessage('START_TIMER')}
      >
        {state?.status === 'paused' ? 'Resume' : 'Start'}
      </button>
    {/if}

    <button
      class="p-3 rounded-full bg-[var(--surface)] border border-[var(--border)]"
      on:click={() => sendMessage('RESET_TIMER')}
      title="Reset"
    >
      🔄
    </button>
    
    <button
      class="p-3 rounded-full bg-[var(--surface)] border border-[var(--border)]"
      on:click={() => (showConfig = !showConfig)}
      title="Settings"
    >
      ⚙️
    </button>
    
    <button
      class="p-3 rounded-full bg-[var(--surface)] border border-[var(--border)]"
      on:click={() => sendMessage('SKIP_SESSION')}
      title="Skip"
    >
      ⏭️
    </button>
  </div>

  {#if showConfig && config}
    <div class="w-full mt-4">
      <TimerConfigComp bind:config />
    </div>
  {/if}
</div>
