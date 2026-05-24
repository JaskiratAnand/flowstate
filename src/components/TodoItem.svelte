<script lang="ts">
import type { Task, PriorityLevel } from '../lib/types';
import { cyclePriority } from '../lib/tasks';
import Icon from './Icon.svelte';

let { task, onToggle, onDelete, onEdit, onPriorityChange } = $props<{
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onPriorityChange: (id: string, priority: PriorityLevel) => void;
}>();

let isEditing = $state(false);
let editText = $state('');

// Keep editText in sync if task text changes from outside (e.g. archiving/loading)
$effect(() => {
  editText = task.text;
});

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

let priorityLabel = $derived(
  task.priority && task.priority !== 'none'
    ? `Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`
    : 'No Priority',
);
</script>

<div
    class="todo-item-card group flex items-center gap-2.5 p-4.5 bg-surface shadow-(--shadow-ambient) rounded-2xl transition-all hover:scale-[1.01]"
>
    <!-- Tactile Checkbox -->
    <button
        class="w-6 h-6 rounded-full transition-all flex items-center justify-center shrink-0 cursor-pointer {task.completed
            ? 'bg-accent text-white shadow-(--shadow-ambient)'
            : 'bg-bg-primary shadow-(--shadow-pressed)'}"
        onclick={() => onToggle(task.id)}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
    >
        {#if task.completed}
            <Icon name="check" class="w-3.5 h-3.5" />
        {/if}
    </button>

    <!-- Tactile Priority Indicator -->
    <button
        type="button"
        class="priority-indicator {task.priority || 'none'} {task.completed
            ? 'completed'
            : ''}"
        onclick={handlePriorityClick}
        title={priorityLabel}
        aria-label={priorityLabel}
        disabled={task.completed}
    ></button>

    <div class="flex-1 min-w-0 pt-0.5">
        {#if isEditing}
            <input
                type="text"
                bind:value={editText}
                onblur={handleBlur}
                onkeydown={handleKeyDown}
                use:focus
                class="w-full bg-transparent border-none p-0 focus:ring-0 text-[15px] font-semibold text-text-primary"
            />
        {:else}
            <div class="flex flex-col gap-1">
                <span
                    class="text-[15px] font-semibold leading-snug transition-all cursor-text {task.completed
                        ? 'opacity-40 line-through'
                        : 'text-text-primary'}"
                    ondblclick={() => (isEditing = true)}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => e.key === "Enter" && (isEditing = true)}
                    aria-label="Double click to edit task"
                >
                    {task.text}
                </span>
                {#if task.category}
                    <div class="flex items-center gap-2">
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest text-accent/70"
                        >
                            {task.category}
                        </span>
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <button
        onclick={() => onDelete(task.id)}
        class="opacity-0 group-hover:opacity-100 p-2 text-text-tertiary hover:text-accent transition-all active:scale-90 cursor-pointer"
        title="Delete task"
    >
        <Icon name="trash" class="w-4.5 h-4.5" />
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
        content: "";
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
        background-color: color-mix(
            in srgb,
            var(--text-tertiary) 10%,
            transparent
        );
    }

    .priority-indicator.completed {
        cursor: not-allowed;
    }

    .priority-indicator.completed::after {
        opacity: 0.3;
        box-shadow: none !important;
    }
</style>
