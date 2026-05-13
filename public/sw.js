
const CACHE_NAME = 'mediqueue-nuclear-v5';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
    OFFLINE_URL,
    '/manifest.json',
    '/images/logo-image.png',
    '/favicon.ico',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Nuclear Preloading Active');
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    console.log('[SW] Nuclear Control Established');
});

// 3. Fetch Event: Intercept everything
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Handling HTML pages (Navigation)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    // If network works, save it and return
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                    return networkResponse;
                })
                .catch(() => {
                    // If network fails (Offline / ERR_NAME_NOT_RESOLVED), serve from cache
                    console.log('[SW] Offline detected, serving from nuclear cache');
                    return caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL));
                })
        );
        return;
    }

    // Handling Static Assets (JS, CSS, Images)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) return networkResponse;

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                return networkResponse;
            }).catch(() => {
                // Return nothing for failed assets to let browser handle it or use a default
            });
        })
    );
});
