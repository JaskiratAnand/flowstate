<script lang="ts">
import { setStorageItem } from '../lib/storage';
import type { TimerConfig } from '../lib/types';

export let config: TimerConfig;

async function updateConfig() {
  await setStorageItem('TIMER_CONFIG', config);
}
</script>

<div class="grid grid-cols-3 gap-3 p-4 bg-bg-secondary rounded-2xl border border-border">
  <div class="flex flex-col gap-1.5">
    <label class="text-[9px] uppercase font-bold tracking-wider text-text-tertiary px-1" for="work">Focus</label>
    <div class="relative">
      <input
        id="work"
        type="number"
        bind:value={config.workDuration}
        on:change={updateConfig}
        class="w-full bg-bg-primary border border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
      />
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary font-medium pointer-events-none">m</span>
    </div>
  </div>
  
  <div class="flex flex-col gap-1.5">
    <label class="text-[9px] uppercase font-bold tracking-wider text-text-tertiary px-1" for="short">Short</label>
    <div class="relative">
      <input
        id="short"
        type="number"
        bind:value={config.shortBreakDuration}
        on:change={updateConfig}
        class="w-full bg-bg-primary border border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
      />
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary font-medium pointer-events-none">m</span>
    </div>
  </div>

  <div class="flex flex-col gap-1.5">
    <label class="text-[9px] uppercase font-bold tracking-wider text-text-tertiary px-1" for="long">Long</label>
    <div class="relative">
      <input
        id="long"
        type="number"
        bind:value={config.longBreakDuration}
        on:change={updateConfig}
        class="w-full bg-bg-primary border border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
      />
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary font-medium pointer-events-none">m</span>
    </div>
  </div>
</div>
