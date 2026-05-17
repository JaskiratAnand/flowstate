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

<div class="group flex items-start gap-3 p-4 bg-bg-primary border border-border rounded-2xl transition-all hover:border-accent hover:shadow-sm">
  <button
    class="mt-0.5 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center {task.completed ? 'bg-accent border-accent text-white' : 'border-border-strong bg-transparent'}"
    on:click={() => onToggle(task.id)}
    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
  >
    {#if task.completed}
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    {/if}
  </button>

  <div class="flex-1 min-w-0">
    {#if isEditing}
      <input
        type="text"
        bind:value={editText}
        on:blur={handleBlur}
        on:keydown={handleKeyDown}
        use:focus
        class="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium"
      />
    {:else}
      <div class="flex flex-col gap-0.5">
        <span
          class="text-sm font-medium leading-tight {task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}"
          on:dblclick={() => (isEditing = true)}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && (isEditing = true)}
          aria-label="Double click to edit task"
        >
          {task.text}
        </span>
        {#if task.category}
          <div class="flex items-center gap-1.5 mt-1">
            <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
              {task.category}
            </span>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <button
    on:click={() => onDelete(task.id)}
    class="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-red-500 transition-all active:scale-90"
    title="Delete task"
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  </button>
</div>
