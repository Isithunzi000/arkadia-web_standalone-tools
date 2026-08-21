// Statyczny service worker — edytowany recznie.
// VERSION musi byc rowny wersji w stopce arkadia_tools.html (guard w release.yml).
const VERSION = "1.11.0";
const CACHE = "ark-tools-" + VERSION;
const PRECACHE = [
  "arkadia_tools.html",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

// Pasek "Dostepna nowa wersja" w apce wysyla SKIP_WAITING po kliknieciu "Odswiez".
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Sprzatanie: usuwamy WSZYSTKIE inne cache (w tym legacy ark-app-* i ark-pointer-v1).
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Nawigacje (/, index.html, arkadia_tools.html): zawsze plik apki, cache-first.
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("arkadia_tools.html").then((r) => r || fetch("arkadia_tools.html"))
    );
    return;
  }

  // Reszta same-origin: cache-first, przy trafieniu sieciowym dopisz do cache.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(event.request, clone));
      }
      return res;
    }))
  );
});
