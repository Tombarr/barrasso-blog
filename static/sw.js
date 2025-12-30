/**
 * Service Worker for barrasso.me
 *
 * Features:
 * - Network-first strategy for HTML pages (fresh content when online)
 * - Cache-first strategy for static assets (performance)
 * - Offline fallback page
 * - Automatic cache versioning and cleanup
 */

// Cache configuration
const CACHE_VERSION = 'v1';
const CACHE_NAME = `barrasso-blog-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline/';

// Assets to cache on install
const PRECACHE_ASSETS = [
  OFFLINE_PAGE,
  '/css/output.css',
  '/js/main.js',
  '/fonts/figtree-normal.woff2',
  '/fonts/fraunces-normal.woff2',
  '/images/portraits.jpg',
];

// Maximum cache sizes (prevent unlimited growth)
const MAX_CACHE_SIZE = {
  pages: 50, // HTML pages
  images: 100, // Images
  assets: 30, // CSS/JS/fonts
};

/**
 * Installation - precache critical assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(
          PRECACHE_ASSETS.map((url) => new Request(url, { cache: 'reload' })),
        );
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      }),
  );
});

/**
 * Activation - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith('barrasso-blog-') && name !== CACHE_NAME,
            )
            .map((name) => {
              return caches.delete(name);
            }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

/**
 * Fetch - route requests with appropriate strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Route to appropriate strategy
  if (isHTMLRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isAssetRequest(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(networkFirstStrategy(request));
  }
});

/**
 * Network-first strategy with offline fallback
 * Used for HTML pages to ensure fresh content
 */
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());

      // Limit cache size
      await limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE.pages);

      return networkResponse;
    }

    // Fall back to cache for non-200 responses
    return caches.match(request) || caches.match(OFFLINE_PAGE);
  } catch (error) {
    // Network failed - try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Show offline page for HTML requests
    if (isHTMLRequest(request)) {
      return caches.match(OFFLINE_PAGE);
    }

    // For other requests, return error
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/**
 * Cache-first strategy with network fallback
 * Used for static assets that don't change often
 */
async function cacheFirstStrategy(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Return cached version and update cache in background
    updateCacheInBackground(request);
    return cachedResponse;
  }

  // Cache miss - fetch from network
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());

      // Limit cache size based on request type
      const url = new URL(request.url);
      if (isImageRequest(url)) {
        await limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE.images);
      } else {
        await limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE.assets);
      }
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache miss and network failed:', request.url);

    // Return a fallback response
    return new Response('Resource not available', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/**
 * Update cache in background (stale-while-revalidate pattern)
 */
function updateCacheInBackground(request) {
  fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response);
        });
      }
    })
    .catch((error) => {
      // Silently fail - cache update is optional
      console.warn('[SW] Background cache update failed:', error);
    });
}

/**
 * Limit cache size to prevent unlimited growth
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Delete oldest entries (FIFO)
    const deleteCount = keys.length - maxSize;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

/**
 * Helper: Check if request is for HTML
 */
function isHTMLRequest(request) {
  const acceptHeader = request.headers.get('Accept') || '';
  return acceptHeader.includes('text/html');
}

/**
 * Helper: Check if URL is for static assets
 */
function isAssetRequest(url) {
  return (
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/js/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  );
}

/**
 * Helper: Check if URL is for images
 */
function isImageRequest(url) {
  return (
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  );
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.debug('[SW] Cache cleared');
      }),
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.keys().then((keys) => {
          event.ports[0].postMessage({ size: keys.length });
        });
      }),
    );
  }
});
