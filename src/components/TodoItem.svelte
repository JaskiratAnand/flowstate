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

<div class="group flex items-center gap-3 p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl transition-all hover:border-[var(--accent)]">
  <input
    type="checkbox"
    checked={task.completed}
    on:change={() => onToggle(task.id)}
    class="w-5 h-5 rounded-md border-2 border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
  />

  <div class="flex-1 min-w-0">
    {#if isEditing}
      <input
        type="text"
        bind:value={editText}
        on:blur={handleBlur}
        on:keydown={handleKeyDown}
        use:focus
        class="w-full bg-transparent border-none p-0 focus:ring-0 text-sm"
      />
    {:else}
      <div class="flex flex-col">
        <span
          class="text-sm truncate {task.completed ? 'line-through text-[var(--text-secondary)]' : ''}"
          on:dblclick={() => (isEditing = true)}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && (isEditing = true)}
          aria-label="Double click to edit task"
        >
          {task.text}
        </span>
        {#if task.category}
          <span class="text-[10px] uppercase font-bold text-[var(--accent)] opacity-70">
            {task.category}
          </span>
        {/if}
      </div>
    {/if}
  </div>

  <button
    on:click={() => onDelete(task.id)}
    class="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-secondary)] hover:text-red-500 transition-opacity"
  >
    🗑️
  </button>
</div>
