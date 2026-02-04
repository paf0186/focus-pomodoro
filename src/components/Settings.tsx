import { useState } from 'react';
import type { TimerSettings } from '../types/timer';
import './Settings.css';

interface SettingsProps {
  settings: TimerSettings;
  onSettingsChange: (settings: TimerSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SOUNDS = [
  { id: 'bell', name: 'Bell' },
  { id: 'chime', name: 'Chime' },
  { id: 'gong', name: 'Gong' },
  { id: 'digital', name: 'Digital' },
];

export function Settings({ settings, onSettingsChange, isOpen, onClose }: SettingsProps) {
  const [draft, setDraft] = useState(settings);

  const handleSave = () => {
    onSettingsChange(draft);
    onClose();
  };

  const handleCancel = () => {
    setDraft(settings);
    onClose();
  };

  const updateDraft = (updates: Partial<TimerSettings>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={handleCancel}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <h2 className="settings-title">Settings</h2>

        <div className="settings-section">
          <h3>Timer Durations</h3>

          <div className="setting-row">
            <label>Focus</label>
            <div className="duration-input">
              <input
                type="number"
                min="1"
                max="120"
                value={Math.round(draft.focusDuration / 60)}
                onChange={e => updateDraft({ focusDuration: Number(e.target.value) * 60 })}
              />
              <span>min</span>
            </div>
          </div>

          <div className="setting-row">
            <label>Short Break</label>
            <div className="duration-input">
              <input
                type="number"
                min="1"
                max="30"
                value={Math.round(draft.shortBreakDuration / 60)}
                onChange={e => updateDraft({ shortBreakDuration: Number(e.target.value) * 60 })}
              />
              <span>min</span>
            </div>
          </div>

          <div className="setting-row">
            <label>Long Break</label>
            <div className="duration-input">
              <input
                type="number"
                min="1"
                max="60"
                value={Math.round(draft.longBreakDuration / 60)}
                onChange={e => updateDraft({ longBreakDuration: Number(e.target.value) * 60 })}
              />
              <span>min</span>
            </div>
          </div>

          <div className="setting-row">
            <label>Sessions before long break</label>
            <div className="duration-input">
              <input
                type="number"
                min="1"
                max="10"
                value={draft.sessionsBeforeLongBreak}
                onChange={e => updateDraft({ sessionsBeforeLongBreak: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Sound</h3>

          <div className="setting-row">
            <label>Sound enabled</label>
            <input
              type="checkbox"
              checked={draft.soundEnabled}
              onChange={e => updateDraft({ soundEnabled: e.target.checked })}
            />
          </div>

          <div className="setting-row">
            <label>Alert sound</label>
            <select
              value={draft.selectedSound}
              onChange={e => updateDraft({ selectedSound: e.target.value })}
              disabled={!draft.soundEnabled}
            >
              {SOUNDS.map(sound => (
                <option key={sound.id} value={sound.id}>
                  {sound.name}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-row">
            <label>Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={draft.soundVolume}
              onChange={e => updateDraft({ soundVolume: Number(e.target.value) })}
              disabled={!draft.soundEnabled}
            />
          </div>
        </div>

        <div className="settings-buttons">
          <button className="settings-btn cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="settings-btn save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
