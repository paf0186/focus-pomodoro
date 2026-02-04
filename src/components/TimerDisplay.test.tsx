import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimerDisplay } from './TimerDisplay';
import type { TimerStatus } from '../types/timer';

describe('TimerDisplay', () => {
  const baseStatus: TimerStatus = {
    state: 'idle',
    sessionType: 'focus',
    timeRemaining: 1500, // 25 minutes
    totalTime: 1500,
    completedSessions: 0,
  };

  it('displays formatted time correctly', () => {
    render(<TimerDisplay status={baseStatus} onToggle={() => {}} />);

    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('displays session type label', () => {
    render(<TimerDisplay status={baseStatus} onToggle={() => {}} />);

    expect(screen.getByText('Focus')).toBeInTheDocument();
  });

  it('shows different labels for break types', () => {
    const shortBreakStatus = { ...baseStatus, sessionType: 'shortBreak' as const };
    const { rerender } = render(
      <TimerDisplay status={shortBreakStatus} onToggle={() => {}} />
    );

    expect(screen.getByText('Short Break')).toBeInTheDocument();

    const longBreakStatus = { ...baseStatus, sessionType: 'longBreak' as const };
    rerender(<TimerDisplay status={longBreakStatus} onToggle={() => {}} />);

    expect(screen.getByText('Long Break')).toBeInTheDocument();
  });

  it('calls onToggle when clicked in idle state', () => {
    const onToggle = vi.fn();
    render(<TimerDisplay status={baseStatus} onToggle={onToggle} />);

    const svg = document.querySelector('.timer-ring');
    expect(svg).not.toBeNull();
    fireEvent.click(svg!);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle when clicked in running state', () => {
    const onToggle = vi.fn();
    const runningStatus = { ...baseStatus, state: 'running' as const };
    render(<TimerDisplay status={runningStatus} onToggle={onToggle} />);

    const svg = document.querySelector('.timer-ring');
    fireEvent.click(svg!);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows "Session Complete!" when finished', () => {
    const finishedStatus = {
      ...baseStatus,
      state: 'finished' as const,
      timeRemaining: 0,
    };
    render(<TimerDisplay status={finishedStatus} onToggle={() => {}} />);

    expect(screen.getByText('Session Complete!')).toBeInTheDocument();
  });

  it('formats time with leading zeros', () => {
    const status = { ...baseStatus, timeRemaining: 65 }; // 1:05
    render(<TimerDisplay status={status} onToggle={() => {}} />);

    expect(screen.getByText('01:05')).toBeInTheDocument();
  });

  it('displays zero time correctly', () => {
    const status = { ...baseStatus, timeRemaining: 0 };
    render(<TimerDisplay status={status} onToggle={() => {}} />);

    expect(screen.getByText('00:00')).toBeInTheDocument();
  });
});
