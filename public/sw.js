const CACHE_NAME = 'mtg-deckbuilder-v1.1';
const CACHE_VERSION = '1.1.0';
const APP_VERSION = '1.1.0';

const BASE_PATH = self.location.pathname.includes('/Mtg-Random-Deckbuilder') ? '/Mtg-Random-Deckbuilder' : '';
const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/icon-192.png',
  BASE_PATH + '/icon-512.png',
];

// Helper function to validate and clone response
const validateAndClone = async (response) => {
  if (!response || response.status !== 200) {
    throw new Error('Bad response status: ' + (response ? response.status : 'null'));
  }
  return response.clone();
};

// Install event - cache resources
self.addEventListener('install', (event) => {
  // Skip waiting to activate the new service worker immediately
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

  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        try {
          // Validate and clone response
          const validResponse = await validateAndClone(response);
          // Update cache in background
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, response.clone()))
            .catch(err => console.error('Cache write failed:', err));
          return validResponse;
        } catch (error) {
          console.error('Network response error:', error);
          throw error;
        }
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
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

