const CACHE_VERSION = 13;
const CACHE_NAME = `lepex-cache-v${CACHE_VERSION}`;
const PREVIEW_CACHE = `lepex-previews-v${CACHE_VERSION}`;

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/rss.xml',
    '/css/themes.css',
    '/css/themes-light.css',
    '/css/shared.css',
    '/css/main.css',
    '/css/features.css',
    '/css/portfolio.css',
    '/js/core.js',
    '/js/preload.js',
    '/js/discord.js',
    '/js/portfolio.js',
    '/fonts/satoshi.woff2',
    '/favicon/favicon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Cache images/previews
    if (url.pathname.includes('/assets/previews/') &&
        (url.pathname.endsWith('.webp') ||
            url.pathname.endsWith('.gif') ||
            url.pathname.endsWith('.png'))) {

        event.respondWith(
            caches.open(PREVIEW_CACHE).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Network first for HTML, cache fallback
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request)
                        .then(response => response || caches.match('/offline.html'));
                })
        );
        return;
    }

    // Cache first for static assets; store same-origin responses for offline use
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) return response;
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 &&
                    url.origin === self.location.origin) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return networkResponse;
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter(name =>
                    name.startsWith('lepex-') &&
                    name !== CACHE_NAME &&
                    name !== PREVIEW_CACHE
                ).map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});
