import { describe, it, expect } from 'vitest';
import { cyclePriority, sortTasks } from './tasks';
import type { Task } from './types';

describe('cyclePriority', () => {
  it('should cycle from undefined to low', () => {
    expect(cyclePriority(undefined)).toBe('low');
  });

  it('should cycle from none to low', () => {
    expect(cyclePriority('none')).toBe('low');
  });

  it('should cycle from low to medium', () => {
    expect(cyclePriority('low')).toBe('medium');
  });

  it('should cycle from medium to high', () => {
    expect(cyclePriority('medium')).toBe('high');
  });

  it('should cycle from high to none', () => {
    expect(cyclePriority('high')).toBe('none');
  });
});

describe('sortTasks', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      text: 'Task 1',
      completed: false,
      category: 'Work',
      order: 0,
      createdAt: 100,
      priority: 'none',
    },
    {
      id: '2',
      text: 'Task 2',
      completed: false,
      category: 'Personal',
      order: 1,
      createdAt: 200,
      priority: 'high',
    },
    {
      id: '3',
      text: 'Task 3',
      completed: true,
      category: 'Work',
      order: 2,
      createdAt: 300,
      priority: 'high',
    },
    {
      id: '4',
      text: 'Task 4',
      completed: false,
      category: 'Study',
      order: 3,
      createdAt: 400,
      priority: 'low',
    },
    {
      id: '5',
      text: 'Task 5',
      completed: true,
      category: 'Personal',
      order: 4,
      createdAt: 500,
      priority: 'none',
    },
    {
      id: '6',
      text: 'Task 6',
      completed: false,
      category: 'Work',
      order: 5,
      createdAt: 600,
      priority: 'high',
    },
  ];

  it('should partition and sort correctly when moveHighPriorityToTop is true', () => {
    const sorted = sortTasks(mockTasks, true);

    // Expected order:
    // 1. High priority uncompleted: Task 2, Task 6
    // 2. Others uncompleted: Task 1 (none), Task 4 (low)
    // 3. Completed: Task 3 (high completed), Task 5 (none completed)
    expect(sorted.map((t) => t.id)).toEqual(['2', '6', '1', '4', '3', '5']);
  });

  it('should partition and sort correctly when moveHighPriorityToTop is false', () => {
    const sorted = sortTasks(mockTasks, false);

    // Expected order:
    // 1. All uncompleted: Task 1, Task 2, Task 4, Task 6
    // 2. Completed: Task 3, Task 5
    expect(sorted.map((t) => t.id)).toEqual(['1', '2', '4', '6', '3', '5']);
  });

  it('should handle empty task list', () => {
    expect(sortTasks([], true)).toEqual([]);
    expect(sortTasks([], false)).toEqual([]);
  });
});
