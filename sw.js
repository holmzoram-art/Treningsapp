const APP_CACHE = 'onitio-app-v6';
const CDN_CACHE = 'onitio-cdn-v1';

const APP_ASSETS = [
  '/Treningsapp/',
  '/Treningsapp/index.html',
  '/Treningsapp/styles.css',
  '/Treningsapp/app.js',
  '/Treningsapp/data/athletes.js',
  '/Treningsapp/data/program.js',
  '/Treningsapp/data/strength.js',
  '/Treningsapp/manifest.json',
];

const CDN_ASSETS = [
  'https://unpkg.com/vue@3/dist/vue.global.prod.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    Promise.all([
      caches.open(APP_CACHE).then(c => c.addAll(APP_ASSETS)),
      caches.open(CDN_CACHE).then(c => c.addAll(CDN_ASSETS))
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  const keep = [APP_CACHE, CDN_CACHE];
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // CDN (Vue.js): cache-first — innholdet endrer seg aldri
  if (url.origin !== self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        caches.open(CDN_CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }))
    );
    return;
  }

  // App-filer: network-first — hent alltid siste versjon fra nett,
  // oppdater cache, og fall tilbake til cache kun hvis offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) caches.open(APP_CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
