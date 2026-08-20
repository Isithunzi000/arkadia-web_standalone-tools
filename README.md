# Arkadia Web Standalone Tools

Samowystarczalne narzędzia przeglądarkowe dla gry MUD **Arkadia** — jeden plik HTML, zero zależności, działa też na telefonie. **Od wersji 1.9: instalowalna aplikacja PWA, działa w pełni offline.**

## Link do aplikacji

**https://isithunzi000.github.io/arkadia-web_standalone-tools/**

## Instalacja jako aplikacja (PWA)

- **Android / Chrome:** otwórz link — pojawi się opcja „Zainstaluj aplikację" (albo menu ⋮ → „Dodaj do ekranu głównego").
- **iPhone / Safari:** przycisk Udostępnij → „Dodaj do ekranu głównego".

Po instalacji aplikacja działa **bez internetu**. Aktualizacje pobierają się same w tle — gdy pojawi się nowa wersja, na dole ekranu zobaczysz pasek „Dostępna nowa wersja — Odśwież". Twoja kalibracja i ustawienia przetrwają każdą aktualizację.

## Co to robi

- **Kalendarz RL <-> IG** — przelicza czas rzeczywisty na czas w grze (i odwrotnie) dla dwóch domen: **Imperium** i **Ishtar**. Po jednorazowej kalibracji zapamiętuje punkt odniesienia w przeglądarce i pokazuje najbliższe wydarzenia w grze (święta, nowie, pełnie, pory roku) z datami RL i odliczaniem.
- **Denominacja** — przelicznik walut gry (12 miedzi = 1 srebro, 20 srebr = 1 złoto, 100 złotych = 1 mithryl).

## Jak wydawać nowe wersje (dla maintainera)

1. Edytuj wyłącznie `src/app.html` (i ew. `src/icons/`). **Nie edytuj** plików w rootcie — są generowane.
2. `git commit` i push na `main`.
3. `git tag v1.10.0 && git push origin v1.10.0` — GitHub Actions zbudują, zweryfikują i opublikują nową wersję automatycznie.
4. Pliki aplikacji mają hash w nazwie (`app.<hash>.html`), więc stara wersja działa offline, dopóki nowa się nie pobierze. Rollback: zakładka Actions → „Rollback PWA" → podaj tag.

Stary plik `arkadia_tools_v1_8.html` zostaje zamrożony na zawsze — istniejące zakładki nie przestaną działać.
