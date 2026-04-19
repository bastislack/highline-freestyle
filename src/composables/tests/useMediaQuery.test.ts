import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { useMediaQuery } from '../useMediaQuery';

type Listener = (e: MediaQueryListEvent) => void;

function installMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const mql: MediaQueryList = {
    matches: initialMatches,
    media: '',
    onchange: null,
    addEventListener: vi.fn((_: string, l: Listener) => listeners.add(l)),
    removeEventListener: vi.fn((_: string, l: Listener) => listeners.delete(l)),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  } as unknown as MediaQueryList;
  window.matchMedia = vi.fn(() => mql) as unknown as typeof window.matchMedia;
  return {
    emit(matches: boolean) {
      (mql as unknown as { matches: boolean }).matches = matches;
      listeners.forEach((l) => l({ matches } as MediaQueryListEvent));
    },
  };
}

function mountHost() {
  let api!: ReturnType<typeof useMediaQuery>;
  const Host = defineComponent({
    setup() {
      api = useMediaQuery('(max-width: 1023.98px)');
      return () => h('div');
    },
  });
  const wrapper = mount(Host);
  return { wrapper, api: () => api };
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reflects initial match state', () => {
    installMatchMedia(true);
    const { api } = mountHost();
    expect(api().value).toBe(true);
  });

  it('updates reactively on change event', async () => {
    const mq = installMatchMedia(false);
    const { wrapper, api } = mountHost();
    expect(api().value).toBe(false);
    mq.emit(true);
    await wrapper.vm.$nextTick();
    expect(api().value).toBe(true);
  });
});
