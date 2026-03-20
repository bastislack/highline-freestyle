import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
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

describe('VariationsPopover', () => {
  it('renders the default slot content (parent card)', () => {
    const wrapper = mount(VariationsPopover, {
      props: { variations: mockVariations },
      slots: {
        default: '<div class="parent-card">Parent Trick</div>',
      },
    });

    expect(wrapper.find('.parent-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Parent Trick');
  });

  it('renders the trigger button for expanding variations', () => {
    const wrapper = mount(VariationsPopover, {
      props: { variations: mockVariations },
      slots: {
        default: '<div>Parent</div>',
      },
    });

    const trigger = wrapper.find('button');
    expect(trigger.exists()).toBe(true);
  });
});
