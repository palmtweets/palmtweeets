// BADILISHA HII KILA UKIONGEZA FEATURES MPYA
const CACHE_NAME = 'v-final-video-KEYSTONE'; 

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/utils.js',
  './js/auth.js',
  './js/feed.js',
  './js/admin.js',
  './js/app.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@phosphor-icons/web',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// 1. INSTALL: Hifadhi files kwenye simu
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Lazimisha ku-install mpya haraka
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ACTIVATE: Futa cache za zamani (Hapa ndipo tunaua ile ya jana)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Chukua control ya browser mara moja
});

// 3. FETCH: Tumia cache, ukikosa tafuta mtandaoni
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});





