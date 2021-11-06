import {clientsClaim} from 'workbox-core';
import {precacheAndRoute} from 'workbox-precaching';
import {
  pageCache,
  imageCache,
  staticResourceCache,
} from 'workbox-recipes';

// This clientsClaim() should be at the top level
// of your service worker, not inside of, e.g.,
// an event handler.
clientsClaim();

self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST);

pageCache();

staticResourceCache();

imageCache();
