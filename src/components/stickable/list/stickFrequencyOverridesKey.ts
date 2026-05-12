import { computed, inject, reactive, type ComputedRef, type InjectionKey } from 'vue';
import type { PrimaryKey } from '@/lib/utils';

// Reactive map keyed by `${status}:${id}` -> stickFrequency. Both the
// long-press popover and the details-view selector write here so the trick
// list (kept alive in the background) reflects the change immediately,
// before its next loadTricks() refresh.
//
// Vue 3 tracks Map reads per-key, so a single .set() only re-renders the
// card(s) that read that exact key — the rest of the list, searchResult, and
// variationsMap stay completely untouched. This bypasses the O(n) cascade
// that triggerRef(allTricks) would otherwise trigger.
//
// Singleton because writers (long-press popover, details view) live in
// different parts of the router tree, so provide/inject alone can't reach
// from one to the other.
export const stickFrequencyOverrides = reactive(new Map<string, number>());

export const stickFrequencyOverridesKey: InjectionKey<Map<string, number>> =
  Symbol('stickFrequencyOverrides');

export function frequencyOverrideKey(primaryKey: Readonly<PrimaryKey>): string {
  return `${primaryKey[1]}:${primaryKey[0]}`;
}

// Returns the displayed stick frequency for a card: the optimistic override
// if present, otherwise the prop-supplied value. Accepts getters so consumers
// can pass reactive props without losing reactivity.
export function useEffectiveStickFrequency(
  getPrimaryKey: () => PrimaryKey | undefined,
  getBaseFrequency: () => number | undefined
): ComputedRef<number | undefined> {
  const overrides = inject(stickFrequencyOverridesKey, null);
  return computed(() => {
    const pk = getPrimaryKey();
    if (overrides && pk) {
      const key = frequencyOverrideKey(pk);
      if (overrides.has(key)) return overrides.get(key);
    }
    return getBaseFrequency();
  });
}
