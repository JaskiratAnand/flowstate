import type { Task, PriorityLevel } from './types';

/**
 * Cycles the priority level of a task:
 * none / undefined -> low -> medium -> high -> none
 */
export function cyclePriority(
  current: PriorityLevel | undefined,
): PriorityLevel {
  if (!current || current === 'none') return 'low';
  if (current === 'low') return 'medium';
  if (current === 'medium') return 'high';
  return 'none';
}

/**
 * Sorts/partitions the task list.
 * - Completed tasks are always moved to the bottom of the list.
 * - If moveHighPriorityToTop is true, uncompleted high priority tasks are sorted at the top.
 * - Preserves the original relative order within each partitioned group.
 */
export function sortTasks(
  tasks: Task[],
  moveHighPriorityToTop: boolean,
): Task[] {
  const completed = tasks.filter((t) => t.completed);
  const uncompleted = tasks.filter((t) => !t.completed);

  if (moveHighPriorityToTop) {
    const high = uncompleted.filter((t) => t.priority === 'high');
    const others = uncompleted.filter((t) => t.priority !== 'high');
    return [...high, ...others, ...completed];
  }

  return [...uncompleted, ...completed];
}
