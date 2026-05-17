import type { TimerState, TimerConfig, SessionType } from './types';

/**
 * Commands that can be dispatched to the TimerService.
 */
export type TimerCommand = 'START' | 'PAUSE' | 'RESET' | 'SKIP';

/**
 * Interface for observers interested in timer events.
 * Enables multiple notification types, third-party integrations, and custom tick behaviors.
 */
export interface TimerObserver {
  onTick?(state: TimerState): void;
  onStateChange?(state: TimerState): void;
  onSessionComplete?(type: SessionType, state: TimerState): void;
}

/**
 * TimerService: The primary entry point for timer orchestration.
 * Hides implementation details like browser.alarms, browser.storage, and state transition logic.
 * Follows the 'Deep Module' principle by providing a simple interface for complex behavior.
 */
export interface TimerService {
  /**
   * Dispatches a high-level command to the timer.
   * Handles storage updates and alarm management internally.
   */
  sendCommand(command: TimerCommand): Promise<void>;

  /**
   * Internal tick handler to be called by the system alarm adapter.
   * Encapsulates logic for decrementing time, handling transitions, and persistence.
   */
  handleTick(): Promise<void>;

  /**
   * Returns the current state of the timer.
   */
  getState(): Promise<TimerState>;

  /**
   * Returns the current configuration.
   */
  getConfig(): Promise<TimerConfig>;

  /**
   * Observability: Add an observer for side effects (notifications, analytics, etc.)
   */
  addObserver(observer: TimerObserver): void;

  /**
   * Observability: Remove a registered observer.
   */
  removeObserver(observer: TimerObserver): void;
}

/**
 * PersistencePort: Interface for state and config persistence.
 */
export interface PersistencePort {
  loadState(): Promise<TimerState>;
  saveState(state: TimerState): Promise<void>;
  loadConfig(): Promise<TimerConfig>;
  recordSessionCompletion(type: SessionType): Promise<void>;
}

/**
 * TickerPort: Interface for the underlying timing mechanism.
 */
export interface TickerPort {
  enableTick(): void;
  disableTick(): void;
}
