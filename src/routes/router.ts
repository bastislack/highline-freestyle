import { createRouter, createWebHistory } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    // Set to `true` on routes whose component handles its own scroll restoration
    // (see TrickList + useScrollAnchor). The router stays out of the way for
    // these routes so the two scrollers don't race.
    handlesScroll?: boolean;
  }
}

export default createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    // Routes opt out via `meta.handlesScroll` when they manage their own
    // restoration (e.g. TrickList's anchor-based restore — see useScrollAnchor).
    // Returning `false` keeps the router from racing the component's scroll.
    if (to.meta.handlesScroll) return false;
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      redirect: '/tricks',
    },
    {
      path: '/dbtest',
      component: () => import('./DbTest.vue'),
    },
    {
      // Used for developmental purposes to determine / tune theme.
      // Can be removed if theme is ever firmly determined.
      path: '/theme',
      component: () => import('./ThemeTest.vue'),
    },
    {
      path: '/tricks',
      children: [
        {
          path: '',
          component: () => import('./tricks/TrickList.vue'),
          meta: { handlesScroll: true },
        },
        {
          path: ':status/:id/edit',
          component: () => import('./tricks/EditTrickRoute.vue'),
        },
        {
          path: ':status/:id',
          component: () => import('./tricks/TrickDetails.vue'),
        },
        {
          path: 'new',
          component: () => import('./tricks/NewTrickRoute.vue'),
        },
      ],
    },
    {
      path: '/settings',
      component: () => import('./Settings.vue'),
    },
    {
      path: '/about',
      component: () => import('./About.vue'),
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('./NotFoundRoute.vue'),
    },
  ],
});
