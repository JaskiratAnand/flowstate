import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TimerConfigComp from './TimerConfig.svelte';
import type { TimerConfig } from '../lib/types';

const mockStorage: Record<string, any> = {};
vi.mock('../lib/storage', () => ({
  setStorageItem: vi.fn((key: string, data: any) => {
    mockStorage[key] = data;
    return Promise.resolve();
  }),
}));

describe('TimerConfig Component', () => {
  let initialConfig: TimerConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    initialConfig = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
    };
  });

  it('renders input elements with correct values', () => {
    const { getByLabelText } = render(TimerConfigComp, {
      config: initialConfig,
    });

    const workInput = getByLabelText('Focus') as HTMLInputElement;
    const shortInput = getByLabelText('Short') as HTMLInputElement;
    const longInput = getByLabelText('Long') as HTMLInputElement;

    expect(workInput.value).toBe('25');
    expect(shortInput.value).toBe('5');
    expect(longInput.value).toBe('15');
  });

  it('calls setStorageItem and updates bound value on change', async () => {
    const { getByLabelText } = render(TimerConfigComp, {
      config: initialConfig,
    });
    const workInput = getByLabelText('Focus') as HTMLInputElement;

    await fireEvent.input(workInput, { target: { value: '30' } });
    await fireEvent.change(workInput);

    expect(initialConfig.workDuration).toBe(30);

    const { setStorageItem } = await import('../lib/storage');
    expect(setStorageItem).toHaveBeenCalledWith(
      'TIMER_CONFIG',
      expect.objectContaining({
        workDuration: 30,
        shortBreakDuration: 5,
        longBreakDuration: 15,
      }),
    );
  });
});
