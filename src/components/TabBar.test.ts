import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TabBar from './TabBar.svelte';

describe('TabBar Component', () => {
  it('renders all tabs and highlights the active one', () => {
    const { getByLabelText } = render(TabBar, {
      activeTab: 'timer',
      onTabChange: () => {},
    });

    const timerBtn = getByLabelText('Timer');
    const tasksBtn = getByLabelText('Tasks');
    const statsBtn = getByLabelText('Stats');

    expect(timerBtn).toBeInTheDocument();
    expect(tasksBtn).toBeInTheDocument();
    expect(statsBtn).toBeInTheDocument();

    expect(timerBtn).toHaveClass('bg-surface');
    expect(tasksBtn).not.toHaveClass('bg-surface');
    expect(statsBtn).not.toHaveClass('bg-surface');
  });

  it('triggers onTabChange callback when a tab button is clicked', async () => {
    const onTabChangeMock = vi.fn();
    const { getByLabelText } = render(TabBar, {
      activeTab: 'timer',
      onTabChange: onTabChangeMock,
    });

    const tasksBtn = getByLabelText('Tasks');
    await fireEvent.click(tasksBtn);

    expect(onTabChangeMock).toHaveBeenCalledWith('tasks');
  });
});
