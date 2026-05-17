<script lang="ts">
import { onMount } from 'svelte';
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

  items = [...items, newTask];
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
  }

  await sync();
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

const flipDurationMs = 200;
</script>

<div class="flex flex-col h-full gap-4">
  <div class="flex flex-col gap-2 p-1">
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newTaskText}
        placeholder="Add a task..."
        on:keydown={(e) => e.key === 'Enter' && addTask()}
        class="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent)] outline-none"
      />
      <button
        on:click={addTask}
        class="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
      >
        Add
      </button>
    </div>
    
    <div class="flex gap-2">
      {#each ['Work', 'Personal', 'Study'] as cat}
        <button
          class="text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors {newTaskCategory === cat ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'}"
          on:click={() => (newTaskCategory = cat)}
        >
          {cat}
        </button>
      {/each}
    </div>
  </div>

  <div
    class="flex-1 overflow-y-auto space-y-2 p-1"
    use:dndzone={{ items, flipDurationMs }}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
  >
    {#each items as item (item.id)}
      <div class="outline-none">
        <TodoItem
          task={item}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onEdit={editTask}
        />
      </div>
    {/each}
  </div>
</div>
