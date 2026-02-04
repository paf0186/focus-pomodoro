import { useState, useCallback, useEffect } from 'react';
import type { Stats, DailyStats } from '../types/stats';
import { EMPTY_STATS } from '../types/stats';

const STORAGE_KEY = 'pomodoro-stats';

function loadStats(): Stats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...EMPTY_STATS, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore parse errors
  }
  return EMPTY_STATS;
}

function saveStats(stats: Stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(loadStats);

  // Save whenever stats change
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const recordSession = useCallback((focusMinutes: number) => {
    const today = getTodayKey();

    setStats(prev => {
      const existing = prev.dailyStats[today] || {
        date: today,
        focusSessions: 0,
        totalFocusMinutes: 0,
      };

      const updatedDaily: DailyStats = {
        ...existing,
        focusSessions: existing.focusSessions + 1,
        totalFocusMinutes: existing.totalFocusMinutes + focusMinutes,
      };

      return {
        dailyStats: {
          ...prev.dailyStats,
          [today]: updatedDaily,
        },
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + focusMinutes,
      };
    });
  }, []);

  const getTodayStats = useCallback((): DailyStats => {
    const today = getTodayKey();
    return stats.dailyStats[today] || {
      date: today,
      focusSessions: 0,
      totalFocusMinutes: 0,
    };
  }, [stats]);

  const getWeekStats = useCallback((): DailyStats[] => {
    const result: DailyStats[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];

      result.push(
        stats.dailyStats[key] || {
          date: key,
          focusSessions: 0,
          totalFocusMinutes: 0,
        }
      );
    }

    return result;
  }, [stats]);

  const resetStats = useCallback(() => {
    setStats(EMPTY_STATS);
  }, []);

  return {
    stats,
    recordSession,
    getTodayStats,
    getWeekStats,
    resetStats,
  };
}
