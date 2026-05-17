import { describe, it, expect, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import StickableSearchResult from '../StickableSearchResult.vue';
import type { SearchItem } from '@/types/search';

vi.mock('@iconify/vue/dist/iconify.js', () => ({
  Icon: {
    name: 'Icon',
    props: ['icon'],
    template: '<span :data-icon="icon" />',
  },
}));

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

const baseProps = {
  title: 'Backflip',
  primaryKey: [1, 'official'] as [number, 'official'],
  status: 'official' as const,
  linkToDetails: '/tricks/official/1',
  stickFrequency: 3,
  isFavorite: false,
  isNew: false,
  variations: [] as SearchItem[],
  showVariations: true,
  showLevel: true,
};

const mockVariations: SearchItem[] = [
  {
    name: 'Backflip Twist',
    primaryKey: [10, 'official'],
    stickFrequency: 2,
    isFavorite: false,
    isNew: false,
  },
];

// Mount via RouterView so VariationsPopover (embedded when variations are
// present) lives inside a matched route record — its onBeforeRouteLeave guard
// needs that to register cleanly.
async function mountInRoute(props: typeof baseProps) {
  const Host = defineComponent({
    setup: () => () => h(StickableSearchResult, props),
  });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: Host }],
  });
  await router.push('/');
  await router.isReady();
  return mount(RouterView, {
    global: { plugins: [i18n, router], stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  });
}

describe('StickableSearchResult', () => {
  it('renders a plain StickableCard when there are no variations', async () => {
    const wrapper = await mountInRoute(baseProps);

    expect(wrapper.text()).toContain('Backflip');
    expect(wrapper.findComponent({ name: 'VariationsPopover' }).exists()).toBe(false);
  });

  it('renders a plain StickableCard when showVariations is false', async () => {
    const wrapper = await mountInRoute({
      ...baseProps,
      variations: mockVariations,
      showVariations: false,
    });

    expect(wrapper.findComponent({ name: 'VariationsPopover' }).exists()).toBe(false);
  });

  it('wraps card in VariationsPopover when variations exist and showVariations is true', async () => {
    const wrapper = await mountInRoute({
      ...baseProps,
      variations: mockVariations,
      showVariations: true,
    });

    expect(wrapper.findComponent({ name: 'VariationsPopover' }).exists()).toBe(true);
  });
});
