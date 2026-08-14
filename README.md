# Arkadia Web Standalone Tools

Samowystarczalne narzędzia przeglądarkowe dla gry MUD **Arkadia** — jeden plik HTML, zero zależności, działa też na telefonie.

## Link do aplikacji (GitHub Pages)

**https://isithunzi000.github.io/arkadia-web_standalone-tools/**

`index.html` automatycznie przekierowuje na aktualną wersję aplikacji — link jest zawsze aktualny.

## Funkcje

- **Kalendarz RL <-> IG** — konwersja czasu rzeczywistego na czas w grze i odwrotnie, dla dwóch domen:
  - **Imperium** (setting Warhammera): rok 400 dni, święta interkalarne, nowie i pełnie, pory roku, Hexennacht, Geheimnisnacht.
  - **Ishtar** (setting Wiedźmina): 8 pór roku, święta magiczne i astronomiczne, pełnie, Festyn w Eysenlaan.
  - Kalibracja „czas RL <-> czas IG" zapisywana w przeglądarce; aplikacja ekstrapoluje aktualny czas IG i pokazuje najbliższe wydarzenia z datami RL i odliczaniem.
- **Denominacja** — przelicznik walut gry (12 miedzi = 1 srebro, 20 srebr = 1 złoto, 100 złotych = 1 mithryl).

## Struktura repo

| Plik | Opis |
|---|---|
| `index.html` | strona-przekierowanie na aktualną wersję aplikacji (zmień stałą `APP_FILE` przy nowej wersji) |
| `arkadia_tools_v1_8.html` | aktualna wersja aplikacji |
| `LICENSE` | MIT |

Starsze wersje plików są usuwane z repo — pełna historia pozostaje dostępna w historii commitów.

## Logika kalendarza

Przeliczniki i tablice wydarzeń są portowane 1:1 z pluginów kalendarzowych (`clock.ts`, `imperium_cal`) — przy zmianach w pluginach należy zsynchronizować odpowiednie stałe w pliku aplikacji.
