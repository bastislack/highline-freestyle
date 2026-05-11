import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

// Stub StickFrequencySelector so we don't pull in reka-ui's Slider in jsdom;
// the stub just relays the events our parent listens for and exposes them
// via a known component name so the test can drive them.
vi.mock('../StickFrequencySelector.vue', () => ({
  default: {
    name: 'StickFrequencySelectorStub',
    props: ['frequency'],
    emits: ['update:frequency', 'commit'],
    template: '<div />',
  },
}));

const persist = vi.fn();
const getById = vi.fn();

vi.mock('@/lib/database', () => ({
  tricksDao: {
    getById: (...args: unknown[]) => getById(...args),
  },
}));

const toast = vi.fn();
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ toast }),
}));

import TrickStickFrequencySelector from '../TrickStickFrequencySelector.vue';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

function makeTrick(initial: number | undefined) {
  return {
    stickFrequency: initial,
    persist,
  };
}

// The component's onCommit re-throws on persist failure so the caller (Reka's
// slider) can react. In a test the parent's listener is the only sink, so the
// rejection bubbles up as "unhandled" unless we install an errorHandler.
const vueErrorHandler = vi.fn();

async function mountSelector(initialFrequency: number | undefined, props: object = {}) {
  getById.mockResolvedValue(makeTrick(initialFrequency));
  const Host = defineComponent({
    setup: () => () =>
      h(TrickStickFrequencySelector, {
        trickId: 1,
        trickStatus: 'official' as const,
        ...props,
      }),
  });
  const wrapper = mount(Host, {
    global: { plugins: [i18n], config: { errorHandler: vueErrorHandler } },
  });
  // Let the watchEffect's awaited getById resolve and propagate.
  await flushPromises();
  return wrapper;
}

function findStub(wrapper: ReturnType<typeof mount>) {
  return wrapper.findComponent({ name: 'StickFrequencySelectorStub' });
}

describe('TrickStickFrequencySelector', () => {
  beforeEach(() => {
    persist.mockReset();
    getById.mockReset();
    toast.mockReset();
    vueErrorHandler.mockReset();
  });

  it('hydrates the slider model from the DB on mount', async () => {
    const wrapper = await mountSelector(4);
    expect(findStub(wrapper).props('frequency')).toEqual([4]);
  });

  it('does NOT persist on drag-step (update:frequency)', async () => {
    const wrapper = await mountSelector(2);
    persist.mockClear();

    findStub(wrapper).vm.$emit('update:frequency', [5]);
    await nextTick();

    expect(persist).not.toHaveBeenCalled();
    // Local model still updates so the slider thumb tracks the drag.
    expect(findStub(wrapper).props('frequency')).toEqual([5]);
  });

  it('persists exactly once on commit (slider release)', async () => {
    const trick = makeTrick(2);
    getById.mockResolvedValue(trick);
    persist.mockResolvedValue(true);

    const wrapper = await mountSelector(2);
    // mountSelector's getById is a separate mock setup; re-point to our trick.
    getById.mockResolvedValue(trick);

    findStub(wrapper).vm.$emit('commit', [6]);
    await flushPromises();

    expect(persist).toHaveBeenCalledTimes(1);
    expect(trick.stickFrequency).toBe(6);
  });

  it('skips the DB write when commit value equals the last committed frequency', async () => {
    const wrapper = await mountSelector(3);
    persist.mockResolvedValue(true);
    persist.mockClear();

    findStub(wrapper).vm.$emit('commit', [3]);
    await flushPromises();

    expect(persist).not.toHaveBeenCalled();
  });

  it('rolls slider model back and toasts when persist fails', async () => {
    const trick = makeTrick(2);
    getById.mockResolvedValue(trick);

    const wrapper = await mountSelector(2);
    getById.mockResolvedValue(trick);

    // Simulate a mid-gesture drag bumping the model up to 5 …
    findStub(wrapper).vm.$emit('update:frequency', [5]);
    await nextTick();
    expect(findStub(wrapper).props('frequency')).toEqual([5]);

    // … then a failing commit at release time.
    persist.mockRejectedValueOnce(new Error('db is sad'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    findStub(wrapper).vm.$emit('commit', [5]);
    await flushPromises();

    expect(findStub(wrapper).props('frequency')).toEqual([2]);
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast.mock.calls[0][0]).toMatchObject({ variant: 'destructive' });
    // The re-thrown error reaches Vue's error handler (installed in mountSelector).
    expect(vueErrorHandler).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('re-emits change with the rolled-back value so optimistic overrides heal', async () => {
    const trick = makeTrick(2);
    getById.mockResolvedValue(trick);

    const changes: number[] = [];
    const wrapper = await mountSelector(2, {
      onChange: (v: number) => changes.push(v),
    });
    getById.mockResolvedValue(trick);

    findStub(wrapper).vm.$emit('update:frequency', [5]);
    await nextTick();

    persist.mockRejectedValueOnce(new Error('db is sad'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    findStub(wrapper).vm.$emit('commit', [5]);
    await flushPromises();

    // First entry: the drag step (5). Last entry: the rollback to the baseline (2).
    expect(changes[0]).toBe(5);
    expect(changes[changes.length - 1]).toBe(2);
    consoleError.mockRestore();
  });
});
