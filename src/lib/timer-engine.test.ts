import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TimerEngineImpl,
  type StoragePort,
  type AlarmPort,
  type FeedbackPort,
} from './timer-engine';
import type { TimerState, TimerConfig } from './types';

describe('TimerEngine', () => {
  let storage: StoragePort;
  let alarms: AlarmPort;
  let feedback: FeedbackPort;
  let engine: TimerEngineImpl;

  const initialConfig: TimerConfig = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  };

  const initialState: TimerState = {
    status: 'idle',
    remainingSeconds: 25 * 60,
    sessionType: 'work',
    completedSessions: 0,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-24T00:00:00Z'));

    storage = {
      getState: vi.fn().mockResolvedValue(initialState),
      setState: vi.fn().mockResolvedValue(undefined),
      getConfig: vi.fn().mockResolvedValue(initialConfig),
    };
    alarms = {
      scheduleTick: vi.fn().mockResolvedValue(undefined),
      clearTick: vi.fn().mockResolvedValue(undefined),
    };
    feedback = {
      notify: vi.fn().mockResolvedValue(undefined),
      playChime: vi.fn().mockResolvedValue(undefined),
    };
    engine = new TimerEngineImpl(storage, alarms, feedback);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('START (from idle): should move from idle to running, compute expectedEndTime, and schedule session-end alarm', async () => {
    await engine.execute('START');

    const expectedEndTime = Date.now() + 25 * 60 * 1000;
    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'running',
        expectedEndTime,
      }),
    );
    expect(alarms.scheduleTick).toHaveBeenCalledWith(expectedEndTime);
  });

  it('START (from idle, short-break, remainingSeconds = 0): should set remainingSeconds to short break duration, set status to running, and schedule alarm', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'idle',
      sessionType: 'short-break',
      remainingSeconds: 0,
    });

    await engine.execute('START');

    const expectedEndTime = Date.now() + 5 * 60 * 1000;
    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'running',
        sessionType: 'short-break',
        remainingSeconds: 5 * 60,
        expectedEndTime,
      }),
    );
    expect(alarms.scheduleTick).toHaveBeenCalledWith(expectedEndTime);
  });

  it('START (from idle, short-break, remainingSeconds > 0): should preserve remainingSeconds, set status to running, and schedule alarm', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'idle',
      sessionType: 'short-break',
      remainingSeconds: 300,
    });

    await engine.execute('START');

    const expectedEndTime = Date.now() + 300 * 1000;
    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'running',
        sessionType: 'short-break',
        remainingSeconds: 300,
        expectedEndTime,
      }),
    );
    expect(alarms.scheduleTick).toHaveBeenCalledWith(expectedEndTime);
  });

  it('START (from paused): should start with remaining seconds and set correct expectedEndTime', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'paused',
      remainingSeconds: 600,
    });

    await engine.execute('START');

    const expectedEndTime = Date.now() + 600 * 1000;
    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'running',
        expectedEndTime,
      }),
    );
    expect(alarms.scheduleTick).toHaveBeenCalledWith(expectedEndTime);
  });

  it('PAUSE: should compute remainingSeconds using expectedEndTime, clear expectedEndTime, and clear alarm', async () => {
    const startTime = Date.now();
    const expectedEndTime = startTime + 1500 * 1000;

    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
      expectedEndTime,
      remainingSeconds: 1500,
    });

    // Fast-forward time by 10 minutes (600 seconds)
    vi.advanceTimersByTime(10 * 60 * 1000);

    await engine.execute('PAUSE');

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paused',
        remainingSeconds: 900,
        expectedEndTime: undefined,
      }),
    );
    expect(alarms.clearTick).toHaveBeenCalled();
  });

  it('TICK (Completion): should set remainingSeconds to 0, transition session, clear expectedEndTime/alarm, and trigger feedback', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
      expectedEndTime: Date.now(),
      remainingSeconds: 1500,
      sessionType: 'work',
    });

    await engine.tick();

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionType: 'short-break',
        status: 'idle',
        remainingSeconds: 5 * 60,
        expectedEndTime: undefined,
      }),
    );

    expect(alarms.clearTick).toHaveBeenCalled();
    expect(feedback.playChime).toHaveBeenCalled();
    expect(feedback.notify).toHaveBeenCalled();
  });

  it('RESET: should revert to idle, clear expectedEndTime, and clear alarm', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
      expectedEndTime: Date.now() + 1500 * 1000,
      remainingSeconds: 1500,
    });

    await engine.execute('RESET');

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'idle',
        remainingSeconds: 25 * 60,
        expectedEndTime: undefined,
      }),
    );
    expect(alarms.clearTick).toHaveBeenCalled();
  });

  it('SKIP: should transition session to short-break, clear expectedEndTime/alarm, and preserve completedSessions count', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
      expectedEndTime: Date.now() + 1500 * 1000,
      remainingSeconds: 1500,
      sessionType: 'work',
      completedSessions: 1,
    });

    await engine.execute('SKIP');

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionType: 'short-break',
        status: 'idle',
        remainingSeconds: 5 * 60,
        completedSessions: 1,
        expectedEndTime: undefined,
      }),
    );
    expect(alarms.clearTick).toHaveBeenCalled();
  });

  it('SKIP (focus with 3 completed sessions): should transition to long-break, preserve completedSessions count, and clear expectedEndTime/alarm', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
      expectedEndTime: Date.now() + 1500 * 1000,
      remainingSeconds: 1500,
      sessionType: 'work',
      completedSessions: 3,
    });

    await engine.execute('SKIP');

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionType: 'long-break',
        status: 'idle',
        remainingSeconds: 15 * 60,
        completedSessions: 3,
        expectedEndTime: undefined,
      }),
    );
    expect(alarms.clearTick).toHaveBeenCalled();
  });

  it('SKIP (from short break): should transition back to work and set full work duration', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
      expectedEndTime: Date.now() + 300 * 1000,
      remainingSeconds: 300,
      sessionType: 'short-break',
      completedSessions: 1,
    });

    await engine.execute('SKIP');

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionType: 'work',
        status: 'idle',
        remainingSeconds: 25 * 60,
        completedSessions: 1,
        expectedEndTime: undefined,
      }),
    );
    expect(alarms.clearTick).toHaveBeenCalled();
  });

  it('SKIP (from long break): should transition back to work and set full work duration', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'paused',
      remainingSeconds: 900,
      sessionType: 'long-break',
      completedSessions: 4,
    });

    await engine.execute('SKIP');

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionType: 'work',
        status: 'idle',
        remainingSeconds: 25 * 60,
        completedSessions: 4,
        expectedEndTime: undefined,
      }),
    );
    expect(alarms.clearTick).toHaveBeenCalled();
  });

  describe('syncWithConfig', () => {
    it('should update remainingSeconds if status is idle', async () => {
      storage.getConfig = vi.fn().mockResolvedValue({
        ...initialConfig,
        workDuration: 30,
      });

      await engine.syncWithConfig();

      expect(storage.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          remainingSeconds: 30 * 60,
        }),
      );
    });

    it('should NOT update remainingSeconds if status is running', async () => {
      storage.getState = vi.fn().mockResolvedValue({
        ...initialState,
        status: 'running',
        remainingSeconds: 600,
      });
      storage.getConfig = vi.fn().mockResolvedValue({
        ...initialConfig,
        workDuration: 30,
      });

      await engine.syncWithConfig();

      expect(storage.setState).not.toHaveBeenCalled();
    });

    it('should NOT update remainingSeconds if status is paused', async () => {
      storage.getState = vi.fn().mockResolvedValue({
        ...initialState,
        status: 'paused',
        remainingSeconds: 600,
      });
      storage.getConfig = vi.fn().mockResolvedValue({
        ...initialConfig,
        workDuration: 30,
      });

      await engine.syncWithConfig();

      expect(storage.setState).not.toHaveBeenCalled();
    });
  });
});
