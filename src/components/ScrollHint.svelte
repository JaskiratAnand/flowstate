<script lang="ts">
import { fade } from 'svelte/transition';

let { show } = $props<{ show: boolean }>();
</script>

{#if show}
  <div
    transition:fade={{ duration: 200 }}
    class="fixed bottom-22 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-border shadow-(--shadow-ambient) text-text-secondary text-[10px] font-semibold uppercase tracking-wider pointer-events-none transition-all duration-300"
    style="background-color: var(--surface-raised);"
    aria-hidden="true"
  >
    <span>Scroll</span>
    <svg
      class="w-3.5 h-3.5 text-accent animate-bounce-custom"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      viewBox="0 0 24 24"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </div>
{/if}

<style>
  .animate-bounce-custom {
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-bounce-custom {
      animation: none !important;
      transform: none !important;
    }
  }
</style>
