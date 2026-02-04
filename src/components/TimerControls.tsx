import type { TimerStatus, SessionType } from '../types/timer';
import './TimerControls.css';

interface TimerControlsProps {
  status: TimerStatus;
  onReset: () => void;
  onNextSession: () => void;
  onSetSession: (type: SessionType) => void;
}

export function TimerControls({ status, onReset, onNextSession, onSetSession }: TimerControlsProps) {
  const { state, sessionType, completedSessions } = status;
  const showReset = state === 'running' || state === 'paused';
  const showNext = state === 'finished';

  return (
    <div className="timer-controls">
      {/* Session type tabs */}
      <div className="session-tabs">
        <button
          className={`session-tab ${sessionType === 'focus' ? 'active' : ''}`}
          onClick={() => onSetSession('focus')}
          disabled={state === 'running'}
        >
          Focus
        </button>
        <button
          className={`session-tab ${sessionType === 'shortBreak' ? 'active' : ''}`}
          onClick={() => onSetSession('shortBreak')}
          disabled={state === 'running'}
        >
          Short
        </button>
        <button
          className={`session-tab ${sessionType === 'longBreak' ? 'active' : ''}`}
          onClick={() => onSetSession('longBreak')}
          disabled={state === 'running'}
        >
          Long
        </button>
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        {showReset && (
          <button className="action-btn reset-btn" onClick={onReset}>
            Reset
          </button>
        )}
        {showNext && (
          <button className="action-btn next-btn" onClick={onNextSession}>
            Start Next
          </button>
        )}
      </div>

      {/* Session counter */}
      <div className="session-counter">
        <span className="counter-label">Completed</span>
        <span className="counter-value">{completedSessions}</span>
      </div>
    </div>
  );
}
