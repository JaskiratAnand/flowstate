import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WxtAlarmAdapter } from './wxt-adapters';

describe('WxtAlarmAdapter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should trigger a tick every second using setInterval', async () => {
    const onTick = vi.fn();
    const adapter = new WxtAlarmAdapter(onTick);

    await adapter.scheduleTick();

    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(2);

    await adapter.clearTick();
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(2);
  });
});
