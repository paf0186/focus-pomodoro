import { useState, useCallback, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { Settings } from './components/Settings';
import type { TimerSettings, SessionType } from './types/timer';
import { DEFAULT_SETTINGS } from './types/timer';
import './App.css';

// Load settings from localStorage
function loadSettings(): TimerSettings {
  try {
    const saved = localStorage.getItem('pomodoro-settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
function saveSettings(settings: TimerSettings) {
  localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
}

function App() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSessionComplete = useCallback((sessionType: SessionType) => {
    // Play sound on session complete
    if (settings.soundEnabled) {
      playSound(settings.selectedSound, settings.soundVolume);
    }

    // Show system notification
    showNotification(sessionType);
  }, [settings]);

  const {
    status,
    start,
    pause,
    resume,
    reset,
    startNextSession,
    setSession,
  } = useTimer({
    settings,
    onSessionComplete: handleSessionComplete,
  });

  const handleToggle = useCallback(() => {
    if (status.state === 'idle' || status.state === 'finished') {
      start();
    } else if (status.state === 'running') {
      pause();
    } else if (status.state === 'paused') {
      resume();
    }
  }, [status.state, start, pause, resume]);

  const handleSettingsChange = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  // Update document title with timer
  useEffect(() => {
    const mins = Math.floor(status.timeRemaining / 60);
    const secs = status.timeRemaining % 60;
    const time = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (status.state === 'running') {
      document.title = `${time} - Focus Pomodoro`;
    } else {
      document.title = 'Focus Pomodoro';
    }
  }, [status.timeRemaining, status.state]);

  // Get background color based on session type
  const getBackgroundColor = () => {
    switch (status.sessionType) {
      case 'focus':
        return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)';
      case 'shortBreak':
        return 'linear-gradient(135deg, #1a2e2a 0%, #162e3e 50%, #1a2e2a 100%)';
      case 'longBreak':
        return 'linear-gradient(135deg, #1a2a2e 0%, #163e3e 50%, #1a2a2e 100%)';
    }
  };

  return (
    <div className="app" style={{ background: getBackgroundColor() }}>
      <header className="app-header">
        <h1 className="app-title">Focus</h1>
        <button
          className="settings-button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </button>
      </header>

      <main className="app-main">
        <TimerDisplay status={status} onToggle={handleToggle} />
        <TimerControls
          status={status}
          onReset={reset}
          onNextSession={startNextSession}
          onSetSession={setSession}
        />
      </main>

      <Settings
        settings={settings}
        onSettingsChange={handleSettingsChange}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

// Sound playback utility
function playSound(soundId: string, volume: number) {
  // For now, we'll use a simple beep. In production, load actual audio files.
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sounds based on soundId
    const frequencies: Record<string, number[]> = {
      bell: [880, 1100, 880],
      chime: [523, 659, 784],
      gong: [196, 196, 196],
      digital: [1000, 800, 1000],
    };

    const freqs = frequencies[soundId] || frequencies.bell;

    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);

    freqs.forEach((freq, i) => {
      setTimeout(() => {
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      }, i * 200);
    });

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.8);
  } catch {
    // Audio playback failed, ignore
  }
}

// System notification
function showNotification(sessionType: SessionType) {
  const messages: Record<SessionType, { title: string; body: string }> = {
    focus: {
      title: 'Focus session complete!',
      body: 'Time for a break.',
    },
    shortBreak: {
      title: 'Break is over!',
      body: 'Ready to focus again?',
    },
    longBreak: {
      title: 'Long break is over!',
      body: 'Let\'s get back to work!',
    },
  };

  const msg = messages[sessionType];

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(msg.title, { body: msg.body });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(msg.title, { body: msg.body });
      }
    });
  }
}

export default App;
