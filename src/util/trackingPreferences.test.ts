import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing the module
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get _store() {
      return store;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('trackingPreferences', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetModules();
  });

  it('should default to false when localStorage is empty', async () => {
    const { isEmbedAllowed } = await import('./trackingPreferences');
    expect(isEmbedAllowed('YOUTUBE')).toBe(false);
    expect(isEmbedAllowed('INSTAGRAM')).toBe(false);
  });

  it('should return true after setting preference to true', async () => {
    const { setEmbedPreference, isEmbedAllowed } = await import('./trackingPreferences');
    setEmbedPreference('YOUTUBE', true);
    expect(isEmbedAllowed('YOUTUBE')).toBe(true);
  });

  it('should read persisted value on fresh module load', async () => {
    // Simulate: user set YouTube to true in a previous session
    localStorageMock.setItem('YOUTUBE_EMBED_ALLOWED', 'true');

    const { isEmbedAllowed } = await import('./trackingPreferences');
    expect(isEmbedAllowed('YOUTUBE')).toBe(true);
    expect(isEmbedAllowed('INSTAGRAM')).toBe(false);
  });
});
