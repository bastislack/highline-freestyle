import { describe, it, expect, beforeEach } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useAutoHideOnScroll } from '../useAutoHideOnScroll';

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  window.dispatchEvent(new Event('scroll'));
}

function mountHost(maxHide = 50, initialEnabled = true) {
  const enabled = ref(initialEnabled);
  const maxHidePx = ref(maxHide);
  let api!: ReturnType<typeof useAutoHideOnScroll>;
  const Host = defineComponent({
    setup() {
      api = useAutoHideOnScroll(maxHidePx, enabled);
      return () => h('div');
    },
  });
  const wrapper = mount(Host);
  return { wrapper, enabled, maxHidePx, api: () => api };
}

describe('useAutoHideOnScroll', () => {
  beforeEach(() => {
    setScroll(0);
  });

  it('starts with offset 0', () => {
    const { api } = mountHost();
    expect(api().offsetY.value).toBe(0);
  });

  it('hides up to -maxHidePx when scrolling down', () => {
    const { api } = mountHost(50);
    setScroll(100);
    expect(api().offsetY.value).toBe(-50);
  });

  it('reveals again when scrolling up', () => {
    const { api } = mountHost(50);
    setScroll(100);
    expect(api().offsetY.value).toBe(-50);
    setScroll(80);
    expect(api().offsetY.value).toBe(-30);
  });

  it('resets to 0 when scrollY reaches 0', () => {
    const { api } = mountHost(50);
    setScroll(100);
    setScroll(0);
    expect(api().offsetY.value).toBe(0);
  });

  it('does not hide when mounted on an already-scrolled page until further scrolling', () => {
    setScroll(500);
    const { api } = mountHost(50);
    setScroll(510);
    expect(api().offsetY.value).toBe(-10);
  });

  it('stops responding to scroll when disabled', async () => {
    const { enabled, api, wrapper } = mountHost(50);
    setScroll(100);
    enabled.value = false;
    await wrapper.vm.$nextTick();
    const frozen = api().offsetY.value;
    setScroll(200);
    expect(api().offsetY.value).toBe(frozen);
    setScroll(0);
    expect(api().offsetY.value).toBe(frozen);
  });
});
