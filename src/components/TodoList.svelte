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

<div class="flex flex-col h-full gap-6">
  <div class="space-y-3">
    <div class="relative">
      <input
        type="text"
        bind:value={newTaskText}
        placeholder="What's on your mind?"
        on:keydown={(e) => e.key === 'Enter' && addTask()}
        class="w-full bg-bg-secondary border border-border rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-text-tertiary"
      />
      <button
        on:click={addTask}
        class="absolute right-3 top-1/2 -translate-y-1/2 bg-accent text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-accent-soft active:scale-95 transition-all"
        aria-label="Add task"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
    
    <div class="flex gap-2 px-1">
      {#each ['Work', 'Personal', 'Study'] as cat}
        <button
          class="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all {newTaskCategory === cat ? 'bg-text-primary border-text-primary text-bg-primary' : 'bg-transparent border-border text-text-tertiary hover:border-border-strong'}"
          on:click={() => (newTaskCategory = cat)}
        >
          {cat}
        </button>
      {/each}
    </div>
  </div>

  <div
    class="flex-1 overflow-y-auto space-y-3 min-h-[100px]"
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
