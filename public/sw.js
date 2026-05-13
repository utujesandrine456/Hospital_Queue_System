const CACHE_NAME = 'mediqueue-v3-standalone';

const PRECACHE_ASSETS = [
    '/',
    '/manifest.json',
    '/images/logo-image.png',
    '/favicon.ico'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching critical assets');
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    console.log('[SW] Service Worker Activated');
});

// Fetch Event - Cache-First for static assets, Network-First for navigation
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Handle Navigation (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                    return networkResponse;
                })
                .catch(() => {
                    console.log('[SW] Fetch failed, serving from cache:', request.url);
                    return caches.match(request).then(cached => cached || caches.match('/'));
                })
        );
        return;
    }

    // Handle Static Assets (JS, CSS, Images)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached, but optionally update in background for next time
                if (url.pathname.includes('/_next/static/')) {
                    return cachedResponse; // No need to update static hashed files
                }
                return cachedResponse;
            }

            return fetch(request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                return networkResponse;
            }).catch(() => {
                // Silent fail for non-critical assets
            });
        })
    );
});
