import { describe, it, expect, beforeEach } from 'vitest';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { mount } from '@vue/test-utils';
import type { ComputedRef } from 'vue';
import type { PrimaryKey } from '@/lib/utils';
import {
  frequencyOverrideKey,
  stickFrequencyOverrides,
  stickFrequencyOverridesKey,
  useEffectiveStickFrequency,
} from '../stickFrequencyOverridesKey';

// Mounts a parent that `provide`s a fresh overrides Map and a child that
// calls `useEffectiveStickFrequency`, returning the resolved computed and
// reactive refs so tests can drive both override and base from outside.
function mountWithOverrides(initialPrimaryKey: PrimaryKey | undefined, initialBase?: number) {
  const overrides = reactive(new Map<string, number>());
  const primaryKey = ref<PrimaryKey | undefined>(initialPrimaryKey);
  const base = ref<number | undefined>(initialBase);
  let effective!: ComputedRef<number | undefined>;

  const Child = defineComponent({
    setup() {
      effective = useEffectiveStickFrequency(
        () => primaryKey.value,
        () => base.value
      );
      return () => h('div');
    },
  });
  const Parent = defineComponent({
    setup() {
      // Provide must run before the child's inject — keep them in the same setup.
      return () => h(Child);
    },
    provide: {
      [stickFrequencyOverridesKey as symbol]: overrides,
    },
  });

  const wrapper = mount(Parent);
  return { wrapper, overrides, primaryKey, base, effective: () => effective };
}

describe('frequencyOverrideKey', () => {
  it('serializes [id, status] as "status:id"', () => {
    expect(frequencyOverrideKey([7, 'official'])).toBe('official:7');
    expect(frequencyOverrideKey([42, 'userDefined'])).toBe('userDefined:42');
  });

  it('matches across calls with the same logical key', () => {
    expect(frequencyOverrideKey([1, 'official'])).toBe(frequencyOverrideKey([1, 'official']));
  });
});

describe('useEffectiveStickFrequency', () => {
  it('returns the base value when no override is set', () => {
    const { effective } = mountWithOverrides([1, 'official'], 3);
    expect(effective().value).toBe(3);
  });

  it('returns the override when one is present for the key', async () => {
    const { effective, overrides } = mountWithOverrides([1, 'official'], 3);
    overrides.set(frequencyOverrideKey([1, 'official']), 6);
    await nextTick();
    expect(effective().value).toBe(6);
  });

  it('returns the base again when the override is deleted', async () => {
    const { effective, overrides } = mountWithOverrides([1, 'official'], 3);
    overrides.set(frequencyOverrideKey([1, 'official']), 6);
    await nextTick();
    overrides.delete(frequencyOverrideKey([1, 'official']));
    await nextTick();
    expect(effective().value).toBe(3);
  });

  it('treats explicit `0` override as a real value, not absent', async () => {
    const { effective, overrides } = mountWithOverrides([1, 'official'], 5);
    overrides.set(frequencyOverrideKey([1, 'official']), 0);
    await nextTick();
    expect(effective().value).toBe(0);
  });

  it('returns the base value when primaryKey is undefined', () => {
    const { effective } = mountWithOverrides(undefined, 4);
    expect(effective().value).toBe(4);
  });

  it('keys are scoped per [id, status] — an override on one status does not leak to another', async () => {
    const { effective, overrides, primaryKey } = mountWithOverrides([1, 'official'], 3);
    overrides.set(frequencyOverrideKey([1, 'userDefined']), 7);
    await nextTick();
    expect(effective().value).toBe(3);
    primaryKey.value = [1, 'userDefined'];
    await nextTick();
    expect(effective().value).toBe(7);
  });

  it('reacts to base changes when no override is set', async () => {
    const { effective, base } = mountWithOverrides([1, 'official'], 3);
    base.value = 5;
    await nextTick();
    expect(effective().value).toBe(5);
  });
});

describe('stickFrequencyOverrides (module singleton)', () => {
  beforeEach(() => {
    stickFrequencyOverrides.clear();
  });

  it('is a reactive Map shared across importers', () => {
    stickFrequencyOverrides.set(frequencyOverrideKey([99, 'official']), 4);
    expect(stickFrequencyOverrides.get(frequencyOverrideKey([99, 'official']))).toBe(4);
  });

  it('clear() drops all entries — used by TrickList after canonical reload', () => {
    stickFrequencyOverrides.set(frequencyOverrideKey([1, 'official']), 1);
    stickFrequencyOverrides.set(frequencyOverrideKey([2, 'official']), 2);
    stickFrequencyOverrides.clear();
    expect(stickFrequencyOverrides.size).toBe(0);
  });
});
