import { describe, it, expect } from 'vitest';
import { archiveCompletedTasks, carryOverIncompleteTasks } from './archive';
import type { Task } from './types';

describe('Archive Logic', () => {
  it('returns only completed tasks for the archive', () => {
    const tasks: Task[] = [
      {
        id: '1',
        text: 'Task 1',
        completed: true,
        category: 'work',
        order: 0,
        createdAt: 123,
      },
      {
        id: '2',
        text: 'Task 2',
        completed: false,
        category: 'work',
        order: 1,
        createdAt: 124,
      },
    ];

    const archived = archiveCompletedTasks(tasks);

    expect(archived.length).toBe(1);
    expect(archived[0].id).toBe('1');
  });

  it('returns only incomplete tasks to carry over', () => {
    const tasks: Task[] = [
      {
        id: '1',
        text: 'Task 1',
        completed: true,
        category: 'work',
        order: 0,
        createdAt: 123,
      },
      {
        id: '2',
        text: 'Task 2',
        completed: false,
        category: 'work',
        order: 1,
        createdAt: 124,
      },
    ];

    const carryOver = carryOverIncompleteTasks(tasks);

    expect(carryOver.length).toBe(1);
    expect(carryOver[0].id).toBe('2');
  });
});
