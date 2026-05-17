import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('START: should move from idle to running and schedule alarm', async () => {
    await engine.execute('START');

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'running',
      }),
    );
    expect(alarms.scheduleTick).toHaveBeenCalled();
  });

  it('PAUSE: should move from running to paused and clear alarm', async () => {
    // Setup running state
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
    });

    await engine.execute('PAUSE');

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paused',
      }),
    );
    expect(alarms.clearTick).toHaveBeenCalled();
  });

  it('TICK (Progress): should decrement time and persist', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
      remainingSeconds: 1500,
    });

    await engine.tick();

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        remainingSeconds: 1499,
      }),
    );
  });

  it('TICK (Completion): should transition session, clear alarm and trigger feedback', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
      remainingSeconds: 0,
      sessionType: 'work',
    });

    await engine.tick();

    // Should transition to short-break
    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionType: 'short-break',
        status: 'idle',
      }),
    );

    expect(alarms.clearTick).toHaveBeenCalled();
    expect(feedback.playChime).toHaveBeenCalled();
    expect(feedback.notify).toHaveBeenCalled();
  });

  it('RESET: should revert to idle and clear alarm', async () => {
    storage.getState = vi.fn().mockResolvedValue({
      ...initialState,
      status: 'running',
      remainingSeconds: 600,
    });

    await engine.execute('RESET');

    expect(storage.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'idle',
        remainingSeconds: 25 * 60,
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
