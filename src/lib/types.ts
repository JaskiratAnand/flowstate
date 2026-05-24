export type TimerStatus = 'idle' | 'running' | 'paused';
export type SessionType = 'work' | 'short-break' | 'long-break';

export interface TimerState {
  status: TimerStatus;
  remainingSeconds: number;
  sessionType: SessionType;
  completedSessions: number;
  expectedEndTime?: number;
}

export interface TimerConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

export type PriorityLevel = 'high' | 'medium' | 'low' | 'none';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  order: number;
  createdAt: number;
  priority?: PriorityLevel;
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
export type TabType = 'timer' | 'tasks' | 'stats' | 'settings' | 'about';
export type ColorScheme = 'light' | 'dark' | 'system';
export type FontFamily = 'karla' | 'fraunces' | 'mono' | 'system';

export interface UserPreferences {
  theme: Theme;
  customAccentColor?: string;
  colorScheme: ColorScheme;
  fontFamily: FontFamily;
  lastActiveTab: TabType;
  moveHighPriorityToTop?: boolean;
}

export type MessageType =
  | 'START_TIMER'
  | 'PAUSE_TIMER'
  | 'RESET_TIMER'
  | 'SKIP_SESSION'
  | 'UPDATE_CONFIG'
  | 'BYPASS_SITE';

export interface ActionMessage {
  type: MessageType;
  payload?: any;
}

export interface BlockingConfig {
  enabled: boolean;
  mode: 'blocklist' | 'allowlist';
  strictMode: boolean;
  bypassDuration: number; // in minutes
  blockedSites: string[];
  allowedSites: string[];
}

export interface BypassItem {
  domain: string;
  expiresAt: number; // timestamp in ms
}
