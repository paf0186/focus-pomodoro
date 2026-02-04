export interface DailyStats {
  date: string; // YYYY-MM-DD format
  focusSessions: number;
  totalFocusMinutes: number;
}

export interface Stats {
  dailyStats: Record<string, DailyStats>;
  totalSessions: number;
  totalMinutes: number;
}

export const EMPTY_STATS: Stats = {
  dailyStats: {},
  totalSessions: 0,
  totalMinutes: 0,
};
