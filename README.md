# Portfolio

Dwujęzyczne (PL/EN) portfolio w stylu „Aurora”: statyczna strona w [Astro](https://astro.build), publikowana na GitHub Pages przez GitHub Actions.

- Specyfikacja: [docs/superpowers/specs/2026-10-30-portfolio-design.md](docs/superpowers/specs/2026-10-30-portfolio-design.md)
- System wizualny: [.superdesign/design-system.md](.superdesign/design-system.md)

## Uruchomienie lokalne

Wymagany Node.js **≥ 22.23.4** (wymóg Astro 7).

```bash
npm install
npx playwright install chromium
npm run dev        # podgląd na żywo: http://localhost:4321
```

| Polecenie | Co robi |
|---|---|
| `npm run dev` | serwer deweloperski z podglądem na żywo |
| `npm run build` | buduje stronę do `dist/` |
| `npm run check` | typy i schematy treści, zgodność PL/EN, pliki CV, strażnik poufności |
| `npm run test:unit` | testy jednostkowe (routing, schematy, skrypty kontrolne) |
| `npm run test:e2e` | testy Playwright na zbudowanej stronie (wymaga wcześniejszego `build`) |
| `npm run ci` | wszystko powyżej w tej samej kolejności co GitHub Actions |
| `npm run og` | generuje obrazy podglądu linków `public/og-pl.png` i `public/og-en.png` |

## Gdzie edytować treść

Zmieniasz wyłącznie te pliki — nigdy komponentów.

| Plik | Zawartość |
|---|---|
| `src/config/site.ts` | imię, e-mail, LinkedIn, GitHub, adres strony (`url`), CV (`cv: null` = bez pobierania CV) |
| `src/content/projects/pl/<slug>.md` + `en/<slug>.md` | case studies (frontmatter + treść z nagłówkami `##`) |
| `src/content/experience/pl/*.md` + `en/*.md` | oś czasu doświadczenia |
| `src/data/skills.yaml` | grupy umiejętności |
| `src/data/collaboration.yaml` | usługi i kroki współpracy |
| `src/data/highlights.yaml` | 4 liczby w pasku pod hero |
| `src/i18n/ui.ts` | teksty interfejsu (nagłówek, przyciski, nagłówki sekcji) |
| `public/diagrams/<slug>.<pl\|en>.svg` | opcjonalne diagramy case studies (`diagram:` we frontmatterze) |

Zasady, których pilnuje build (złamanie = błąd):

- każdy projekt i każda pozycja doświadczenia istnieje w **obu** językach, pod tą samą nazwą pliku (slug: małe litery, cyfry, myślniki);
- `kind`, `featured` i `order` projektu są takie same w PL i EN; wyróżnionych projektów jest 1–4;
- projekt `kind: company` **nie może** mieć `links` (kod firmowy nie jest publiczny);
- w YAML wartości z przecinkiem wewnątrz `{ … }` muszą być w cudzysłowie: `{ pl: "A, B", en: "A, B" }`.

### Pola case study

`title`, `summary` (jedno zdanie), `kind` (`company` | `own`), `year`, `duration` (opcjonalnie), `role`, `stack` (lista), `metric` (`{ value, label }` — efekt na karcie), `results` (1–3 kafelki, opcjonalnie), `links` (`repo`/`demo`, tylko `own`), `featured`, `order`, `diagram` (opcjonalnie), `draft`.

### CV i obrazy podglądu

- CV do pobrania jest **wyłączone** (`cv: null` w `src/config/site.ts`), więc strona nie pokazuje żadnego przycisku CV. Aby je włączyć: wrzuć `public/cv/cv-pl.pdf` i `public/cv/cv-en.pdf` i ustaw `cv: { pl: '/cv/cv-pl.pdf', en: '/cv/cv-en.pdf' }` — `npm run check` sprawdzi, czy pliki istnieją. **Strażnik poufności nie czyta PDF-ów**: CV publikowane na stronie przejrzyj sam (telefon, nazwy firm).
- Po zmianie imienia lub nagłówka w hero uruchom `npm run og` i zacommituj nowe PNG.

## Poufność

Repozytorium jest **publiczne** (wymóg darmowego GitHub Pages), więc cała treść jest jawna.

- Projekty firmowe: bez nazwy firmy, klientów, nazw serwerów i baz, loginów, prawdziwych zrzutów ekranu — tylko opisy, diagramy i makiety.
- **Strażnik poufności** (`scripts/check-confidential.mjs`) blokuje build, gdy w którymkolwiek pliku tekstowym repozytorium (śledzonym lub nowym) albo w **nazwie pliku** pojawi się fraza z Twojej listy. Łapie to, co *wyświetli się* jako fraza: inną wielkość liter, frazę przełamaną między liniami, twardą spację, encje (`&amp;`, `&nbsp;`), etykiety SVG rozbite na kilka `<text>` i różne formy Unicode polskich znaków. W logach podaje plik, linię i **numer** frazy — nigdy samą frazę — oraz podsumowanie `N term(s), M files, K hits`.
- Lista fraz **nigdy nie trafia do repozytorium**:
  - w GitHub: *Settings → Secrets and variables → Actions → New repository secret*, nazwa `CONFIDENTIAL_TERMS`, wartość np. `Nazwa Firmy; nazwa-serwera; nazwa_bazy; login`;
  - lokalnie: zapisz frazy w pliku **poza** repozytorium (jedna na linię; UTF-8 lub UTF-16 z BOM — domyślny zapis PowerShella też działa) i ustaw zmienną na stałe, np. w PowerShellu:
    `[Environment]::SetEnvironmentVariable('CONFIDENTIAL_TERMS_FILE', 'C:\bezpieczne\terms.txt', 'User')`.
- Bez listy fraz lokalny `check` tylko ostrzega; w CI kończy się błędem. Pusta lista lub źle zakodowany plik to zawsze błąd.
- **Zalecane:** `npm run hooks:install` włącza hook `pre-push`, który uruchamia strażnika **przed** wysłaniem zmian do publicznego repozytorium (CI sprawdza dopiero po pushu, gdy treść jest już jawna w historii). Hook wymaga ustawionego `CONFIDENTIAL_TERMS_FILE`; awaryjnie `git push --no-verify`.

## Publikacja

Strona jest publikowana z repozytorium **`klelito/klelito.github.io`** pod adresem **https://klelito.github.io/** (*Settings → Pages → Source:* **GitHub Actions**). Poprzednia strona z 2023 roku jest zachowana w prywatnym repozytorium `klelito/homepage-2023-archive`.

Każdy push do `main` uruchamia przebieg **Deploy**: wszystkie kontrole i testy, potem publikacja. Jeśli którykolwiek krok zawiedzie, publikacja jest wstrzymana, a na stronie zostaje poprzednia wersja. Wymaga sekretu `CONFIDENTIAL_TERMS` (patrz „Poufność”).

## Edycja treści

Testy e2e czytają oczekiwane wartości z tych samych plików treści co strona, więc zmiana treści nie wymaga zmian w testach. Po zmianie imienia lub hasła w hero uruchom `npm run og`.
