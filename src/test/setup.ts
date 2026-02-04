import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock AudioContext
class MockOscillator {
  frequency = { setValueAtTime: vi.fn() };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockGainNode {
  gain = { setValueAtTime: vi.fn() };
  connect = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  createOscillator = vi.fn(() => new MockOscillator());
  createGain = vi.fn(() => new MockGainNode());
  destination = {};
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
});

// Mock Notification
class MockNotification {
  static permission = 'granted';
  static requestPermission = vi.fn(() => Promise.resolve('granted' as NotificationPermission));

  constructor(public title: string, public options?: NotificationOptions) {}
}

Object.defineProperty(window, 'Notification', {
  writable: true,
  value: MockNotification,
});
