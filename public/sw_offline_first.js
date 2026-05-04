/* ============================================================
   FILE: sw.js (Service Worker)
   AUTHOR: Ryan Stanley (rs)
   DESCRIPTION: Service Worker for Progressive Web App (PWA)
   Allows the website to be downloaded and used offline
   ============================================================ */

// Define the cache name - change version to force update
const rs_CACHE_NAME = 'worldcup2026-v2';

// ============================================================
// INSTALL EVENT
// ============================================================
// This runs when the service worker is first installed
// We cache the essential shell for offline use

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    // Wait until the shell is cached
    event.waitUntil(
        caches.open(rs_CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll([
                '/',
                '/index.html',
                '/offline_message.html'
            ]);
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
// Strategy: Network First, fallback to Cache, then fallback page

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;
    
    // For navigation requests (HTML pages), use Network First
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // Cache the latest version
                    const responseToCache = networkResponse.clone();
                    caches.open(rs_CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If no cache, show offline page
                        return caches.match('/offline_message.html');
                    });
                })
        );
        return;
    }
    
    // For static assets (JS, CSS, images, data), use Cache First
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
                // For non-HTML requests, just fail silently
                return new Response('Offline', { status: 503 });
            });
        })
    );
});
