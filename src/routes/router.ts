import { createRouter, createWebHistory } from 'vue-router';

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./IndexRoute.vue'),
    },
    {
      path: '/tricks/new',
      component: () => import('./tricks/NewTrickRoute.vue'),
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
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('./NotFoundRoute.vue'),
    },
  ],
});
