// Scroll restoration that survives layout shifts. Instead of remembering a Y
// coordinate, remember the topmost visible element (by stable key) and its
// offset within the viewport. On restore, find that element and scroll so its
// top lands at the same offset — which means inserts/removes/resizes above the
// viewport (background data refresh, async measurement, etc.) don't strand the
// user mid-list.
//
// Anchor elements opt in by setting `data-scroll-anchor="<unique-key>"`.

const ANCHOR_ATTR = 'data-scroll-anchor';

interface Anchor {
  key: string;
  offset: number;
}

export interface ScrollAnchor {
  /** Capture the current topmost visible anchor; clears storage if none found. */
  save(): void;
  /** Read and remove the stored anchor. Single-use — null if nothing is stored. */
  take(): Anchor | null;
  /** Scroll so the given anchor's element returns to its saved offset. Returns false if the element is gone. */
  apply(anchor: Anchor): boolean;
}

export function useScrollAnchor(storageKey: string): ScrollAnchor {
  function findFirstVisible(): Anchor | null {
    const els = document.querySelectorAll<HTMLElement>(`[${ANCHOR_ATTR}]`);
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      // First element whose bottom is below the viewport top — i.e. the topmost
      // element either visible or just below the fold.
      if (rect.bottom > 0) {
        const key = el.getAttribute(ANCHOR_ATTR);
        if (key) return { key, offset: rect.top };
      }
    }
    return null;
  }

  function findByKey(key: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[${ANCHOR_ATTR}="${CSS.escape(key)}"]`);
  }

  return {
    save() {
      const anchor = findFirstVisible();
      if (anchor) sessionStorage.setItem(storageKey, JSON.stringify(anchor));
      else sessionStorage.removeItem(storageKey);
    },
    take() {
      const stored = sessionStorage.getItem(storageKey);
      if (!stored) return null;
      sessionStorage.removeItem(storageKey);
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.key !== 'string' || typeof parsed?.offset !== 'number') return null;
        return parsed;
      } catch {
        return null;
      }
    },
    apply(anchor) {
      const el = findByKey(anchor.key);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      window.scrollBy(0, rect.top - anchor.offset);
      return true;
    },
  };
}
