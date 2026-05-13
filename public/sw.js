/* MediQueue - Smart Intercept SW v8 (The Fortress) */

const CACHE_NAME = 'mediqueue-v8-fortress';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
    OFFLINE_URL,
    '/manifest.json',
    '/images/logo-image.png',
    '/images/hero_image_Updated.png',
    '/images/queue-empty.png',
    '/images/hero-medical.png',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                PRECACHE_ASSETS.map(asset =>
                    cache.add(asset).catch(() => console.warn(`[SW] Skip non-critical pre-cache: ${asset}`))
                )
            );
        })
    );
});

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
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // 1. NAVIGATION: Return Shell
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    // 2. SMART CACHE: Try cache, fallback to network, then save to cache
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached, but refresh images in background if online
                if (url.pathname.startsWith('/images/')) {
                    fetch(request).then(res => {
                        if (res.status === 200) caches.open(CACHE_NAME).then(c => c.put(request, res));
                    }).catch(() => { });
                }
                return cachedResponse;
            }

            return fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                }
                return networkResponse;
            }).catch(() => {
                // Ultimate fallback for missing images: return the logo
                if (url.pathname.startsWith('/images/')) {
                    return caches.match('/images/logo-image.png');
                }
            });
        })
    );
});
