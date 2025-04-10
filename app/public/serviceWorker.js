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

// Resources to cache on install - critical path resources
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  // Critical hero images - preload these for faster LCP
  '/assets/large-sprout.webp',
  '/assets/sprout-mobile.webp',
  '/assets/large-sprout.jpg', // Fallback for browsers without WebP support
  '/assets/sprout-mobile.jpg', // Fallback for browsers without WebP support
];

// Resources to cache on first use 
const CACHE_ON_DEMAND = [
  // Dynamic resources that should be cached when first accessed
];

/**
 * Install event - Pre-cache critical resources with high priority
 * This helps eliminate render-blocking resources by providing them from cache
 */
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(async cache => {
        console.log('[ServiceWorker] Pre-caching static resources');
        
        // Use Promise.all to load critical resources in parallel with high priority
        const criticalResources = STATIC_RESOURCES.slice(0, 4); // First 4 resources are most critical
        const otherResources = STATIC_RESOURCES.slice(4);
        
        // Cache critical resources first
        await Promise.all(
          criticalResources.map(url => 
            fetch(url, { priority: 'high' })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}`);
                }
                return cache.put(url, response);
              })
              .catch(error => console.error('[ServiceWorker] Pre-cache error:', error))
          )
        );
        
        // Then cache other resources
        return Promise.all(
          otherResources.map(url => 
            fetch(url)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}`);
                }
                return cache.put(url, response);
              })
              .catch(error => console.error('[ServiceWorker] Pre-cache error:', error))
          )
        );
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
 * Enhanced cache first strategy - Try cache, fall back to network
 * Used for images which don't change frequently, with WebP support detection
 */
async function handleImageRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Check if this is a request for a JPG or PNG image that has a WebP version
  const url = new URL(request.url);
  const isJpgOrPng = /\.(jpe?g|png)$/i.test(url.pathname);
  
  if (isJpgOrPng && request.headers.get('accept')?.includes('image/webp')) {
    // Try to fetch WebP version instead
    const webpUrl = request.url.replace(/\.(jpe?g|png)$/i, '.webp');
    try {
      const webpResponse = await fetch(webpUrl, { method: request.method, headers: request.headers });
      if (webpResponse.ok) {
        // Cache both the original request and the WebP version
        const clonedResponse = webpResponse.clone();
        caches.open(CACHE_NAMES.images).then(cache => {
          cache.put(request, clonedResponse.clone());
          cache.put(new Request(webpUrl), clonedResponse);
        });
        return webpResponse;
      }
    } catch (error) {
      console.log('[ServiceWorker] WebP fallback error:', error);
      // Proceed with original request if WebP fetch fails
    }
  }
  
  // If not in cache or WebP not available, fetch from network and cache
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
    // If completely offline and not cached, return inline SVG fallback image
    console.log('[ServiceWorker] Image fetch error:', error);
    
    // Create an inline SVG as fallback
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#333"/>
        <text x="50%" y="50%" font-family="Arial" font-size="18" text-anchor="middle" fill="#bbb">Image Unavailable</text>
      </svg>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-store'
        }
      }
    );
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
