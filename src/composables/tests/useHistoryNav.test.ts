import { describe, it, expect } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import { useHistoryNav } from '../useHistoryNav';

function makeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/tricks', component: { template: '<div />' } },
      { path: '/about', component: { template: '<div />' } },
      { path: '/settings', component: { template: '<div />' } },
    ],
  });
}

async function mountWithRouter(router: Router) {
  let api!: ReturnType<typeof useHistoryNav>;
  const Host = defineComponent({
    setup() {
      api = useHistoryNav('/tricks');
      return () => h('div');
    },
  });
  await router.isReady();
  const wrapper = mount(Host, { global: { plugins: [router] } });
  return { wrapper, api: () => api };
}

describe('useHistoryNav', () => {
  it('hides both buttons on home', async () => {
    const router = makeRouter();
    await router.push('/tricks');
    const { api } = await mountWithRouter(router);
    expect(api().isHome.value).toBe(true);
    expect(api().showBack.value).toBe(false);
    expect(api().showHome.value).toBe(false);
  });

  it('shows home button after direct-load on non-home without prior nav', async () => {
    const router = makeRouter();
    await router.push('/about');
    const { api } = await mountWithRouter(router);
    expect(api().showBack.value).toBe(false);
    expect(api().showHome.value).toBe(true);
  });

  it('shows back button after navigating from one route to another', async () => {
    const router = makeRouter();
    await router.push('/tricks');
    const { api } = await mountWithRouter(router);
    await router.push('/about');
    await nextTick();
    expect(api().showBack.value).toBe(true);
  });

  it('hides home button when prev path equals home', async () => {
    const router = makeRouter();
    await router.push('/tricks');
    const { api } = await mountWithRouter(router);
    await router.push('/about');
    await nextTick();
    expect(api().showHome.value).toBe(false);
  });

  it('hides home button after replace navigation (e.g. post-creation redirect)', async () => {
    const router = makeRouter();
    await router.push('/tricks');
    const { api } = await mountWithRouter(router);
    await router.push('/about');
    await nextTick();
    await router.replace('/settings');
    await nextTick();
    expect(api().showBack.value).toBe(true);
    expect(api().showHome.value).toBe(false);
  });
});
