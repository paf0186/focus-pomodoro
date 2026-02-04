import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';
import { DEFAULT_SETTINGS } from '../types/timer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts in idle state', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.status.state).toBe('idle');
      expect(result.current.status.sessionType).toBe('focus');
      expect(result.current.status.timeRemaining).toBe(DEFAULT_SETTINGS.focusDuration);
      expect(result.current.status.completedSessions).toBe(0);
    });

    it('uses custom settings', () => {
      const customSettings = { ...DEFAULT_SETTINGS, focusDuration: 600 };
      const { result } = renderHook(() => useTimer({ settings: customSettings }));

      expect(result.current.status.timeRemaining).toBe(600);
    });
  });

  describe('start/pause/resume', () => {
    it('starts the timer from idle state', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.status.state).toBe('running');
    });

    it('counts down when running', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      const initialTime = result.current.status.timeRemaining;

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.status.timeRemaining).toBe(initialTime - 1);
    });

    it('pauses the timer', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const timeBeforePause = result.current.status.timeRemaining;

      act(() => {
        result.current.pause();
      });

      expect(result.current.status.state).toBe('paused');

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Time should not have changed
      expect(result.current.status.timeRemaining).toBe(timeBeforePause);
    });

    it('resumes the timer from paused state', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1000);
        result.current.pause();
      });

      const timeBeforeResume = result.current.status.timeRemaining;

      act(() => {
        result.current.resume();
      });

      expect(result.current.status.state).toBe('running');

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.status.timeRemaining).toBe(timeBeforeResume - 1);
    });
  });

  describe('completion behavior', () => {
    it('transitions to finished state when timer completes', () => {
      const settings = { ...DEFAULT_SETTINGS, focusDuration: 3 }; // 3 seconds
      const { result } = renderHook(() => useTimer({ settings }));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.status.state).toBe('finished');
      expect(result.current.status.timeRemaining).toBe(0);
    });

    it('STOPS on completion - does not auto-continue', () => {
      const settings = { ...DEFAULT_SETTINGS, focusDuration: 2 };
      const { result } = renderHook(() => useTimer({ settings }));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should still be finished, not automatically moved to break
      expect(result.current.status.state).toBe('finished');
      expect(result.current.status.sessionType).toBe('focus');
    });

    it('calls onSessionComplete callback when timer finishes', () => {
      const onSessionComplete = vi.fn();
      const settings = { ...DEFAULT_SETTINGS, focusDuration: 2 };
      const { result } = renderHook(() =>
        useTimer({ settings, onSessionComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onSessionComplete).toHaveBeenCalledWith('focus', 1);
    });

    it('increments completed sessions after focus session', () => {
      const settings = { ...DEFAULT_SETTINGS, focusDuration: 2 };
      const { result } = renderHook(() => useTimer({ settings }));

      expect(result.current.status.completedSessions).toBe(0);

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.status.completedSessions).toBe(1);
    });

    it('does not increment completed sessions after break', () => {
      const settings = { ...DEFAULT_SETTINGS, shortBreakDuration: 2 };
      const { result } = renderHook(() => useTimer({ settings }));

      act(() => {
        result.current.setSession('shortBreak');
      });

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.status.completedSessions).toBe(0);
    });
  });

  describe('session transitions', () => {
    it('setSession changes the session type', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setSession('shortBreak');
      });

      expect(result.current.status.sessionType).toBe('shortBreak');
      expect(result.current.status.timeRemaining).toBe(DEFAULT_SETTINGS.shortBreakDuration);
    });

    it('startNextSession moves to break after focus', () => {
      const settings = { ...DEFAULT_SETTINGS, focusDuration: 2 };
      const { result } = renderHook(() => useTimer({ settings }));

      // Complete a focus session
      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      act(() => {
        result.current.startNextSession();
      });

      expect(result.current.status.sessionType).toBe('shortBreak');
      expect(result.current.status.state).toBe('idle');
    });

    it('gives long break after configured number of sessions', () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        focusDuration: 1,
        shortBreakDuration: 1,
        sessionsBeforeLongBreak: 2,
      };
      const { result } = renderHook(() => useTimer({ settings }));

      // Complete session 1 - allow state to settle
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.status.completedSessions).toBe(1);
      act(() => {
        result.current.startNextSession();
      });

      // Complete break
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        result.current.startNextSession();
      });

      // Complete session 2 - allow state to settle
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.status.completedSessions).toBe(2);
      act(() => {
        result.current.startNextSession();
      });

      // Should now be long break (after 2 sessions)
      expect(result.current.status.sessionType).toBe('longBreak');
    });

    it('startNextSession moves back to focus after break', () => {
      const settings = { ...DEFAULT_SETTINGS, shortBreakDuration: 2 };
      const { result } = renderHook(() => useTimer({ settings }));

      act(() => {
        result.current.setSession('shortBreak');
      });

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      act(() => {
        result.current.startNextSession();
      });

      expect(result.current.status.sessionType).toBe('focus');
      expect(result.current.status.state).toBe('idle');
    });
  });

  describe('reset', () => {
    it('resets timer to initial state for current session', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.status.state).toBe('idle');
      expect(result.current.status.timeRemaining).toBe(DEFAULT_SETTINGS.focusDuration);
    });

    it('stops the running timer', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.reset();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Time should not have decreased after reset
      expect(result.current.status.timeRemaining).toBe(DEFAULT_SETTINGS.focusDuration);
    });
  });
});
