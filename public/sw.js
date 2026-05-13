/* MediQueue - Ultimate SPA Resilience SW v7 (The Shell) */

const CACHE_NAME = 'mediqueue-v7-shell';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
    OFFLINE_URL,
    '/manifest.json',
    '/images/logo-image.png',
    '/images/hero_image_Updated.png',
    '/favicon.ico',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Shell Preload Active');
            return Promise.allSettled(
                PRECACHE_ASSETS.map(asset =>
                    cache.add(asset).catch(err => console.warn(`[SW] Failed asset: ${asset}`))
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

    // 1. NAVIGATION: Return the Shell (/) for all navigation requests if network fails
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                console.log('[SW] Navigation Intercepted - Serving Shell');
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                }
                return networkResponse;
            }).catch(() => {
            });
        })
    );
});
