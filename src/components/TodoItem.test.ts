import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TodoItem from './TodoItem.svelte';
import type { Task } from '../lib/types';

describe('TodoItem Component', () => {
  const mockTask: Task = {
    id: 'task-1',
    text: 'Test task text',
    completed: false,
    category: 'Work',
    order: 0,
    createdAt: 12345,
    priority: 'none',
  };

  it('renders task text and category', () => {
    const { getByText } = render(TodoItem, {
      task: mockTask,
      onToggle: () => {},
      onDelete: () => {},
      onEdit: () => {},
      onPriorityChange: () => {},
    });

    expect(getByText('Test task text')).toBeInTheDocument();
    expect(getByText('Work')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const onToggleMock = vi.fn();
    const { getByRole } = render(TodoItem, {
      task: mockTask,
      onToggle: onToggleMock,
      onDelete: () => {},
      onEdit: () => {},
      onPriorityChange: () => {},
    });

    const checkbox = getByRole('button', { name: 'Mark complete' });
    await fireEvent.click(checkbox);
    expect(onToggleMock).toHaveBeenCalledWith('task-1');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDeleteMock = vi.fn();
    const { getByTitle } = render(TodoItem, {
      task: mockTask,
      onToggle: () => {},
      onDelete: onDeleteMock,
      onEdit: () => {},
      onPriorityChange: () => {},
    });

    const deleteBtn = getByTitle('Delete task');
    await fireEvent.click(deleteBtn);
    expect(onDeleteMock).toHaveBeenCalledWith('task-1');
  });

  it('triggers edit mode on double click, allows editing text, and calls onEdit on blur', async () => {
    const onEditMock = vi.fn();
    const { getByText, getByRole } = render(TodoItem, {
      task: mockTask,
      onToggle: () => {},
      onDelete: () => {},
      onEdit: onEditMock,
      onPriorityChange: () => {},
    });

    const textSpan = getByText('Test task text');
    await fireEvent.doubleClick(textSpan);

    const input = getByRole('textbox') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Test task text');

    await fireEvent.input(input, { target: { value: 'Edited text' } });
    await fireEvent.blur(input);

    expect(onEditMock).toHaveBeenCalledWith('task-1', 'Edited text');
  });

  it('calls onPriorityChange when priority circle is clicked', async () => {
    const onPriorityMock = vi.fn();
    const { container } = render(TodoItem, {
      task: mockTask,
      onToggle: () => {},
      onDelete: () => {},
      onEdit: () => {},
      onPriorityChange: onPriorityMock,
    });

    const priorityIndicator = container.querySelector('.priority-indicator');
    expect(priorityIndicator).toBeInTheDocument();
    await fireEvent.click(priorityIndicator!);

    expect(onPriorityMock).toHaveBeenCalledWith('task-1', 'low');
  });
});
