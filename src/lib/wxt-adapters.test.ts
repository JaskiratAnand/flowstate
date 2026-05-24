import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WxtAlarmAdapter } from './wxt-adapters';

vi.mock('wxt/browser', () => ({
  browser: {
    alarms: {
      create: vi.fn(),
      clear: vi.fn(),
    },
  },
}));

import { browser } from 'wxt/browser';

describe('WxtAlarmAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scheduleTick creates a browser alarm named pomodoro-tick with the expected endTime', async () => {
    const adapter = new WxtAlarmAdapter();
    const expectedEndTime = 123456789;
    await adapter.scheduleTick(expectedEndTime);
    expect(browser.alarms.create).toHaveBeenCalledWith('pomodoro-tick', {
      when: expectedEndTime,
    });
  });

  it('clearTick clears the pomodoro-tick browser alarm', async () => {
    const adapter = new WxtAlarmAdapter();
    await adapter.clearTick();
    expect(browser.alarms.clear).toHaveBeenCalledWith('pomodoro-tick');
  });
});
