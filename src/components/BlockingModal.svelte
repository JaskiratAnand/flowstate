<script lang="ts">
import { onMount } from 'svelte';
import { getStorageItem, setStorageItem } from '../lib/storage';
import type { BlockingConfig } from '../lib/types';
import { getCleanDomain } from '../lib/blocking';

let { onClose } = $props<{ onClose: () => void }>();

let enabled = $state(true);
let strictMode = $state(false);
let bypassDuration = $state(5);
let mode = $state<'blocklist' | 'allowlist'>('blocklist');
let blockedSites = $state<string[]>([]);
let allowedSites = $state<string[]>([]);
const activeList = $derived(mode === 'blocklist' ? blockedSites : allowedSites);

let newSiteInput = $state('');
let inputError = $state('');

onMount(async () => {
  const config = await getStorageItem('BLOCKING_CONFIG');
  if (config) {
    enabled = config.enabled;
    strictMode = config.strictMode;
    bypassDuration = config.bypassDuration;
    mode = config.mode || 'blocklist';
    blockedSites = config.blockedSites || [];
    allowedSites = config.allowedSites || [];
  }
});

async function saveConfig() {
  await setStorageItem('BLOCKING_CONFIG', {
    enabled,
    strictMode,
    bypassDuration,
    mode,
    blockedSites,
    allowedSites,
  });
}

function handleEnabledToggle() {
  enabled = !enabled;
  saveConfig();
}

function handleStrictModeToggle() {
  strictMode = !strictMode;
  saveConfig();
}

function handleBypassDurationChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  bypassDuration = parseInt(target.value, 10);
  saveConfig();
}

function handleTabChange(tab: 'blocklist' | 'allowlist') {
  mode = tab;
  saveConfig();
}

const domainRegex =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

function addSite() {
  inputError = '';
  const raw = newSiteInput.trim();
  if (!raw) return;

  const cleaned = getCleanDomain(raw);
  if (!domainRegex.test(cleaned)) {
    inputError = 'Please enter a valid domain name.';
    return;
  }

  const currentList = mode === 'blocklist' ? blockedSites : allowedSites;
  if (currentList.includes(cleaned)) {
    inputError = 'Domain is already in the list.';
    return;
  }

  if (mode === 'blocklist') {
    blockedSites = [...blockedSites, cleaned];
  } else {
    allowedSites = [...allowedSites, cleaned];
  }
  newSiteInput = '';
  saveConfig();
}

function removeSite(siteToRemove: string) {
  if (mode === 'blocklist') {
    blockedSites = blockedSites.filter((s) => s !== siteToRemove);
  } else {
    allowedSites = allowedSites.filter((s) => s !== siteToRemove);
  }
  saveConfig();
}

function handleKeyPress(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    addSite();
  }
}
</script>

