import type { TimerStatus, SessionType } from '../types/timer';
import './TimerDisplay.css';

interface TimerDisplayProps {
  status: TimerStatus;
  onToggle: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getSessionLabel(type: SessionType): string {
  switch (type) {
    case 'focus':
      return 'Focus';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
  }
}

function getSessionColor(type: SessionType): string {
  switch (type) {
    case 'focus':
      return '#FF6B6B';
    case 'shortBreak':
      return '#4ECDC4';
    case 'longBreak':
      return '#45B7D1';
  }
}

export function TimerDisplay({ status, onToggle }: TimerDisplayProps) {
  const { state, sessionType, timeRemaining, totalTime } = status;

  const progress = totalTime > 0 ? timeRemaining / totalTime : 1;
  const circumference = 2 * Math.PI * 140; // radius = 140
  const strokeDashoffset = circumference * (1 - progress);
  const color = getSessionColor(sessionType);

  const isClickable = state === 'idle' || state === 'running' || state === 'paused';
  const showPlayIcon = state === 'idle' || state === 'paused';

  return (
    <div className="timer-display">
      <svg
        className="timer-ring"
        viewBox="0 0 320 320"
        onClick={isClickable ? onToggle : undefined}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
      >
        {/* Background ring */}
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="12"
        />
        {/* Progress ring */}
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 160 160)"
          className="progress-ring"
        />
        {/* Time display */}
        <text
          x="160"
          y="145"
          textAnchor="middle"
          className="time-text"
          fill="white"
        >
          {formatTime(timeRemaining)}
        </text>
        {/* Session type label */}
        <text
          x="160"
          y="185"
          textAnchor="middle"
          className="session-label"
          fill={color}
        >
          {getSessionLabel(sessionType)}
        </text>
        {/* Play/Pause indicator */}
        {isClickable && showPlayIcon && (
          <polygon
            points="150,205 150,235 175,220"
            fill="rgba(255, 255, 255, 0.6)"
            className="play-icon"
          />
        )}
        {isClickable && state === 'running' && (
          <g className="pause-icon">
            <rect x="148" y="205" width="8" height="30" fill="rgba(255, 255, 255, 0.6)" rx="2" />
            <rect x="164" y="205" width="8" height="30" fill="rgba(255, 255, 255, 0.6)" rx="2" />
          </g>
        )}
      </svg>

      {state === 'finished' && (
        <div className="finished-indicator" style={{ color }}>
          Session Complete!
        </div>
      )}
    </div>
  );
}
