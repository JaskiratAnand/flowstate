export type TimerStatus = 'idle' | 'running' | 'paused';
export type SessionType = 'work' | 'short-break' | 'long-break';

export interface TimerState {
  status: TimerStatus;
  remainingSeconds: number;
  sessionType: SessionType;
  completedSessions: number;
}

export interface TimerConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  order: number;
  createdAt: number;
}

export interface DailyArchive {
  [dateKey: string]: Task[]; // Keyed by YYYY-MM-DD
}

export interface Stats {
  dailyPomodoros: number;
  dailyTasksCompleted: number;
  currentStreak: number;
  allTimePomodoros: number;
  lastActiveDate: string; // YYYY-MM-DD to track streak reset
}

export type Theme = 'ocean' | 'forest' | 'sunset' | 'custom';
export type TabType = 'timer' | 'tasks' | 'stats';
export type ColorScheme = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: Theme;
  customAccentColor?: string;
  colorScheme: ColorScheme;
  lastActiveTab: TabType;
}

export type MessageType =
  | 'START_TIMER'
  | 'PAUSE_TIMER'
  | 'RESET_TIMER'
  | 'SKIP_SESSION'
  | 'UPDATE_CONFIG';

export interface ActionMessage {
  type: MessageType;
  payload?: any;
}
