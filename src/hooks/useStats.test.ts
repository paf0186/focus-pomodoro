import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStats } from './useStats';

describe('useStats', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(localStorage.setItem).mockClear();
  });

  describe('initial state', () => {
    it('starts with empty stats', () => {
      const { result } = renderHook(() => useStats());

      expect(result.current.stats.totalSessions).toBe(0);
      expect(result.current.stats.totalMinutes).toBe(0);
    });

    it('loads saved stats from localStorage', () => {
      const savedStats = {
        dailyStats: {
          '2024-01-15': { date: '2024-01-15', focusSessions: 5, totalFocusMinutes: 125 },
        },
        totalSessions: 5,
        totalMinutes: 125,
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(savedStats));

      const { result } = renderHook(() => useStats());

      expect(result.current.stats.totalSessions).toBe(5);
      expect(result.current.stats.totalMinutes).toBe(125);
    });
  });

  describe('recordSession', () => {
    it('records a focus session', () => {
      const { result } = renderHook(() => useStats());

      act(() => {
        result.current.recordSession(25);
      });

      expect(result.current.stats.totalSessions).toBe(1);
      expect(result.current.stats.totalMinutes).toBe(25);
    });

    it('accumulates multiple sessions', () => {
      const { result } = renderHook(() => useStats());

      act(() => {
        result.current.recordSession(25);
        result.current.recordSession(25);
        result.current.recordSession(25);
      });

      expect(result.current.stats.totalSessions).toBe(3);
      expect(result.current.stats.totalMinutes).toBe(75);
    });

    it('saves to localStorage after recording', () => {
      const { result } = renderHook(() => useStats());

      act(() => {
        result.current.recordSession(25);
      });

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getTodayStats', () => {
    it('returns empty stats for today if no sessions', () => {
      const { result } = renderHook(() => useStats());

      const today = result.current.getTodayStats();

      expect(today.focusSessions).toBe(0);
      expect(today.totalFocusMinutes).toBe(0);
    });

    it('returns accumulated stats for today', () => {
      const { result } = renderHook(() => useStats());

      act(() => {
        result.current.recordSession(25);
        result.current.recordSession(25);
      });

      const today = result.current.getTodayStats();

      expect(today.focusSessions).toBe(2);
      expect(today.totalFocusMinutes).toBe(50);
    });
  });

  describe('getWeekStats', () => {
    it('returns 7 days of stats', () => {
      const { result } = renderHook(() => useStats());

      const week = result.current.getWeekStats();

      expect(week).toHaveLength(7);
    });

    it('includes today as the last day', () => {
      const { result } = renderHook(() => useStats());

      const week = result.current.getWeekStats();
      const today = new Date().toISOString().split('T')[0];

      expect(week[6].date).toBe(today);
    });
  });

  describe('resetStats', () => {
    it('clears all stats', () => {
      const { result } = renderHook(() => useStats());

      act(() => {
        result.current.recordSession(25);
        result.current.recordSession(25);
      });

      expect(result.current.stats.totalSessions).toBe(2);

      act(() => {
        result.current.resetStats();
      });

      expect(result.current.stats.totalSessions).toBe(0);
      expect(result.current.stats.totalMinutes).toBe(0);
    });
  });
});
