import type { DailyStats } from '../types/stats';
import './StatsDisplay.css';

interface StatsDisplayProps {
  todayStats: DailyStats;
  weekStats: DailyStats[];
  isOpen: boolean;
  onClose: () => void;
}

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00'); // Noon to avoid timezone issues
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) {
    return 'Today';
  }
  if (dateStr === yesterday.toISOString().split('T')[0]) {
    return 'Yest';
  }

  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
}

export function StatsDisplay({ todayStats, weekStats, isOpen, onClose }: StatsDisplayProps) {
  if (!isOpen) return null;

  const maxSessions = Math.max(...weekStats.map(d => d.focusSessions), 1);

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-panel" onClick={e => e.stopPropagation()}>
        <h2 className="stats-title">Statistics</h2>

        {/* Today's summary */}
        <div className="today-summary">
          <div className="stat-box">
            <span className="stat-value">{todayStats.focusSessions}</span>
            <span className="stat-label">Sessions Today</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{todayStats.totalFocusMinutes}</span>
            <span className="stat-label">Minutes Today</span>
          </div>
        </div>

        {/* Week chart */}
        <div className="week-section">
          <h3>This Week</h3>
          <div className="week-chart">
            {weekStats.map(day => (
              <div key={day.date} className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    height: `${(day.focusSessions / maxSessions) * 100}%`,
                    minHeight: day.focusSessions > 0 ? '8px' : '0',
                  }}
                />
                <span className="chart-count">{day.focusSessions}</span>
                <span className="chart-label">{getDayLabel(day.date)}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="stats-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
