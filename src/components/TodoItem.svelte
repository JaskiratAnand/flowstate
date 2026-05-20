<script lang="ts">
import type { Task, PriorityLevel } from '../lib/types';
import { cyclePriority } from '../lib/tasks';

export let task: Task;
export let onToggle: (id: string) => void;
export let onDelete: (id: string) => void;
export let onEdit: (id: string, text: string) => void;
export let onPriorityChange: (id: string, priority: PriorityLevel) => void;

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

function handlePriorityClick() {
  if (task.completed) return;
  const nextPriority = cyclePriority(task.priority);
  onPriorityChange(task.id, nextPriority);
}

$: priorityLabel =
  task.priority && task.priority !== 'none'
    ? `Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`
    : 'No Priority';
</script>

<div class="todo-item-card group flex items-center gap-2.5 p-4.5 bg-surface shadow-[var(--shadow-ambient)] rounded-2xl transition-all hover:scale-[1.01]">
  <!-- Tactile Checkbox -->
  <button
    class="w-6 h-6 rounded-full transition-all flex items-center justify-center flex-shrink-0 {task.completed ? 'bg-accent text-white shadow-[var(--shadow-ambient)]' : 'bg-bg-primary shadow-[var(--shadow-pressed)]'}"
    on:click={() => onToggle(task.id)}
    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
  >
    {#if task.completed}
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    {/if}
  </button>

  <!-- Tactile Priority Indicator -->
  <button
    type="button"
    class="priority-indicator {task.priority || 'none'} {task.completed ? 'completed' : ''}"
    on:click={handlePriorityClick}
    title={priorityLabel}
    aria-label={priorityLabel}
    disabled={task.completed}
  ></button>

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

<style>
  .priority-indicator {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    flex-shrink: 0;
    border: none;
    background: transparent;
    padding: 0;
    outline: none;
    margin-left: -6px;
    margin-right: -6px;
  }

  .priority-indicator::after {
    content: '';
    width: 14px;
    height: 14px;
    border-radius: 50%;
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }

  .priority-indicator:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .priority-indicator.high::after {
    background-color: var(--color-red);
    box-shadow: 0 0 8px var(--color-red);
    border-color: var(--color-red);
  }

  .priority-indicator.medium::after {
    background-color: var(--color-yellow);
    box-shadow: 0 0 8px var(--color-yellow);
    border-color: var(--color-yellow);
  }

  .priority-indicator.low::after {
    background-color: var(--color-green);
    box-shadow: 0 0 8px var(--color-green);
    border-color: var(--color-green);
  }

  .priority-indicator.none::after {
    background-color: transparent;
    border: 2px dashed transparent;
    opacity: 0;
  }

  .todo-item-card:hover .priority-indicator.none::after {
    border-color: var(--text-tertiary);
    opacity: 0.25;
  }

  .priority-indicator.none:focus-visible::after {
    border-color: var(--text-tertiary);
    opacity: 0.8;
  }

  .priority-indicator.none:hover::after {
    opacity: 0.8 !important;
    background-color: color-mix(in srgb, var(--text-tertiary) 10%, transparent);
  }

  .priority-indicator.completed {
    cursor: not-allowed;
  }

  .priority-indicator.completed::after {
    opacity: 0.3;
    box-shadow: none !important;
  }
</style>
