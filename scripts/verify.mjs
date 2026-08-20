// Weryfikacja spojnosci artefaktow PWA. Exit 1 przy dowolnym bledzie = brak deploya.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const errors = [];
const ok = (cond, msg) => { if (!cond) errors.push(msg); };

const vj = JSON.parse(readFileSync(join(ROOT, 'versions.json'), 'utf8'));
ok(vj.current, 'versions.json: brak current');
ok(Array.isArray(vj.versions) && vj.versions.length > 0, 'versions.json: pusta lista versions');
ok(vj.versions.some(v => v.file === vj.current), 'versions.json: current nie wskazuje na zaden wpis');

for (const v of vj.versions) {
  ok(existsSync(join(ROOT, v.file)), `brak pliku aplikacji: ${v.file}`);
  ok(/^app\.[0-9a-f]{8}\.html$/.test(v.file), `zla nazwa pliku: ${v.file}`);
}

const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
ok(index.includes(vj.current), 'index.html: nie wskazuje na current');

const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
ok(manifest.start_url === './index.html', 'manifest: start_url != ./index.html');
ok(manifest.display === 'standalone', 'manifest: display != standalone');
for (const icon of manifest.icons) {
  ok(existsSync(join(ROOT, icon.src)), `manifest: brak ikony ${icon.src}`);
}
ok(existsSync(join(ROOT, 'icons/apple-touch-icon.png')), 'brak apple-touch-icon.png');

try {
  execFileSync(process.execPath, ['--check', join(ROOT, 'sw.js')], { stdio: 'pipe' });
} catch (e) {
  errors.push('sw.js: blad skladni');
}
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
ok(sw.includes(vj.current.replace('.html', '').split('.')[1]), 'sw.js: nie precachuje current');

const app = readFileSync(join(ROOT, vj.current), 'utf8');
ok(!app.includes('__APP_VERSION__'), 'aplikacja: niewstrzyknieta wersja');
ok(app.includes('serviceWorker'), 'aplikacja: brak rejestracji SW');
ok(app.includes('manifest.webmanifest'), 'aplikacja: brak linku do manifestu');

if (errors.length) {
  console.error('VERIFY FAILED:');
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}
console.log(`VERIFY OK: current=${vj.current}, wersji=${vj.versions.length}`);
