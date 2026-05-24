import { startTimer, pauseTimer, tickTimer, resetTimer } from './timer';
import type { TimerState, TimerConfig } from './types';

export interface StoragePort {
  getState(): Promise<TimerState>;
  setState(state: TimerState): Promise<void>;
  getConfig(): Promise<TimerConfig>;
}

export interface AlarmPort {
  scheduleTick(expectedEndTime: number): Promise<void>;
  clearTick(): Promise<void>;
}

export interface FeedbackPort {
  notify(title: string, message: string): Promise<void>;
  playChime(): Promise<void>;
}

export interface TimerEngine {
  execute(command: 'START' | 'PAUSE' | 'RESET' | 'SKIP'): Promise<void>;
  tick(): Promise<void>;
  syncWithConfig(): Promise<void>;
}

export class TimerEngineImpl implements TimerEngine {
  constructor(
    private storage: StoragePort,
    private alarms: AlarmPort,
    private feedback: FeedbackPort,
  ) {}

  async execute(command: 'START' | 'PAUSE' | 'RESET' | 'SKIP'): Promise<void> {
    const state = await this.storage.getState();
    const config = await this.storage.getConfig();

    if (!state || !config) return;

    let nextState: TimerState = state;

    switch (command) {
      case 'START':
        nextState = startTimer(state, config);
        if (nextState.status === 'running') {
          const expectedEndTime =
            Date.now() + nextState.remainingSeconds * 1000;
          nextState.expectedEndTime = expectedEndTime;
          await this.alarms.scheduleTick(expectedEndTime);
        }
        break;
      case 'PAUSE':
        if (state.status === 'running' && state.expectedEndTime) {
          const remaining = Math.max(
            0,
            Math.ceil((state.expectedEndTime - Date.now()) / 1000),
          );
          nextState = {
            ...state,
            status: 'paused',
            remainingSeconds: remaining,
            expectedEndTime: undefined,
          };
        } else {
          nextState = pauseTimer(state);
        }
        await this.alarms.clearTick();
        break;
      case 'RESET':
        nextState = resetTimer(state, config);
        nextState.expectedEndTime = undefined;
        await this.alarms.clearTick();
        break;
      case 'SKIP':
        // Force end current session
        const endState = {
          ...state,
          status: 'running' as const,
          remainingSeconds: 0,
          expectedEndTime: undefined,
        };
        nextState = tickTimer(endState, config);
        nextState.expectedEndTime = undefined;
        await this.alarms.clearTick();
        break;
    }

    await this.storage.setState(nextState);
  }

  async syncWithConfig(): Promise<void> {
    const state = await this.storage.getState();
    const config = await this.storage.getConfig();

    if (!state || !config || state.status !== 'idle') return;

    let seconds = config.workDuration * 60;
    if (state.sessionType === 'short-break')
      seconds = config.shortBreakDuration * 60;
    if (state.sessionType === 'long-break')
      seconds = config.longBreakDuration * 60;

    if (state.remainingSeconds !== seconds) {
      await this.storage.setState({
        ...state,
        remainingSeconds: seconds,
      });
    }
  }

  async tick(): Promise<void> {
    const state = await this.storage.getState();
    const config = await this.storage.getConfig();

    if (!state || !config || state.status !== 'running') return;

    const endState = {
      ...state,
      remainingSeconds: 0,
      expectedEndTime: undefined,
    };
    const nextState = tickTimer(endState, config);
    nextState.expectedEndTime = undefined;

    await this.alarms.clearTick();
    await this.feedback.playChime();

    const title =
      state.sessionType === 'work' ? 'Work Session Complete!' : 'Break Over!';
    const message =
      state.sessionType === 'work'
        ? 'Time for a break.'
        : 'Time to get back to work.';
    await this.feedback.notify(title, message);

    await this.storage.setState(nextState);
  }
}
