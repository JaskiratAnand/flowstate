import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import StatsDashboard from './StatsDashboard.svelte';
import type { Stats } from '../lib/types';

const mockStorage: Record<string, any> = {};
const storageListeners = new Set<
  (changes: Record<string, any>, areaName: string) => void
>();

vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      onChanged: {
        addListener: vi.fn((listener) => storageListeners.add(listener)),
        removeListener: vi.fn((listener) => storageListeners.delete(listener)),
      },
      local: {
        onChanged: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('../lib/storage', () => ({
  STORAGE_KEYS: {
    STATS: 'stats',
  },
  getStorageItem: vi.fn((key: string) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
}));

describe('StatsDashboard Component', () => {
  let initialStats: Stats;

  beforeEach(() => {
    vi.clearAllMocks();
    storageListeners.clear();
    initialStats = {
      currentStreak: 5,
      dailyPomodoros: 4,
      dailyTasksCompleted: 3,
      allTimePomodoros: 120,
      lastActiveDate: '2026-05-24',
    };
    mockStorage['STATS'] = initialStats;
  });

  it('renders stats metrics correctly', async () => {
    const { getByText } = render(StatsDashboard);

    await waitFor(() => {
      expect(getByText('5')).toBeInTheDocument();
    });

    expect(getByText('Current Streak')).toBeInTheDocument();
    expect(getByText("Today's Focus")).toBeInTheDocument();
    expect(getByText('Tasks Done')).toBeInTheDocument();
    expect(getByText('All-Time Total')).toBeInTheDocument();

    expect(getByText('4')).toBeInTheDocument();
    expect(getByText('3')).toBeInTheDocument();
    expect(getByText('120')).toBeInTheDocument();
  });

  it('updates values when storage changes', async () => {
    const { getByText } = render(StatsDashboard);

    await waitFor(() => {
      expect(getByText('5')).toBeInTheDocument();
    });

    const updatedStats: Stats = {
      ...initialStats,
      currentStreak: 6,
      dailyPomodoros: 5,
    };

    // Simulate storage change
    storageListeners.forEach((listener) =>
      listener(
        {
          stats: {
            newValue: updatedStats,
          },
        },
        'local',
      ),
    );

    await waitFor(() => {
      expect(getByText('6')).toBeInTheDocument();
      expect(getByText('5')).toBeInTheDocument();
    });
  });
});
