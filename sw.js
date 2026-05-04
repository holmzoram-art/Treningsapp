const CACHE = 'onitio-v1';
const ASSETS = [
  '/Treningsapp/',
  '/Treningsapp/index.html',
  '/Treningsapp/styles.css',
  '/Treningsapp/app.js',
  '/Treningsapp/data/athletes.js',
  '/Treningsapp/data/program.js',
  '/Treningsapp/data/strength.js',
  '/Treningsapp/manifest.json',
  'https://unpkg.com/vue@3/dist/vue.global.prod.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
