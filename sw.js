// Kill switch. The site used to register a service worker that served CSS/JS cache-first,
// so returning visitors still have a worker that can pin stale assets. Registration is gone
// from preload.js, but an installed worker only disappears if it updates itself one last
// time — that is what this file does: drop every cache, then unregister.
//
// Safe to delete once no visitor has run this version (about a month after deploy).
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
        await self.registration.unregister();
    })());
});
