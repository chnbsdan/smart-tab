const CACHE_NAME = 'smart-tab-v1';
const urlsToCache = [
    '/',
    '/css/main.css',
    '/css/components.css',
    '/css/responsive.css',
    '/js/app.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
