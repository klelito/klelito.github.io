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
| `src/config/site.ts` | imię, e-mail, LinkedIn, GitHub, adres strony (`url`), ścieżki do CV |
| `src/content/projects/pl/<slug>.md` + `en/<slug>.md` | case studies (frontmatter + treść z nagłówkami `##`) |
| `src/content/experience/pl/*.md` + `en/*.md` | oś czasu doświadczenia |
| `src/data/skills.yaml` | grupy umiejętności |
| `src/data/collaboration.yaml` | usługi i kroki współpracy |
| `src/data/highlights.yaml` | 4 liczby w pasku pod hero |
| `src/i18n/ui.ts` | teksty interfejsu (nagłówek, przyciski, nagłówki sekcji) |
| `public/cv/cv-pl.pdf`, `public/cv/cv-en.pdf` | CV do pobrania |
| `public/diagrams/<slug>.<pl\|en>.svg` | opcjonalne diagramy case studies (`diagram:` we frontmatterze) |

Zasady, których pilnuje build (złamanie = błąd):

- każdy projekt i każda pozycja doświadczenia istnieje w **obu** językach, pod tą samą nazwą pliku (slug: małe litery, cyfry, myślniki);
- `kind`, `featured` i `order` projektu są takie same w PL i EN; wyróżnionych projektów jest 1–4;
- projekt `kind: company` **nie może** mieć `links` (kod firmowy nie jest publiczny);
- w YAML wartości z przecinkiem wewnątrz `{ … }` muszą być w cudzysłowie: `{ pl: "A, B", en: "A, B" }`.

### Pola case study

`title`, `summary` (jedno zdanie), `kind` (`company` | `own`), `year`, `duration` (opcjonalnie), `role`, `stack` (lista), `metric` (`{ value, label }` — efekt na karcie), `results` (1–3 kafelki, opcjonalnie), `links` (`repo`/`demo`, tylko `own`), `featured`, `order`, `diagram` (opcjonalnie), `draft`.

### CV i obrazy podglądu

- CV: podmień `public/cv/cv-pl.pdf` i `public/cv/cv-en.pdf` (nazwy bez zmian). **Strażnik poufności nie czyta PDF-ów** — anonimizacja CV jest po Twojej stronie.
- Po zmianie imienia lub nagłówka w hero uruchom `npm run og` i zacommituj nowe PNG.

## Poufność

Repozytorium jest **publiczne** (wymóg darmowego GitHub Pages), więc cała treść jest jawna.

- Projekty firmowe: bez nazwy firmy, klientów, nazw serwerów i baz, loginów, prawdziwych zrzutów ekranu — tylko opisy, diagramy i makiety.
- **Strażnik poufności** (`scripts/check-confidential.mjs`) blokuje build, gdy w `src/`, `public/`, `docs/`, `.superdesign/` lub `README.md` pojawi się fraza z Twojej listy (wielkość liter bez znaczenia). W logach podaje plik, linię i **numer** frazy — nigdy samą frazę.
- Lista fraz **nigdy nie trafia do repozytorium**:
  - w GitHub: *Settings → Secrets and variables → Actions → New repository secret*, nazwa `CONFIDENTIAL_TERMS`, wartość np. `Nazwa Firmy; nazwa-serwera; nazwa_bazy; login`;
  - lokalnie: zapisz frazy w pliku **poza** repozytorium (jedna na linię) i uruchamiaj
    `CONFIDENTIAL_TERMS_FILE=/sciezka/poza/repo/terms.txt npm run check`.
- Bez listy fraz lokalny `check` tylko ostrzega; w CI kończy się błędem.

## Publikacja (jednorazowa konfiguracja)

1. Utwórz **publiczne** repozytorium o nazwie `<login>.github.io`.
2. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
3. Dodaj sekret `CONFIDENTIAL_TERMS` (patrz wyżej).
4. W `src/config/site.ts` ustaw `url: 'https://<login>.github.io'`.
5. `git remote add origin https://github.com/<login>/<login>.github.io.git` i `git push -u origin main`.
6. Sprawdź zakładkę *Actions* — przebieg **Deploy** musi być zielony; strona: `https://<login>.github.io/`.

Każdy kolejny push do `main` publikuje stronę automatycznie. Jeśli którykolwiek krok kontroli zawiedzie, publikacja jest wstrzymana, a na stronie zostaje poprzednia wersja.

## Przed publikacją — do uzupełnienia

Strona startuje na **przykładowych** danych z projektów Superdesign. Przed pierwszą publikacją:

- [ ] imię i nazwisko, rola, e-mail, LinkedIn, GitHub, login GitHub (`src/config/site.ts`, `meta.homeTitle` w `src/i18n/ui.ts`)
- [ ] prawdziwe metryki, lata i stanowiska (`highlights.yaml`, `experience/`, `projects/`)
- [ ] własne case studies PL + EN; usuń przykładowe projekty łącznie z `minimal-sample.md` (to fixture testowy)
- [ ] CV PDF w obu językach
- [ ] lista fraz poufnych w sekrecie `CONFIDENTIAL_TERMS`
- [ ] `npm run og` po zmianie imienia

Testy e2e odwołują się do przykładowych treści (np. „Konwerter BOM”) — przy podmianie treści zaktualizuj je razem z danymi.
