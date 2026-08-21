# Arkadia Web Standalone Tools

Samowystarczalne narzędzia przeglądarkowe dla gry MUD **Arkadia** — jeden plik HTML, zero zależności, działa też na telefonie. Instalowalna aplikacja PWA, działa w pełni offline.

## Link do aplikacji

**https://isithunzi000.github.io/arkadia-web_standalone-tools/**

## Pobierz

Najnowsza wersja do użytku lokalnego: **[arkadia_tools.html](https://github.com/Isithunzi000/arkadia-web_standalone-tools/releases/latest/download/arkadia_tools.html)** z release `latest`.

## Instalacja jako aplikacja (PWA)

- **Android / Chrome:** otwórz link — pojawi się opcja „Zainstaluj aplikację" (albo menu ⋮ → „Dodaj do ekranu głównego").
- **iPhone / Safari:** przycisk Udostępnij → „Dodaj do ekranu głównego".

Po instalacji aplikacja działa **bez internetu**. Aktualizacje pobierają się same w tle — gdy nowa wersja będzie gotowa, na dole ekranu zobaczysz pasek „Dostępna nowa wersja. Odśwież". Twoja kalibracja i ustawienia przetrwają każdą aktualizację (są trzymane w pamięci przeglądarki, poza mechanizmem aktualizacji).

## Co to robi

- **Kalendarz RL <-> IG** — przelicza czas rzeczywisty na czas w grze (i odwrotnie) dla dwóch domen: **Imperium** i **Ishtar**. Po jednorazowej kalibracji zapamiętuje punkt odniesienia w przeglądarce i pokazuje najbliższe wydarzenia w grze (święta, nowie, pełnie, pory roku) z datami RL i odliczaniem.
- **Denominacja** — przelicznik walut gry (12 miedzi = 1 srebro, 20 srebr = 1 złoto, 100 złotych = 1 mithryl).

## Dla maintainera

- Edytujesz wyłącznie **`arkadia_tools.html`** w root (cała aplikacja) i **`sw.js`** (offline). Wersja występuje w 3 miejscach i musi być spójna: stopka + meta `arkadia-build` w `arkadia_tools.html` oraz `VERSION` w `sw.js` — pilnuje tego guard w workflow release.
- Wydanie: `git tag v<X.Y.Z> && git push origin v<X.Y.Z>` — workflow sprawdzi spójność wersji i opublikuje `arkadia_tools.html` w release. GitHub Pages serwuje pliki prosto z `main`.
- Rollback: `git revert` commitów z błędną wersją + push.

## Licencja

MIT — patrz plik [LICENSE](LICENSE).
