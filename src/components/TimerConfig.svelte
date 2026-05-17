<script lang="ts">
import { setStorageItem } from '../lib/storage';
import type { TimerConfig } from '../lib/types';

export let config: TimerConfig;

async function updateConfig() {
  await setStorageItem('TIMER_CONFIG', config);
  // In background.ts we should probably listen for config changes
  // but the next session start will pick it up anyway via getStorageItem.
}
</script>

<div class="space-y-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
  <h3 class="font-semibold text-sm">Timer Settings (min)</h3>
  
  <div class="grid grid-cols-3 gap-3">
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold opacity-60" for="work">Work</label>
      <input
        id="work"
        type="number"
        bind:value={config.workDuration}
        on:change={updateConfig}
        class="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1 text-sm"
      />
    </div>
    
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold opacity-60" for="short">Short</label>
      <input
        id="short"
        type="number"
        bind:value={config.shortBreakDuration}
        on:change={updateConfig}
        class="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1 text-sm"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold opacity-60" for="long">Long</label>
      <input
        id="long"
        type="number"
        bind:value={config.longBreakDuration}
        on:change={updateConfig}
        class="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1 text-sm"
      />
    </div>
  </div>
</div>
