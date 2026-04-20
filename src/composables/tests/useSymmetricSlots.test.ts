import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useSymmetricSlots } from '../useSymmetricSlots';

type Callback = ResizeObserverCallback;
type Entry = { cb: Callback; disconnected: boolean };

let active: Set<Entry>;

function installResizeObserver() {
  active = new Set();
  class FakeRO {
    private entry: Entry;
    constructor(cb: Callback) {
      this.entry = { cb, disconnected: false };
      active.add(this.entry);
    }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = () => {
      this.entry.disconnected = true;
    };
  }
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = FakeRO;
}

function triggerResize() {
  active.forEach((e) => {
    if (!e.disconnected) e.cb([], {} as ResizeObserver);
  });
}

function makeEl(width: number, height: number): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
  Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true });
  return el;
}

function setWidth(el: HTMLElement, width: number) {
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
}

function mountHost(enabled = true) {
  const containerEl = makeEl(300, 48);
  const leftEl = makeEl(40, 40);
  const rightEl = makeEl(90, 40);
  const containerRef = ref<HTMLElement | null>(containerEl);
  const leftRef = ref<HTMLElement | null>(leftEl);
  const rightRef = ref<HTMLElement | null>(rightEl);
  const enabledRef = ref(enabled);
  let api!: ReturnType<typeof useSymmetricSlots>;
  const Host = defineComponent({
    setup() {
      api = useSymmetricSlots(containerRef, leftRef, rightRef, enabledRef);
      return () => h('div');
    },
  });
  const wrapper = mount(Host);
  return { wrapper, enabledRef, api: () => api, containerEl, leftEl, rightEl };
}

describe('useSymmetricSlots', () => {
  beforeEach(() => {
    installResizeObserver();
  });

  it('measures max of left and right widths and container height', async () => {
    const { api } = mountHost();
    await nextTick();
    expect(api().sideWidthPx.value).toBe(90);
    expect(api().containerHeightPx.value).toBe(48);
  });

  it('reacts to element size changes while enabled', async () => {
    const { api, leftEl } = mountHost();
    await nextTick();
    setWidth(leftEl, 200);
    triggerResize();
    await nextTick();
    expect(api().sideWidthPx.value).toBe(200);
  });

  it('stops updating when disabled even if sizes change', async () => {
    const { enabledRef, api, wrapper, leftEl } = mountHost();
    await nextTick();
    const beforeDisable = api().sideWidthPx.value;
    enabledRef.value = false;
    await wrapper.vm.$nextTick();
    const frozen = api().sideWidthPx.value;
    setWidth(leftEl, 500);
    triggerResize();
    await nextTick();
    expect(api().sideWidthPx.value).toBe(frozen);
    expect(frozen).not.toBe(500);
    expect(beforeDisable).toBe(90);
  });
});
