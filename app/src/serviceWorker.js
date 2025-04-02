/**
 * Service Worker for Drew Clark's Portfolio
 * 
 * This service worker enables offline functionality and better performance
 * through caching strategies. It uses workbox-based patterns for reliability.
 */

// Cache names for different types of resources
const CACHE_NAMES = {
  static: 'static-resources-v1',
  images: 'image-resources-v1',
  api: 'api-responses-v1',
  documents: 'document-resources-v1'
};

// Resources to cache on install
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/main.js',
  '/main.css',
  // Add other essential static resources
];

// Resources to cache on first use 
const CACHE_ON_DEMAND = [
  // Dynamic resources that should be cached when first accessed
];

/**
 * Install event - Pre-cache critical resources
 */
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => {
        console.log('[ServiceWorker] Pre-caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('[ServiceWorker] Installation complete');
        return self.skipWaiting();
      })
  );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating');
  
  // Remove old caches
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Check if this cache name is not in our current set of cache names
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activation complete');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - Intercept network requests
 */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Handle API requests (network-first strategy)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle image requests (cache-first strategy)
  if (event.request.destination === 'image') {
    event.respondWith(handleImageRequest(event.request));
    return;
  }
  
  // For other requests (HTML, CSS, JS) use a stale-while-revalidate strategy
  event.respondWith(handleStaticResourceRequest(event.request));
});

/**
 * Network first strategy - Try network, fall back to cache
 * Used for API requests where fresh data is preferred
 */
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, clone and store in cache
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(CACHE_NAMES.api).then(cache => {
        cache.put(request, clonedResponse);
      });
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If nothing in cache either, return a custom offline response for APIs
    return new Response(
      JSON.stringify({
        error: 'You are offline and no cached data is available',
        offline: true
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Cache first strategy - Try cache, fall back to network
 * Used for images which don't change frequently
 */
async function handleImageRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    
    // Clone and cache the response
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(CACHE_NAMES.images).then(cache => {
        cache.put(request, clonedResponse);
      });
    }
    
    return networkResponse;
  } catch (error) {
    // If completely offline and not cached, return fallback image
    // This could be a generic placeholder image
    return caches.match('/assets/offline-placeholder.jpg');
  }
}

/**
 * Stale while revalidate - Return cached version immediately, then update cache
 * Used for static resources like HTML, CSS, JS
 */
async function handleStaticResourceRequest(request) {
  // Check cache first
  const cachedResponse = await caches.match(request);
  
  // Clone the request - we'll use it multiple times
  const fetchPromise = fetch(request.clone())
    .then(networkResponse => {
      // If we got a valid response, cache it
      if (networkResponse && networkResponse.status === 200) {
        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_NAMES.static).then(cache => {
          cache.put(request, clonedResponse);
        });
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('[ServiceWorker] Fetch failed:', error);
      // If the request is for the main document and we're offline
      if (request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      return null;
    });
  
  // Return the cached response if we have it, otherwise wait for the fetch to complete
  return cachedResponse || fetchPromise;
}

/**
 * Listen for message event from client
 * This allows the client to communicate with the service worker
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});
