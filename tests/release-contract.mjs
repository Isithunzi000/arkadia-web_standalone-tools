import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'arkadia_tools.html'), 'utf8');
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const workflow = readFileSync(join(ROOT, '.github/workflows/release.yml'), 'utf8');

function one(pattern, text, label) {
  const matches = [...text.matchAll(pattern)];
  assert.equal(matches.length, 1, `${label}: oczekiwano dokladnie jednego wystapienia`);
  return matches[0][1];
}

test('A1: matematyka kalendarza v3 ma nowa, spojna wersje aplikacji i cache', () => {
  assert.match(html, /GN_PR\s*=\s*1285/);
  assert.match(html, /function impNewMoonNight\(/);
  assert.match(html, /function impNewMoonFlip\(/);

  const meta = one(/name="arkadia-build" content="([0-9]+\.[0-9]+\.[0-9]+)"/g, html, 'meta');
  const footer = one(/Arkadia Narzędzia v([0-9]+\.[0-9]+\.[0-9]+)/g, html, 'stopka');
  const pwa = one(/<div id="pwa-version">v([0-9]+\.[0-9]+\.[0-9]+)<\/div>/g, html, 'PWA');
  const worker = one(/const VERSION = "([0-9]+\.[0-9]+\.[0-9]+)"/g, sw, 'service worker');

  assert.notEqual(meta, '1.11.1', 'matematyka v3 nie moze pozostac pod wersja 1.11.1');
  assert.equal(footer, meta);
  assert.equal(pwa, meta);
  assert.equal(worker, meta, 'zmiana aplikacji musi zmienic nazwe cache PWA');
  assert.match(sw, /const CACHE = "ark-tools-" \+ VERSION/);
  assert.match(sw, /names\.filter\(\(n\) => n !== CACHE\)/);
});

test('A2: workflow release uruchamia lokalny kontrakt przed publikacja', () => {
  const testPos = workflow.indexOf('node --test tests/release-contract.mjs');
  const releasePos = workflow.indexOf('gh release');
  assert.ok(testPos >= 0, 'brak testu release-contract w workflow');
  assert.ok(releasePos > testPos, 'test musi wystapic przed operacja release');
});
