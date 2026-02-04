export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

export interface TimerSettings {
  focusDuration: number;      // in seconds
  shortBreakDuration: number; // in seconds
  longBreakDuration: number;  // in seconds
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
  soundVolume: number;        // 0-1
  selectedSound: string;
}

export interface TimerStatus {
  state: TimerState;
  sessionType: SessionType;
  timeRemaining: number;      // in seconds
  totalTime: number;          // in seconds
  completedSessions: number;
}

export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25 * 60,     // 25 minutes
  shortBreakDuration: 5 * 60,  // 5 minutes
  longBreakDuration: 15 * 60,  // 15 minutes
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
  soundVolume: 0.8,
  selectedSound: 'bell',
};
