/* global serviceWorkerOption */
/* eslint-disable no-console */
const DEBUG = false;

/**
 * When the user navigates to your site,
 * the browser tries to redownload the script file that defined the service worker in the background.
 * If there is even a byte's difference in the service worker file compared to what it currently has,
 * it considers it 'new'.
 */
const {
  assets,
} = serviceWorkerOption;

const CACHE_NAME = (new Date).toISOString();

let assetsToCache = [
  ...assets,
  './shell',
];

assetsToCache = assetsToCache.map((path) => {
  return new URL(path, location).toString();
});

// When the service worker is first added to a computer.
self.addEventListener('install', (event) => {
  // Perform install steps.
  if (DEBUG) {
    console.log('[SW] Install event');
  }

  // Add core website files to cache during serviceworker installation.
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(assetsToCache);
      })
      .then(() => {
        if (DEBUG) {
          console.log('Cached assets: main', assetsToCache);
        }
      })
      .catch((error) => {
        console.error(error);
        throw error;
      })
  );
});

// After the install event.
self.addEventListener('activate', (event) => {
  if (DEBUG) {
    console.log('[SW] Activate event');
  }

  // Clean the caches
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete the caches that are not the current one.
            if (cacheName.indexOf(CACHE_NAME) === 0) {
              return null;
            } else {
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

self.addEventListener('message', (event) => {
  switch (event.data.action) {
    case 'skipWaiting':
      if (self.skipWaiting) {
        self.skipWaiting();
      }
      break;
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore not GET request.
  if (request.method !== 'GET') {
    if (DEBUG) {
      console.log(`[SW] Ignore non GET request ${request.method}`);
    }
    return;
  }

  const requestUrl = new URL(request.url);

  // Ignore difference origin.
  if (requestUrl.origin !== location.origin) {
    if (DEBUG) {
      console.log(`[SW] Ignore difference origin ${requestUrl.origin}`);
    }
    return;
  }

  const resource = caches.match(request)
  .then((response) => {
    if (response) {
      if (DEBUG) {
        console.log(`[SW] fetch URL ${requestUrl.href} from cache`);
      }

      return response;
    }

    // Load and cache known assets.
    return fetch(request)
      .then((response2) => {
        if (!response2 || !response2.ok) {
          if (DEBUG) {
            console.log(`[SW] URL [${
              requestUrl.toString}] wrong response2: ${response2.status} ${response2.type}`);
          }

          return response2;
        }

        if (DEBUG) {
          console.log(`[SW] URL ${requestUrl.href} fetched`);
        }

        caches
          .open(CACHE_NAME)
          .then((cache) => {
            return cache.put(request, response2.clone());
          })
          .then(() => {
            if (DEBUG) {
              console.log(`[SW] Cache asset: ${requestUrl.href}`);
            }
          });

        return response2;
      })
      .catch(() => {
        // User is landing on our page.
        if (event.request.mode === 'navigate') {
          return caches.match('/shell');
        } else {
          return null;
        }
      });
  });

  event.respondWith(resource);
});
