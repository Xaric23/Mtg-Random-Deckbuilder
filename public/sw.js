const CACHE_NAME = 'mtg-deckbuilder-v1.3';
const CACHE_VERSION = '1.3.0';
const APP_VERSION = '1.3.0';

// Get base path from service worker location and origin
const BASE_URL = self.location.origin;
const BASE_PATH = self.location.pathname.includes('/Mtg-Random-Deckbuilder') ? '/Mtg-Random-Deckbuilder' : '';

// Clean up the base path to ensure proper URL construction
const getAssetPath = (path) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_PATH}/${cleanPath}`;
};

const urlsToCache = [
  BASE_URL + getAssetPath(''),
  BASE_URL + getAssetPath('manifest.json'),
  BASE_URL + getAssetPath('icon-192.png'),
  BASE_URL + getAssetPath('icon-512.png'),
];

// Helper function to validate and clone response
const validateAndClone = async (response) => {
  // Consider both 200 and 0 (opaque responses) as valid
  if (!response) {
    console.warn('No response received');
    return null;
  }
  if (response.status !== 200 && response.status !== 0) {
    console.warn('Invalid response status:', response.status, 'for URL:', response.url);
    return null;
  }
  if (!response.ok && response.status !== 0) {
    console.warn('Response not ok:', response.status, 'for URL:', response.url);
    return null;
  }
  try {
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
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET' || event.request.url.includes('api.scryfall.com')) {
    return;
  }

  // Skip Google Analytics
  if (event.request.url.includes('google-analytics.com') || event.request.url.includes('analytics')) {
    return;
  }

  // Special handling for font requests - bypass cache
  if (event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => new Response('', { status: 404 }))
    );
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try network first
        const response = await fetch(event.request);
        const validResponse = await validateAndClone(response);
        
        if (validResponse) {
          // Cache the valid response in the background
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone()).catch(console.warn);
          return validResponse;
        }
      } catch (error) {
        console.warn('Network fetch failed:', error);
      }

      // If network fails or response is invalid, try cache
      const cached = await caches.match(event.request);
      if (cached) {
        return cached;
      }

      // If nothing works, return a 404
      return new Response('Not found', { status: 404 });
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});