const CACHE_NAME = 'mediqueue-v10-dev-friendly';
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

    // CRITICAL FIX: Bypass Next.js HMR, dev chunks, and backend API routes
    if (
        url.pathname.startsWith('/_next/') ||
        url.pathname.startsWith('/api/') ||
        url.pathname.includes('.hot-update')
    ) {
        return; // act as if there is no service worker for these
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15_000);
                try {
                    const response = await fetch(request, { signal: controller.signal });
                    return response;
                } catch {
                    const offline = await caches.match(OFFLINE_URL);
                    if (offline) return offline;
                    return fetch(request);
                } finally {
                    clearTimeout(timeoutId);
                }
            })()
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
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
                if (url.pathname.startsWith('/images/')) {
                    return caches.match('/images/logo-image.png');
                }
            });
        })
    );
});
