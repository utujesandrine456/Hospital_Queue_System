/* MediQueue - Ultimate Resilience SW v6 (The Cure) */

const CACHE_NAME = 'mediqueue-v6-resilient';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
    OFFLINE_URL,
    '/manifest.json',
    '/images/logo-image.png',
    '/images/hero_image_Updated.png',
    '/globals.css', // Attempt to catch CSS if possible, but the handler will catch it anyway
];

// 1. Install Event: Robust asset caching
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Resilient Install Started');
            // Use individual add for each to prevent one 404 from breaking everything
            return Promise.allSettled(
                PRECACHE_ASSETS.map(asset =>
                    cache.add(asset).catch(err => console.warn(`[SW] Failed to precache: ${asset}`, err))
                )
            );
        })
    );
});

// 2. Activate Event: Force control and clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            clients.claim(),
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
                );
            })
        ])
    );
    console.log('[SW] Resilient Control Established');
});

// 3. Fetch Event: Multi-tier fallback strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    // Navigation: Network-First then Cache-Fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                    return networkResponse;
                })
                .catch(() => {
                    console.log('[SW] Navigation failed, serving from cache');
                    return caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL));
                })
        );
        return;
    }

    // Assets: Cache-First then Network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) return networkResponse;

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                return networkResponse;
            }).catch(() => {
                // Fail silently for non-critical assets
            });
        })
    );
});
