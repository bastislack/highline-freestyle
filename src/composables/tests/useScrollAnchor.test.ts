import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScrollAnchor } from '../useScrollAnchor';

const STORAGE_KEY = 'test-scroll-anchor';

function makeAnchor(key: string, top: number, height = 100): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-scroll-anchor', key);
  el.getBoundingClientRect = () =>
    ({
      top,
      left: 0,
      right: 0,
      bottom: top + height,
      width: 0,
      height,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
  document.body.appendChild(el);
  return el;
}

describe('useScrollAnchor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves the topmost element with bottom > 0', () => {
    makeAnchor('a', -150); // entirely above viewport (bottom = -50)
    makeAnchor('b', -50); // partially visible (bottom = 50)
    makeAnchor('c', 200); // below

    const anchor = useScrollAnchor(STORAGE_KEY);
    anchor.save();

    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual({ key: 'b', offset: -50 });
  });

  it('clears storage when no anchor is visible', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ key: 'old', offset: 0 }));
    makeAnchor('a', -500); // bottom -400, fully above

    const anchor = useScrollAnchor(STORAGE_KEY);
    anchor.save();

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('apply scrolls so the anchor element returns to its saved offset', () => {
    const el = makeAnchor('a', 80);
    const scrollBy = vi.fn();
    Object.defineProperty(window, 'scrollBy', { value: scrollBy, configurable: true });

    const anchor = useScrollAnchor(STORAGE_KEY);
    // Element is currently at top 80, but we want it at offset -50.
    expect(anchor.apply({ key: 'a', offset: -50 })).toBe(true);
    expect(scrollBy).toHaveBeenCalledWith(0, 80 - -50);
    expect(el).toBeTruthy();
  });

  it('apply returns false when the element is gone (e.g. trick deleted)', () => {
    const scrollBy = vi.fn();
    Object.defineProperty(window, 'scrollBy', { value: scrollBy, configurable: true });

    const anchor = useScrollAnchor(STORAGE_KEY);
    expect(anchor.apply({ key: 'missing', offset: 0 })).toBe(false);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('take returns the captured anchor and consumes it', () => {
    makeAnchor('foo:1', 42);

    const anchor = useScrollAnchor(STORAGE_KEY);
    anchor.save();

    expect(anchor.take()).toEqual({ key: 'foo:1', offset: 42 });
    // Single-use: storage is empty after take.
    expect(anchor.take()).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('take returns null on missing or malformed storage', () => {
    const anchor = useScrollAnchor(STORAGE_KEY);
    expect(anchor.take()).toBeNull();

    sessionStorage.setItem(STORAGE_KEY, 'not-json');
    expect(anchor.take()).toBeNull();

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ key: 1, offset: 'x' }));
    expect(anchor.take()).toBeNull();
  });

  it('apply absorbs layout shifts above the viewport', () => {
    // Saved state: anchor was at offset 100 in viewport.
    const el = makeAnchor('a', 100);
    const scrollBy = vi.fn((_x: number, y: number) => {
      // Simulate scroll: each pixel of scrollBy moves elements up by that amount.
      el.getBoundingClientRect = () =>
        ({
          top: 100 - y,
          left: 0,
          right: 0,
          bottom: 200 - y,
          width: 0,
          height: 100,
          x: 0,
          y: 100 - y,
          toJSON: () => ({}),
        }) as DOMRect;
    });
    Object.defineProperty(window, 'scrollBy', { value: scrollBy, configurable: true });

    // Now imagine a section above shifted everything down by 60px — the anchor
    // is now at top 160 instead of 100. Applying the saved offset (100) should
    // scrollBy(0, 60) to put it back at 100.
    el.getBoundingClientRect = () =>
      ({
        top: 160,
        left: 0,
        right: 0,
        bottom: 260,
        width: 0,
        height: 100,
        x: 0,
        y: 160,
        toJSON: () => ({}),
      }) as DOMRect;

    useScrollAnchor(STORAGE_KEY).apply({ key: 'a', offset: 100 });

    expect(scrollBy).toHaveBeenCalledWith(0, 60);
  });
});
