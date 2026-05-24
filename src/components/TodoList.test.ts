import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import TodoList from './TodoList.svelte';

const mockStorage: Record<string, any> = {};

vi.mock('../lib/storage', () => ({
  getStorageItem: vi.fn((key: string) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  setStorageItem: vi.fn((key: string, data: any) => {
    mockStorage[key] = data;
    return Promise.resolve();
  }),
}));

describe('TodoList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage['TASKS'] = [
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
        createdAt: 101,
        priority: 'high',
      },
    ];
    mockStorage['USER_PREFERENCES'] = {
      moveHighPriorityToTop: true,
    };
  });

  it('renders tasks from storage sorted appropriately', async () => {
    const { getByText, getAllByRole } = render(TodoList);

    await waitFor(() => {
      expect(getByText('Task 1')).toBeInTheDocument();
    });

    expect(getByText('Task 2')).toBeInTheDocument();

    // Verify task 2 (high priority) comes first in the list
    const items = getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Task 2');
    expect(items[1]).toHaveTextContent('Task 1');
  });

  it('allows adding a new task', async () => {
    const { getByPlaceholderText, getByLabelText, getByText } =
      render(TodoList);

    await waitFor(() => {
      expect(getByText('Task 1')).toBeInTheDocument();
    });

    const input = getByPlaceholderText('Plant a seed...');
    const addBtn = getByLabelText('Add task');

    await fireEvent.input(input, { target: { value: 'New task text' } });
    await fireEvent.click(addBtn);

    await waitFor(() => {
      expect(getByText('New task text')).toBeInTheDocument();
    });

    const { setStorageItem } = await import('../lib/storage');
    expect(setStorageItem).toHaveBeenCalledWith(
      'TASKS',
      expect.arrayContaining([
        expect.objectContaining({ text: 'New task text', category: 'Work' }),
      ]),
    );
  });
});
