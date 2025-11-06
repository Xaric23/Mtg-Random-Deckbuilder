const CACHE_NAME = 'mtg-deckbuilder-v1.4';
const CACHE_VERSION = '1.4.0';
const APP_VERSION = '1.4.0';

// Get base path and URL handling
const BASE_URL = self.location.origin;
const BASE_PATH = self.location.pathname.includes('/Mtg-Random-Deckbuilder') ? '/Mtg-Random-Deckbuilder' : '';

// Clean up URLs and handle GitHub Pages paths
const getAssetPath = (path) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return BASE_PATH + '/' + cleanPath.replace(/^\/+/, '');
};

const getFullUrl = (path) => {
  const assetPath = getAssetPath(path);
  return new URL(assetPath, BASE_URL).toString();
};

const urlsToCache = [
  getFullUrl('/'),
  getFullUrl('/manifest.json'),
  getFullUrl('/icon-192.png'),
  getFullUrl('/icon-512.png'),
];

// Helper function to validate and handle response
const validateAndClone = async (response) => {
  if (!response) return null;
  
  // Accept 200-299 range and 0 (opaque responses)
  const validStatus = (response.status >= 200 && response.status < 300) || response.status === 0;
  if (!validStatus) {
    console.warn('Invalid response status:', response.status, 'for URL:', response.url);
    return null;
  }

  try {
    // For opaque responses, return as is
    if (response.status === 0) return response;
    // For normal responses, try to clone
    return response.clone();
  } catch (e) {
    console.warn('Failed to clone response:', e);
    return response;
  }
};

// Install event - cache resources
self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map(url => 
          fetch(url)
            .then(response => {
              if (!response.ok) throw new Error(`Failed to fetch ${url}`);
              return cache.put(url, response);
            })
            .catch(error => console.warn('Cache error:', error))
        )
      );
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip analytics and API calls
  if (event.request.url.includes('analytics') || 
      event.request.url.includes('api.scryfall.com')) {
    return;
  }

  // Special handling for fonts - pass through
  if (event.request.url.includes('fonts.googleapis.com') || 
      event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try network first
        const fetchResponse = await fetch(event.request);
        const validResponse = await validateAndClone(fetchResponse);
        
        if (validResponse) {
          // Cache successful responses only
          if (fetchResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            try {
              await cache.put(event.request, fetchResponse.clone());
            } catch (err) {
              console.warn('Cache write failed:', err);
            }
          }
          return validResponse;
        }
      } catch (error) {
        console.warn('Network fetch failed:', error);
      }

      // Try cache on network failure
      try {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
      } catch (error) {
        console.warn('Cache fetch failed:', error);
      }

      // Last resort - return empty 404 response
      return new Response('Not found', { 
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({
          'Content-Type': 'text/plain',
        })
      });
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys()
        .then(cacheNames => Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        )),
      self.clients.claim()
    ])
  );
});

// Handle client messages
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});