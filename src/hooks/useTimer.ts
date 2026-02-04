import { useState, useCallback, useRef, useEffect } from 'react';
import type { TimerState, SessionType, TimerSettings, TimerStatus } from '../types/timer';
import { DEFAULT_SETTINGS } from '../types/timer';

interface UseTimerOptions {
  settings?: TimerSettings;
  onSessionComplete?: (sessionType: SessionType, completedSessions: number) => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const { settings = DEFAULT_SETTINGS, onSessionComplete } = options;

  const [state, setState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeRemaining, setTimeRemaining] = useState(settings.focusDuration);
  const [completedSessions, setCompletedSessions] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const onSessionCompleteRef = useRef(onSessionComplete);

  // Keep callback ref up to date
  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  const getDuration = useCallback((type: SessionType): number => {
    switch (type) {
      case 'focus':
        return settings.focusDuration;
      case 'shortBreak':
        return settings.shortBreakDuration;
      case 'longBreak':
        return settings.longBreakDuration;
    }
  }, [settings]);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        // Timer finished - STOP, don't auto-continue
        clearTimerInterval();
        setState('finished');

        // Update completed sessions if this was a focus session
        if (sessionType === 'focus') {
          setCompletedSessions(c => {
            const newCount = c + 1;
            onSessionCompleteRef.current?.(sessionType, newCount);
            return newCount;
          });
        } else {
          onSessionCompleteRef.current?.(sessionType, completedSessions);
        }

        return 0;
      }
      return prev - 1;
    });
  }, [clearTimerInterval, sessionType, completedSessions]);

  const start = useCallback(() => {
    if (state === 'running') return;

    if (state === 'idle' || state === 'finished') {
      // Starting fresh
      setTimeRemaining(getDuration(sessionType));
    }

    setState('running');
    intervalRef.current = window.setInterval(tick, 1000);
  }, [state, sessionType, getDuration, tick]);

  const pause = useCallback(() => {
    if (state !== 'running') return;

    clearTimerInterval();
    setState('paused');
  }, [state, clearTimerInterval]);

  const resume = useCallback(() => {
    if (state !== 'paused') return;

    setState('running');
    intervalRef.current = window.setInterval(tick, 1000);
  }, [state, tick]);

  const reset = useCallback(() => {
    clearTimerInterval();
    setState('idle');
    setTimeRemaining(getDuration(sessionType));
  }, [clearTimerInterval, getDuration, sessionType]);

  const startNextSession = useCallback(() => {
    clearTimerInterval();

    // Determine next session type
    let nextType: SessionType;
    if (sessionType === 'focus') {
      // After focus, take a break
      if (completedSessions > 0 && completedSessions % settings.sessionsBeforeLongBreak === 0) {
        nextType = 'longBreak';
      } else {
        nextType = 'shortBreak';
      }
    } else {
      // After any break, go back to focus
      nextType = 'focus';
    }

    setSessionType(nextType);
    setTimeRemaining(getDuration(nextType));
    setState('idle');
  }, [clearTimerInterval, sessionType, completedSessions, settings.sessionsBeforeLongBreak, getDuration]);

  const setSession = useCallback((type: SessionType) => {
    clearTimerInterval();
    setSessionType(type);
    setTimeRemaining(getDuration(type));
    setState('idle');
  }, [clearTimerInterval, getDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  const status: TimerStatus = {
    state,
    sessionType,
    timeRemaining,
    totalTime: getDuration(sessionType),
    completedSessions,
  };

  return {
    status,
    start,
    pause,
    resume,
    reset,
    startNextSession,
    setSession,
  };
}
