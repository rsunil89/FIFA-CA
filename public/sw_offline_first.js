/* ============================================================
   FILE: sw.js (Service Worker)
   AUTHOR: Ryan Stanley (rs)
   DESCRIPTION: Service Worker for Progressive Web App (PWA)
   Allows the website to be downloaded and used offline
   ============================================================ */

// Define the cache name - change version to force update
const rs_CACHE_NAME = 'worldcup2026-v1';

// Define files to cache for offline use
const rs_FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/data/worldcup2026.json'
];

// ============================================================
// INSTALL EVENT
// ============================================================
// This runs when the service worker is first installed
// We cache all the essential files for offline use

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    // Wait until all files are cached
    event.waitUntil(
        caches.open(rs_CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching app files');
            return cache.addAll(rs_FILES_TO_CACHE);
        }).then(() => {
            console.log('[Service Worker] Installation complete');
            return self.skipWaiting();
        })
    );
});

// ============================================================
// ACTIVATE EVENT
// ============================================================
// This runs when the service worker is activated
// We clean up old caches here

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    // Remove old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== rs_CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete');
            return self.clients.claim();
        })
    );
});

// ============================================================
// FETCH EVENT
// ============================================================
// This runs every time the app makes a network request
// We try to serve from cache first, then fall back to network

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;
    
    // Strategy: Cache First, then Network
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response if available
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // Otherwise fetch from network
            return fetch(event.request).then((networkResponse) => {
                // Don't cache non-successful responses
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }
                
                // Cache the new response for future offline use
                const responseToCache = networkResponse.clone();
                caches.open(rs_CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                
                return networkResponse;
            }).catch((error) => {
                console.log('[Service Worker] Fetch failed:', error);
                // Could return a fallback page here
            });
        })
    );
});
