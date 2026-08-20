// Deterministyczny, idempotentny build PWA.
// Wejscie: src/app.html, src/icons/*.png, wersja z env VERSION (np. 1.9.0) lub "dev".
// Wyjscie (root repo): index.html, app.<hash8>.html, manifest.webmanifest, sw.js,
//                      icons/*.png, versions.json
// Determinizm: hash liczony WYLACZNIE z tresci src/app.html (po podstawieniu wersji);
// brak timestampow w artefaktach poza polem releasedAt w versions.json (data tagu).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const VERSION = (process.env.VERSION || 'dev').replace(/^v/, '');
const RELEASED_AT = process.env.RELEASED_AT || null; // YYYY-MM-DD z tagu; null = build lokalny

// 1. App: wstrzyknij wersje, policz hash z TRESCI
let app = readFileSync(join(ROOT, 'src/app.html'), 'utf8');
if (!app.includes('__APP_VERSION__')) throw new Error('Brak placeholdera __APP_VERSION__ w src/app.html');
app = app.replaceAll('__APP_VERSION__', VERSION);
app = app.replaceAll('__RELEASED_AT__', RELEASED_AT || 'dev');
const hash = createHash('sha256').update(app, 'utf8').digest('hex').slice(0, 8);
const APP_FILE = `app.${hash}.html`;

// 2. Ikony: kopiuj 1:1
mkdirSync(join(ROOT, 'icons'), { recursive: true });
const icons = readdirSync(join(ROOT, 'src/icons')).filter(f => f.endsWith('.png')).sort();
for (const f of icons) copyFileSync(join(ROOT, 'src/icons', f), join(ROOT, 'icons', f));

// 3. versions.json: append jesli hash nowy; no-op jesli istnieje (idempotencja)
const VJ_PATH = join(ROOT, 'versions.json');
let vj = { current: null, versions: [] };
if (existsSync(VJ_PATH)) vj = JSON.parse(readFileSync(VJ_PATH, 'utf8'));
const existing = vj.versions.find(v => v.file === APP_FILE);
if (!existing) {
  vj.versions.push({ version: VERSION, file: APP_FILE, releasedAt: RELEASED_AT });
}
vj.versions.sort((a, b) => (a.releasedAt || '').localeCompare(b.releasedAt || '') || a.version.localeCompare(b.version));
vj.current = APP_FILE;
writeFileSync(VJ_PATH, JSON.stringify(vj, null, 2) + '\n');

// 4. index.html: wskaznik na aktualny plik (generowany, malutki)
const indexHtml = `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <title>Arkadia Web Standalone Tools</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#1a1a2e">
  <!-- PLIK GENEROWANY PRZEZ scripts/build.mjs - nie edytowac recznie -->
  <script>
    const APP_FILE = ${JSON.stringify(APP_FILE)};
    const targetUrl = APP_FILE + window.location.search + window.location.hash;
    window.addEventListener("DOMContentLoaded", () => {
      const link = document.getElementById("app-link");
      if (link) { link.href = targetUrl; link.textContent = targetUrl; }
    });
    window.location.replace(targetUrl);
  </script>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
           font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
           background: #0d1117; color: #e6edf3; }
    main { max-width: 560px; padding: 32px; text-align: center; }
    a { color: #58a6ff; }
  </style>
</head>
<body>
  <main>
    <h1>Przekierowanie…</h1>
    <p>Jeżeli strona nie otworzy się automatycznie, <a id="app-link" href="${APP_FILE}">kliknij tutaj</a>.</p>
    <noscript><p>JavaScript jest wyłączony. Otwórz ręcznie: <a href="${APP_FILE}">${APP_FILE}</a></p></noscript>
  </main>
</body>
</html>
`;
writeFileSync(join(ROOT, 'index.html'), indexHtml);

// 5. manifest.webmanifest
const manifest = {
  name: 'Arkadia MUD — Narzędzia',
  short_name: 'Arkadia',
  description: 'Kalendarz RL-IG (Imperium, Ishtar) i przelicznik walut dla gry MUD Arkadia. Działa offline.',
  lang: 'pl',
  start_url: './index.html',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#1a1a2e',
  theme_color: '#1a1a2e',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
};
writeFileSync(join(ROOT, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

// 6. sw.js: precache immutable assets; wskaznik network-first; cleanup po versions.json
const precache = [APP_FILE, 'manifest.webmanifest', ...icons.map(f => `icons/${f}`)];
const sw = `// PLIK GENEROWANY PRZEZ scripts/build.mjs - nie edytowac recznie
const SW_VERSION = ${JSON.stringify(VERSION + '+' + hash)};
const APP_CACHE = 'ark-app-' + ${JSON.stringify(VERSION + '-' + hash)};
const POINTER_CACHE = 'ark-pointer-v1';
const PRECACHE = ${JSON.stringify(precache, null, 2)};
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
`;
writeFileSync(join(ROOT, 'sw.js'), sw);

// 7. Aplikacja
writeFileSync(join(ROOT, APP_FILE), app);

console.log(JSON.stringify({ version: VERSION, file: APP_FILE, hash, precache: precache.length }, null, 2));
