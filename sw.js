const CACHE_NAME = 'palmtweets-pro-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/auth.js',
  './js/feed.js',
  './js/admin.js',
  './js/utils.js',
  './js/config.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-icon.png'
];

// Install Event - Cache Files
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// Fetch Event - Serve from Cache if available
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});