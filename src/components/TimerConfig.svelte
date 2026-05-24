<script lang="ts">
import { setStorageItem } from '../lib/storage';
import type { TimerConfig } from '../lib/types';

let { config = $bindable() } = $props<{
  config: TimerConfig;
}>();

async function updateConfig() {
  await setStorageItem('TIMER_CONFIG', $state.snapshot(config));
}
</script>

<div
    class="grid grid-cols-3 gap-4 p-5 bg-surface shadow-(--shadow-ambient) rounded-2xl border border-border"
>
    <div class="flex flex-col gap-2">
        <label
            class="text-[9px] uppercase font-bold tracking-[0.15em] text-text-tertiary px-1"
            for="work">Focus</label
        >
        <div class="relative">
            <input
                id="work"
                type="number"
                bind:value={config.workDuration}
                onchange={updateConfig}
                class="w-full bg-bg-primary shadow-(--shadow-pressed) rounded-xl px-4 py-3 text-sm font-semibold text-text-primary outline-none transition-all focus:shadow-(--shadow-pressed)"
            />
            <span
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary font-bold pointer-events-none opacity-50"
                >M</span
            >
        </div>
    </div>

    <div class="flex flex-col gap-2">
        <label
            class="text-[9px] uppercase font-bold tracking-[0.15em] text-text-tertiary px-1"
            for="short">Short</label
        >
        <div class="relative">
            <input
                id="short"
                type="number"
                bind:value={config.shortBreakDuration}
                onchange={updateConfig}
                class="w-full bg-bg-primary shadow-(--shadow-pressed) rounded-xl px-4 py-3 text-sm font-semibold text-text-primary outline-none transition-all focus:shadow-(--shadow-pressed)"
            />
            <span
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary font-bold pointer-events-none opacity-50"
                >M</span
            >
        </div>
    </div>

    <div class="flex flex-col gap-2">
        <label
            class="text-[9px] uppercase font-bold tracking-[0.15em] text-text-tertiary px-1"
            for="long">Long</label
        >
        <div class="relative">
            <input
                id="long"
                type="number"
                bind:value={config.longBreakDuration}
                onchange={updateConfig}
                class="w-full bg-bg-primary shadow-(--shadow-pressed) rounded-xl px-4 py-3 text-sm font-semibold text-text-primary outline-none transition-all focus:shadow-(--shadow-pressed)"
            />
            <span
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary font-bold pointer-events-none opacity-50"
                >M</span
            >
        </div>
    </div>
</div>
