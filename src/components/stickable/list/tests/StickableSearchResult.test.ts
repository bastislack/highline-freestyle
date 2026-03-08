import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import StickableSearchResult from '../StickableSearchResult.vue';
import type { SearchItem } from '@/types/search';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

const baseProps = {
  title: 'Backflip',
  status: 'official' as const,
  linkToDetails: '/tricks/official/1',
  stickFrequency: 3,
  isFavorite: false,
  isNew: false,
  variations: [] as SearchItem[],
  showVariations: true,
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

describe('StickableSearchResult', () => {
  it('renders a plain StickableCard when there are no variations', () => {
    const wrapper = mount(StickableSearchResult, {
      props: baseProps,
      global: { plugins: [i18n], stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    });

    expect(wrapper.text()).toContain('Backflip');
    expect(wrapper.findComponent({ name: 'VariationsPopover' }).exists()).toBe(false);
  });

  it('renders a plain StickableCard when showVariations is false', () => {
    const wrapper = mount(StickableSearchResult, {
      props: { ...baseProps, variations: mockVariations, showVariations: false },
      global: { plugins: [i18n], stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    });

    expect(wrapper.findComponent({ name: 'VariationsPopover' }).exists()).toBe(false);
  });

  it('wraps card in VariationsPopover when variations exist and showVariations is true', () => {
    const wrapper = mount(StickableSearchResult, {
      props: { ...baseProps, variations: mockVariations, showVariations: true },
      global: { plugins: [i18n], stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    });

    expect(wrapper.findComponent({ name: 'VariationsPopover' }).exists()).toBe(true);
  });
});
