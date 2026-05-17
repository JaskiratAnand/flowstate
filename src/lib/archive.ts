import type { Task } from './types';

export function archiveCompletedTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.completed);
}

export function carryOverIncompleteTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => !task.completed);
}
