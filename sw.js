// PLIK GENEROWANY PRZEZ scripts/build.mjs - nie edytowac recznie
const SW_VERSION = "1.9.0+7155a2b2";
const APP_CACHE = 'ark-app-' + "1.9.0-7155a2b2";
const POINTER_CACHE = 'ark-pointer-v1';
const PRECACHE = [
  "app.7155a2b2.html",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png"
];
const POINTER_URLS = ['index.html', 'versions.json', './'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE))
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Cleanup: zostaw biezacy cache + pointer + poprzednia wersje apki (rollback offline).
    let keep = new Set([APP_CACHE, POINTER_CACHE]);
    try {
      const res = await caches.match('versions.json');
      if (res) {
        const vj = await res.json();
        for (const v of (vj.versions || []).slice(-2)) keep.add('ark-app-' + v.version + '-' + v.file.split('.')[1]);
      }
    } catch (e) { /* brak danych = zostaw tylko biezacy */ }
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith('ark-') && !keep.has(n)).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const path = url.pathname.split('/').pop() || 'index.html';

  // Wskaznik wersji: zawsze probuj siec, fallback do cache.
  if (path === 'index.html' || path === 'versions.json' || path === 'sw.js') {
    event.respondWith(
      fetch(event.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(POINTER_CACHE).then((c) => c.put(event.request, clone));
        }
        return res;
      }).catch(() => caches.match(event.request).then((r) => r || caches.match('index.html')))
    );
    return;
  }

  // Pliki z hashem i ikony: immutable, cache-first.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
      if (res.ok && (path.startsWith('app.') || url.pathname.includes('/icons/'))) {
        const clone = res.clone();
        caches.open(APP_CACHE).then((c) => c.put(event.request, clone));
      }
      return res;
    }))
  );
});
