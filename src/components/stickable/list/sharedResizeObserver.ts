// A single ResizeObserver shared across all cards in the trick list. Per-card
// observers add up fast — at ~1000 cards on a sort/search churn each one would
// register its own observer with the browser, which is a non-trivial cost.
// One observer with N targets is dramatically cheaper than N observers with
// one target each.

type Callback = () => void;

const callbacks = new WeakMap<Element, Callback>();
let observer: ResizeObserver | null = null;

function ensureObserver(): ResizeObserver {
  if (observer) return observer;
  observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const cb = callbacks.get(entry.target);
      if (cb) cb();
    }
  });
  return observer;
}

export function observeOverflowTarget(el: Element, cb: Callback): void {
  callbacks.set(el, cb);
  ensureObserver().observe(el);
}

export function unobserveOverflowTarget(el: Element): void {
  callbacks.delete(el);
  observer?.unobserve(el);
}
