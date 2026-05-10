import { describe, it, expect, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import VariationsPopover from '../VariationsPopover.vue';
import type { SearchItem } from '@/types/search';

vi.mock('@iconify/vue/dist/iconify.js', () => ({
  Icon: {
    name: 'Icon',
    props: ['icon'],
    template: '<span :data-icon="icon" />',
  },
}));

const mockVariations: SearchItem[] = [
  {
    name: 'Variation A',
    primaryKey: [10, 'official'],
    stickFrequency: 3,
    isFavorite: false,
    isNew: false,
  },
  {
    name: 'Variation B',
    primaryKey: [11, 'official'],
    stickFrequency: 1,
    isFavorite: true,
    isNew: true,
  },
];

// Mount via RouterView so VariationsPopover lives inside a matched route
// record — its onBeforeRouteLeave guard needs that to register cleanly.
async function mountInRoute(slotContent: string) {
  const Host = defineComponent({
    setup: () => () =>
      h(
        VariationsPopover,
        { variations: mockVariations },
        { default: () => h('div', { innerHTML: slotContent }) }
      ),
  });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: Host }],
  });
  await router.push('/');
  await router.isReady();
  return mount(RouterView, { global: { plugins: [router] } });
}

describe('VariationsPopover', () => {
  it('renders the default slot content (parent card)', async () => {
    const wrapper = await mountInRoute('<div class="parent-card">Parent Trick</div>');

    expect(wrapper.find('.parent-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Parent Trick');
  });

  it('renders the trigger button for expanding variations', async () => {
    const wrapper = await mountInRoute('<div>Parent</div>');

    const trigger = wrapper.find('button');
    expect(trigger.exists()).toBe(true);
  });
});
