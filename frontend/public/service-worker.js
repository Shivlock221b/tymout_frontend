// Service Worker for Tymout Frontend - Optimized for performance
const CACHE_NAME = 'tymout-cache-v2';
// Critical assets that should be cached immediately for better LCP
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.chunk.css',
  '/performance-fixes.css',
  '/preload.js',
  '/env-config.js',
  '/logo192.png'
];

// Secondary assets that can be cached but aren't critical for initial render
const SECONDARY_ASSETS = [
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
  '/favicon.ico',
  '/logo512.png',
  '/manifest.json',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/og-image.png'
];

// All assets to cache
const urlsToCache = [...CRITICAL_ASSETS, ...SECONDARY_ASSETS];

// Install event - cache static assets with priority for critical assets
self.addEventListener('install', event => {
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Cache critical assets first for better LCP
      await cache.addAll(CRITICAL_ASSETS);
      
      // Then cache secondary assets
      await cache.addAll(SECONDARY_ASSETS);
      
      console.log('Cache populated with critical and secondary assets');
    })()
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests like API calls
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For HTML pages, use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version of the page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate event - clean up old caches and claim clients for immediate control
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim clients so the service worker is in control without reload
      self.clients.claim()
    ])
  );
});
