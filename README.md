# Arkadia Web Standalone Tools

Samowystarczalne narzędzia przeglądarkowe dla gry MUD **Arkadia** — aplikacja to jeden plik HTML, zero zależności, działa też na telefonie. **Od wersji 1.9: instalowalna aplikacja PWA, działa w pełni offline.**

## Link do aplikacji

**https://isithunzi000.github.io/arkadia-web_standalone-tools/**

## Instalacja jako aplikacja (PWA)

- **Android / Chrome:** otwórz link — pojawi się opcja „Zainstaluj aplikację" (albo menu ⋮ → „Dodaj do ekranu głównego").
- **iPhone / Safari:** przycisk Udostępnij → „Dodaj do ekranu głównego".

Po instalacji aplikacja działa **bez internetu**. Aktualizacje pobierają się same w tle przy kolejnym uruchomieniu — gdy nowa wersja będzie gotowa, na dole ekranu zobaczysz pasek „Dostępna nowa wersja. Odśwież". Twoja kalibracja i ustawienia przetrwają każdą aktualizację (są trzymane w pamięci przeglądarki, poza mechanizmem aktualizacji).

## Co to robi

- **Kalendarz RL <-> IG** — przelicza czas rzeczywisty na czas w grze (i odwrotnie) dla dwóch domen: **Imperium** i **Ishtar**. Po jednorazowej kalibracji zapamiętuje punkt odniesienia w przeglądarce i pokazuje najbliższe wydarzenia w grze (święta, nowie, pełnie, pory roku) z datami RL i odliczaniem.
- **Denominacja** — przelicznik walut gry (12 miedzi = 1 srebro, 20 srebr = 1 złoto, 100 złotych = 1 mithryl).

## Struktura repo

| Plik/katalog | Status | Opis |
|---|---|---|
| `src/app.html` | **edytowalny** | jedyne źródło aplikacji — tu wprowadzasz zmiany |
| `src/icons/` | **edytowalny** | ikony źródłowe (rzadko ruszane) |
| `scripts/build.mjs` | **edytowalny** | build: hash → artefakty (zmieniaj tylko świadomie) |
| `scripts/verify.mjs` | **edytowalny** | walidacja spójności przed publikacją |
| `app.<hash>.html` | generowany | plik aplikacji z hashem treści w nazwie (immutable) |
| `index.html` | generowany | wskaźnik na aktualną wersję (przekierowanie) |
| `sw.js` | generowany | service worker (offline + aktualizacje) |
| `manifest.webmanifest` | generowany | manifest PWA |
| `versions.json` | generowany | rejestr wersji + wskaźnik `current` |
| `icons/` | generowany | kopie ikon z `src/icons/` |
| `arkadia_tools_v1_8.html` | **zamrożony** | ostatnia wersja przed PWA — zostaje na zawsze, istniejące zakładki działają |
| `README.md`, `LICENSE` | edytowalny | dokumentacja, licencja |

**Zasada:** pliki generowane powstają wyłącznie przez `scripts/build.mjs` — nie edytuj ich ręcznie.

## Jak wydawać nowe wersje (dla maintainera)

1. Edytuj `src/app.html` (ew. `src/icons/`), `git commit`, push na `main`.
2. `git tag v1.10.0 && git push origin v1.10.0` — workflow **Release PWA** zbuduje artefakty, zweryfikuje (`verify.mjs` — przy błędzie publikacja się nie odbędzie) i commitnie je na `main`, skąd GitHub Pages je serwuje.
3. Użytkownicy dostaną aktualizację automatycznie przy kolejnym uruchomieniu aplikacji (pasek „Odśwież").

Build jest **deterministyczny i idempotentny**: ten sam `src/` + ta sama wersja = bitowo identyczne artefakty; ponowny run workflow to no-op.

### Build lokalny (przed tagiem, do podglądu)

```sh
VERSION=1.10.0 node scripts/build.mjs   # RELEASED_AT opcjonalnie: YYYY-MM-DD
node scripts/verify.mjs                  # walidacja
python3 -m http.server 8080              # podgląd na http://localhost:8080
```

### Rollback

Zakładka **Actions → „Rollback PWA" → Run workflow** → podaj tag (np. `v1.9.0`). Workflow przywraca `src/` z taga, przebudowuje wskaźnik na starą wersję i publikuje. Historia w `versions.json` i stare pliki z hashami nie są kasowane — rollback jest odwracalny.
