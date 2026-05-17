<script lang="ts">
import { onMount } from 'svelte';
import { flip } from 'svelte/animate';
import { dndzone } from 'svelte-dnd-action';
import { nanoid } from 'nanoid';
import { getStorageItem, setStorageItem } from '../lib/storage';
import { incrementTasksCompleted } from '../lib/stats';
import type { Task } from '../lib/types';
import TodoItem from './TodoItem.svelte';

let items: Task[] = [];
let newTaskText = '';
let newTaskCategory = 'Work';

onMount(async () => {
  items = (await getStorageItem('TASKS')) || [];
});

async function sync() {
  await setStorageItem('TASKS', items);
}

async function addTask() {
  if (!newTaskText.trim()) return;

  const newTask: Task = {
    id: nanoid(),
    text: newTaskText,
    completed: false,
    category: newTaskCategory,
    order: items.length,
    createdAt: Date.now(),
  };

  items = [newTask, ...items];
  newTaskText = '';
  await sync();
}

async function toggleTask(id: string) {
  let completedNow = false;
  items = items.map((t) => {
    if (t.id === id) {
      if (!t.completed) completedNow = true;
      return { ...t, completed: !t.completed };
    }
    return t;
  });

  if (completedNow) {
    const stats = await getStorageItem('STATS');
    if (stats) {
      const date = new Date().toISOString().split('T')[0];
      const nextStats = incrementTasksCompleted(stats, date);
      await setStorageItem('STATS', nextStats);
    }

    // Real-time sort: Move to bottom after a short delay
    setTimeout(async () => {
      const taskIndex = items.findIndex((t) => t.id === id);
      if (taskIndex > -1) {
        const [task] = items.splice(taskIndex, 1);
        items = [...items, task];
        await sync();
      }
    }, 300);
  } else {
    await sync();
  }
}

async function deleteTask(id: string) {
  items = items.filter((t) => t.id !== id);
  await sync();
}

async function editTask(id: string, text: string) {
  items = items.map((t) => (t.id === id ? { ...t, text } : t));
  await sync();
}

function handleDndConsider(e: CustomEvent<{ items: Task[] }>) {
  items = e.detail.items;
}

function handleDndFinalize(e: CustomEvent<{ items: Task[] }>) {
  items = e.detail.items;
  sync();
}

const flipDurationMs = 600;
</script>

<div class="flex flex-col h-full gap-2">
    <!-- New Task Input Section -->
    <div class="space-y-4">
        <div class="relative">
            <input
                type="text"
                bind:value={newTaskText}
                placeholder="Plant a seed..."
                on:keydown={(e) => e.key === "Enter" && addTask()}
                class="w-full bg-surface shadow-(--shadow-pressed) rounded-2xl px-6 py-4.5 text-sm font-semibold text-text-primary outline-none transition-all placeholder:text-text-tertiary placeholder:font-normal"
            />
            <button
                on:click={addTask}
                class="absolute right-3 top-1/2 -translate-y-1/2 bg-surface shadow-(--shadow-ambient) text-accent w-10 h-10 rounded-xl flex items-center justify-center active:shadow-(--shadow-pressed) active:scale-95 transition-all"
                aria-label="Add task"
            >
                <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
        </div>

        <div class="flex gap-3 px-1 overflow-x-auto scrollbar-none">
            {#each ["Work", "Personal", "Study"] as cat}
                <button
                    class="text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-all
                 {newTaskCategory === cat
                        ? 'bg-accent text-white shadow-(--shadow-ambient)'
                        : 'bg-surface shadow-(--shadow-ambient) text-text-tertiary hover:text-text-secondary'}"
                    on:click={() => (newTaskCategory = cat)}
                >
                    {cat}
                </button>
            {/each}
        </div>
    </div>

    <!-- Task List Section -->
    <div
        class="flex-1 overflow-y-auto space-y-5 min-h-25 scrollbar-none pb-12"
        use:dndzone={{ items, flipDurationMs }}
        on:consider={handleDndConsider}
        on:finalize={handleDndFinalize}
    >
        {#each items as item (item.id)}
            <div
                class="outline-none"
                animate:flip={{ duration: flipDurationMs }}
            >
                <TodoItem
                    task={item}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onEdit={editTask}
                />
            </div>
        {:else}
            <div
                class="flex flex-col items-center justify-center py-20 text-center opacity-40"
            >
                <svg
                    class="w-16 h-16 mb-4 text-text-tertiary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path
                        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    />
                </svg>
                <p class="text-sm font-medium text-text-tertiary">
                    No focus sessions yet today.<br />Plant a seed.
                </p>
            </div>
        {/each}
    </div>
</div>