<div class="absolute inset-0 z-50 bg-bg-primary p-6 flex flex-col overflow-y-auto animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div class="flex flex-col">
            <h2 class="text-xl font-heading text-text-primary">Focus Shield</h2>
            <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-text-tertiary">Mindful Web Blocker</span>
        </div>
        <button
            type="button"
            onclick={onClose}
            class="w-9 h-9 rounded-xl bg-surface border border-border shadow-(--shadow-ambient) flex items-center justify-center text-text-secondary hover:text-accent active:shadow-(--shadow-pressed) transition-all cursor-pointer"
            aria-label="Close settings"
        >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>

    <!-- Main Config Card -->
    <div class="bg-surface p-4 rounded-2xl shadow-(--shadow-ambient) border border-border space-y-4 mb-6">
        <!-- Toggle Blocker -->
        <div class="flex items-center justify-between">
            <div class="flex flex-col pr-4">
                <span class="text-xs font-semibold text-text-primary">Block Distractions</span>
                <span class="text-[10px] text-text-tertiary leading-normal">Block listed websites during focus sessions</span>
            </div>
            <button
                type="button"
                class="w-12 h-6 rounded-full p-1 transition-all duration-300 relative flex items-center focus:outline-none cursor-pointer
                       {enabled
                         ? 'bg-accent/20 border border-accent/20'
                         : 'bg-bg-secondary border border-border'}"
                onclick={handleEnabledToggle}
                aria-label="Toggle Block Distractions"
            >
                <div
                    class="w-4 h-4 rounded-full transition-all duration-300 shadow-(--shadow-ambient)
                           {enabled
                             ? 'bg-accent translate-x-5.5'
                             : 'bg-text-tertiary translate-x-0'}"
                ></div>
            </button>
        </div>

        <!-- Strict Mode -->
        <div class="flex items-center justify-between">
            <div class="flex flex-col pr-4">
                <span class="text-xs font-semibold text-text-primary">Strict Mode</span>
                <span class="text-[10px] text-text-tertiary leading-normal">Keep block active outside focus sessions & break timers</span>
            </div>
            <button
                type="button"
                class="w-12 h-6 rounded-full p-1 transition-all duration-300 relative flex items-center focus:outline-none cursor-pointer
                       {strictMode
                         ? 'bg-accent/20 border border-accent/20'
                         : 'bg-bg-secondary border border-border'}"
                onclick={handleStrictModeToggle}
                aria-label="Toggle Strict Mode"
            >
                <div
                    class="w-4 h-4 rounded-full transition-all duration-300 shadow-(--shadow-ambient)
                           {strictMode
                             ? 'bg-accent translate-x-5.5'
                             : 'bg-text-tertiary translate-x-0'}"
                ></div>
            </button>
        </div>

        <!-- Bypass Duration -->
        <div class="flex items-center justify-between pt-2 border-t border-border/50">
            <div class="flex flex-col pr-4">
                <span class="text-xs font-semibold text-text-primary">Bypass Duration</span>
                <span class="text-[10px] text-text-tertiary leading-normal">Temporary access allowed after breathing guide</span>
            </div>
            <select
                value={bypassDuration}
                onchange={handleBypassDurationChange}
                class="p-2 rounded-xl bg-bg-primary border border-border text-xs font-semibold text-text-primary shadow-(--shadow-ambient) focus:outline-none focus:border-accent cursor-pointer"
            >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
            </select>
        </div>
    </div>

    <!-- Tabs Blocklist / Allowlist -->
    <div class="flex p-1.5 bg-bg-secondary rounded-2xl shadow-(--shadow-pressed) border border-border/50 mb-4">
        <button
            type="button"
            class="flex-1 py-2 flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer {mode === 'blocklist' ? 'bg-surface text-text-primary shadow-(--shadow-ambient)' : 'text-text-tertiary'}"
            onclick={() => handleTabChange('blocklist')}
        >
            Blocklist
        </button>
        <button
            type="button"
            class="flex-1 py-2 flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer {mode === 'allowlist' ? 'bg-surface text-text-primary shadow-(--shadow-ambient)' : 'text-text-tertiary'}"
            onclick={() => handleTabChange('allowlist')}
        >
            Allowlist
        </button>
    </div>

    <!-- Input Section -->
    <div class="space-y-2 mb-4">
        <div class="flex gap-2">
            <input
                type="text"
                placeholder={mode === 'blocklist' ? 'Add site to block (e.g. facebook.com)' : 'Add site to allow (e.g. wikipedia.org)'}
                bind:value={newSiteInput}
                onkeypress={handleKeyPress}
                class="flex-1 p-3 rounded-xl bg-bg-secondary border border-border text-xs text-text-primary shadow-(--shadow-pressed) focus:outline-none focus:border-accent placeholder:text-text-tertiary/60"
            />
            <button
                type="button"
                onclick={addSite}
                class="px-4 py-3 rounded-xl bg-surface border border-border text-xs font-semibold text-text-primary shadow-(--shadow-ambient) hover:scale-102 active:shadow-(--shadow-pressed) active:scale-98 transition-all cursor-pointer"
            >
                Add
            </button>
        </div>
        {#if inputError}
            <span class="block px-1 text-[10px] font-semibold text-[var(--color-red)] animate-in fade-in duration-300">
                {inputError}
            </span>
        {/if}
    </div>

    <!-- Sites List -->
    <div class="flex-1 min-h-[150px] overflow-y-auto border border-border/50 rounded-2xl bg-bg-secondary/40 p-2 space-y-2 scrollbar-none shadow-(--shadow-pressed)">
        {#if activeList.length === 0}
            <div class="flex flex-col items-center justify-center h-full text-center p-4">
                <span class="text-xl opacity-40">🌱</span>
                <p class="text-[10px] text-text-tertiary mt-2">
                    {mode === 'blocklist' ? 'No blocked domains. Add some above.' : 'No allowed domains. All sites will be blocked.'}
                </p>
            </div>
        {:else}
            {#each activeList as site}
                <div class="flex items-center justify-between p-3 rounded-xl bg-surface border border-border shadow-(--shadow-ambient) transition-all animate-in fade-in duration-300">
                    <span class="text-xs font-medium text-text-primary truncate pr-4">{site}</span>
                    <button
                        type="button"
                        onclick={() => removeSite(site)}
                        class="px-2.5 py-1.5 rounded-lg bg-bg-primary border border-border text-[9px] font-bold uppercase tracking-wider text-text-secondary hover:text-[var(--color-red)] active:shadow-(--shadow-pressed) transition-all cursor-pointer"
                        aria-label="Remove {site}"
                    >
                        Remove
                    </button>
                </div>
            {/each}
        {/if}
    </div>
</div>
