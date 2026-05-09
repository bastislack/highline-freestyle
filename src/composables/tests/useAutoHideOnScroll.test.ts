import { describe, it, expect, beforeEach } from 'vitest';
import { defineComponent, h, KeepAlive, nextTick, ref } from 'vue';
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

  it('shows the header on KeepAlive reactivation and ignores programmatic scroll until user input', async () => {
    const enabled = ref(true);
    const maxHidePx = ref(50);
    const which = ref<'host' | 'other'>('host');
    let api!: ReturnType<typeof useAutoHideOnScroll>;

    const Host = defineComponent({
      name: 'Host',
      setup() {
        api = useAutoHideOnScroll(maxHidePx, enabled);
        return () => h('div');
      },
    });
    const Other = defineComponent({ name: 'Other', setup: () => () => h('div') });
    const App = defineComponent({
      setup() {
        return () =>
          h(KeepAlive, { include: 'Host' }, [which.value === 'host' ? h(Host) : h(Other)]);
      },
    });

    mount(App);

    // Hide the header by scrolling down.
    setScroll(100);
    expect(api.offsetY.value).toBe(-50);

    // Deactivate (navigate away), then reactivate (navigate back).
    which.value = 'other';
    await nextTick();
    setScroll(0); // simulates the page being elsewhere
    which.value = 'host';
    await nextTick();

    // Header is shown again on return.
    expect(api.offsetY.value).toBe(0);

    // Programmatic restoration scroll should NOT re-hide the header.
    setScroll(500);
    expect(api.offsetY.value).toBe(0);

    // Once the user actually scrolls (touch/wheel/key), auto-hide re-engages.
    window.dispatchEvent(new Event('touchstart'));
    setScroll(520);
    expect(api.offsetY.value).toBe(-20);
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
