import { createRouter, createWebHashHistory } from 'vue-router';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./IndexRoute.vue'),
    },
    {
      path: '/dbtest',
      component: () => import('./DbTest.vue'),
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('./NotFoundRoute.vue'),
    },
  ],
});
