import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import StickableCard from '../StickableCard.vue';

vi.mock('@iconify/vue/dist/iconify.js', () => ({
  Icon: { name: 'Icon', props: ['icon'], template: '<span :data-icon="icon" />' },
}));

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
});

const i18n = createI18n({ legacy: false, locale: 'en', messages: {} });

function makeWrapper(props: Record<string, unknown>) {
  return mount(StickableCard, {
    props: props as never,
    slots: { default: 'Trick Name' },
    global: { plugins: [router, i18n] },
  });
}

describe('StickableCard level pill', () => {
  it('renders no pill when showLevel is false', () => {
    const wrapper = makeWrapper({
      to: '/tricks/official/1',
      isFavorite: false,
      isNew: false,
      status: 'official',
    });
    expect(wrapper.text()).not.toMatch(/Lvl/);
  });

  it('renders Lvl N when difficultyLevel is provided', () => {
    const wrapper = makeWrapper({
      to: '/tricks/official/1',
      isFavorite: false,
      isNew: false,
      status: 'official',
      showLevel: true,
      difficultyLevel: 3,
    });
    expect(wrapper.text()).toContain('Lvl 3');
  });

  it('renders Lvl ? when difficultyLevel is undefined', () => {
    const wrapper = makeWrapper({
      to: '/tricks/official/1',
      isFavorite: false,
      isNew: false,
      status: 'official',
      showLevel: true,
    });
    expect(wrapper.text()).toContain('Lvl ?');
  });

  it('shows up arrow when variation level is higher than base', () => {
    const wrapper = makeWrapper({
      to: '/tricks/official/1',
      isFavorite: false,
      isNew: false,
      status: 'official',
      showLevel: true,
      difficultyLevel: 3,
      baseDifficultyLevel: 1,
    });
    expect(wrapper.find('[data-icon="ic:round-arrow-upward"]').exists()).toBe(true);
    expect(wrapper.find('[data-icon="ic:round-arrow-downward"]').exists()).toBe(false);
  });

  it('shows down arrow when variation level is lower than base', () => {
    const wrapper = makeWrapper({
      to: '/tricks/official/1',
      isFavorite: false,
      isNew: false,
      status: 'official',
      showLevel: true,
      difficultyLevel: 1,
      baseDifficultyLevel: 3,
    });
    expect(wrapper.find('[data-icon="ic:round-arrow-downward"]').exists()).toBe(true);
    expect(wrapper.find('[data-icon="ic:round-arrow-upward"]').exists()).toBe(false);
  });

  it('shows no arrow when levels equal or base missing', () => {
    const equal = makeWrapper({
      to: '/tricks/official/1',
      isFavorite: false,
      isNew: false,
      status: 'official',
      showLevel: true,
      difficultyLevel: 2,
      baseDifficultyLevel: 2,
    });
    expect(equal.find('[data-icon^="ic:round-arrow-"]').exists()).toBe(false);

    const noBase = makeWrapper({
      to: '/tricks/official/1',
      isFavorite: false,
      isNew: false,
      status: 'official',
      showLevel: true,
      difficultyLevel: 2,
    });
    expect(noBase.find('[data-icon^="ic:round-arrow-"]').exists()).toBe(false);
  });
});
