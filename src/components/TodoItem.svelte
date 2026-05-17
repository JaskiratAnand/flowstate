<script lang="ts">
import type { Task } from '../lib/types';

export let task: Task;
export let onToggle: (id: string) => void;
export let onDelete: (id: string) => void;
export let onEdit: (id: string, text: string) => void;

let isEditing = false;
let editText = task.text;

function handleBlur() {
  isEditing = false;
  if (editText.trim() && editText !== task.text) {
    onEdit(task.id, editText);
  } else {
    editText = task.text;
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') handleBlur();
  if (e.key === 'Escape') {
    isEditing = false;
    editText = task.text;
  }
}

function focus(node: HTMLInputElement) {
  node.focus();
}
</script>

<div class="group flex items-start gap-4 p-4.5 bg-surface shadow-[var(--shadow-ambient)] rounded-2xl transition-all hover:scale-[1.01]">
  <!-- Tactile Checkbox -->
  <button
    class="mt-0.5 w-6 h-6 rounded-full transition-all flex items-center justify-center flex-shrink-0
           {task.completed ? 'bg-accent text-white shadow-[var(--shadow-ambient)]' : 'bg-bg-primary shadow-[var(--shadow-pressed)]'}"
    on:click={() => onToggle(task.id)}
    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
  >
    {#if task.completed}
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    {/if}
  </button>

  <div class="flex-1 min-w-0 pt-0.5">
    {#if isEditing}
      <input
        type="text"
        bind:value={editText}
        on:blur={handleBlur}
        on:keydown={handleKeyDown}
        use:focus
        class="w-full bg-transparent border-none p-0 focus:ring-0 text-[15px] font-semibold text-text-primary"
      />
    {:else}
      <div class="flex flex-col gap-1">
        <span
          class="text-[15px] font-semibold leading-snug transition-all cursor-text {task.completed ? 'opacity-40 line-through' : 'text-text-primary'}"
          on:dblclick={() => (isEditing = true)}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && (isEditing = true)}
          aria-label="Double click to edit task"
        >
          {task.text}
        </span>
        {#if task.category}
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold uppercase tracking-[0.1em] text-accent/70">
              {task.category}
            </span>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <button
    on:click={() => onDelete(task.id)}
    class="opacity-0 group-hover:opacity-100 p-2 text-text-tertiary hover:text-accent transition-all active:scale-90"
    title="Delete task"
  >
    <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  </button>
</div>
