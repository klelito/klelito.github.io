# Portfolio — specyfikacja projektu

Data: 2026-10-30 · Status: do akceptacji

## 1. Cel i odbiorcy

Strona-portfolio, która w równym stopniu ma pomóc **znaleźć pracę** i **zdobywać zlecenia**, a przy okazji budować markę zawodową.

| Odbiorca | Pytanie, na które strona odpowiada w 30 s | Główne wezwanie do działania |
|---|---|---|
| Rekruter / tech lead | Kim jest, jaki stack, jaki poziom, co dowiózł? | **Pobierz CV** |
| Klient (firma produkcyjna) | Czy rozwiązuje problemy takie jak moje, z mierzalnym efektem? Jak zacząć? | **Porozmawiajmy o projekcie** |

Kryteria sukcesu:
- Oba wezwania do działania widoczne na pierwszym ekranie (desktop i mobile).
- Każdy projekt pokazuje co najmniej jeden konkretny, liczbowy efekt.
- Lighthouse (mobile) ≥ 95 w kategoriach Performance, Accessibility, Best Practices, SEO.
- Żadna informacja poufna pracodawcy nie trafia do publicznego repozytorium.

## 2. Zakres

**W wersji 1:**
- Strona główna, lista projektów, podstrona case study, strona 404 — w wersjach **PL (domyślna) i EN**.
- CV jako **statyczne pliki PDF** (PL i EN) dostarczane przez właściciela.
- Automatyczna publikacja na GitHub Pages po każdym pushu do `main`.

**Poza wersją 1 (świadomie):** blog/notatki (architektura musi pozwolić dodać go jako nową kolekcję treści bez przebudowy), formularz kontaktowy, analityka, własna domena, generowanie CV ze strony, interaktywny skrót ⌘K, jasny motyw.

## 3. Struktura stron

| Strona | PL | EN |
|---|---|---|
| Strona główna | `/` | `/en/` |
| Lista projektów | `/projekty/` | `/en/projects/` |
| Case study | `/projekty/<slug>/` | `/en/projects/<slug>/` |
| 404 | `/404.html` (dwujęzyczna) | — |

Slug projektu = nazwa pliku treści, **wspólna dla obu języków** (np. `bom-converter`).

### 3.1 Strona główna — sekcje w kolejności

1. **Nawigacja** — pływająca „pigułka”: imię, linki do sekcji (Projekty, Doświadczenie, Umiejętności, Współpraca, Kontakt), przełącznik PL/EN, mały przycisk „Pobierz CV”. Na mobile: kompaktowy pasek + menu rozwijane.
2. **Hero** — chip dostępności („Otwarty na nową pracę i zlecenia”), nagłówek z jednym słowem w ciepłym gradiencie, podtytuł, przyciski „Pobierz CV” (klawiszowy) i „Porozmawiajmy o projekcie” (ghost). Pod spodem **paleta poleceń** wypisująca wyróżnione case studies jako komendy (`open <slug>` + skrót ⌘1…⌘4); każdy wiersz to zwykły link do case study, a skróty klawiszowe w v1 są tylko wizualne.

Każdy przycisk „Pobierz CV” pobiera CV w bieżącym języku strony; „Porozmawiajmy o projekcie” i „Umów rozmowę” przewijają do sekcji Kontakt.
3. **Pasek metryk** — 4 liczby z podpisami.
4. **Wybrane projekty** — siatka 2×2 kart wyróżnionych projektów + link „Zobacz wszystkie projekty”.
5. **Doświadczenie** — oś czasu.
6. **Umiejętności** — 4 grupy z tagami technologii.
7. **Współpraca** — 4 rodzaje usług, 3 kroki współpracy, przycisk „Umów rozmowę” (prowadzi do sekcji Kontakt).
8. **Kontakt** — e-mail z przyciskiem „Kopiuj”, LinkedIn, GitHub, przyciski CV (PL/EN).
9. **Stopka** — copyright, „Zbudowane w Astro · Hostowane na GitHub Pages”, przełącznik PL/EN.

### 3.2 Case study

Nagłówek (breadcrumb, chip typu projektu, tytuł, lead, wiersz meta: rola / czas / stack) → 1–3 kafelki efektów → treść w kolumnie ~720 px z przyklejonym spisem treści (sekcje: **Kontekst, Problem, Rozwiązanie, Efekt, Moja rola**) → opcjonalny diagram architektury → dla projektów firmowych notka o poufności → nawigacja poprzedni/następny → pasek CTA „Masz podobny problem?” → stopka.

Projekty **własne** mają dodatkowo linki do repozytorium i/lub demo.

## 4. Treść i model danych

Właściciel edytuje wyłącznie pliki treści — nigdy komponentów.

| Plik | Zawartość |
|---|---|
| `src/content/projects/{pl,en}/<slug>.md` | Case study: frontmatter + treść w Markdown (sekcje jako nagłówki `##`) |
| `src/content/experience/{pl,en}/<id>.md` | Pozycja na osi czasu |
| `src/data/skills.yaml` | Grupy umiejętności (etykiety PL/EN, ikona, lista technologii) |
| `src/data/collaboration.yaml` | Usługi i kroki współpracy (PL/EN) |
| `src/data/highlights.yaml` | 4 metryki z paska (wartość + etykieta PL/EN) |
| `src/config/site.ts` | Imię, rola, e-mail, linki LinkedIn/GitHub, ścieżki do CV |
| `src/i18n/ui.ts` | Teksty interfejsu (nawigacja, przyciski, nagłówki sekcji) |
| `public/cv/cv-pl.pdf`, `public/cv/cv-en.pdf` | CV dostarczane ręcznie |

### 4.1 Schemat projektu (frontmatter, walidowany przez Zod)

| Pole | Typ | Uwagi |
|---|---|---|
| `title` | string | |
| `summary` | string | jedno zdanie na kartę |
| `kind` | `company` \| `own` | `company` = anonimowe case study |
| `year` | number | |
| `duration` | string? | np. „4 miesiące” |
| `role` | string | |
| `stack` | string[] | min. 1 |
| `metric` | `{ value, label }` | efekt pokazywany na karcie |
| `results` | `{ value, label }[]` | 1–3, kafelki na podstronie |
| `links` | `{ repo?, demo? }` | **zabronione przy `kind: company`** (walidacja) |
| `featured` | boolean | trafia na stronę główną i do palety |
| `order` | number | kolejność |
| `diagram` | ścieżka do obrazu/SVG? | diagram architektury |

### 4.2 Schemat doświadczenia

`start` (rok), `end` (rok lub `null` = „obecnie”), `role`, `org` (dla obecnego pracodawcy opis anonimowy, np. „Firma z branży EMS”), `order`; punkty osiągnięć jako lista w treści Markdown.

### 4.3 Reguły spójności (build przerywa się, gdy są złamane)

- Każdy plik w `pl/` ma odpowiednik o tym samym slugu w `en/` i odwrotnie, z tymi samymi `kind`, `featured`, `order`.
- Liczba wyróżnionych projektów: 1–4 (paleta i siatka 2×2).
- Pliki `public/cv/cv-pl.pdf` i `public/cv/cv-en.pdf` istnieją.

## 5. Kierunek wizualny — „Aurora”

Wiążące źródła: `.superdesign/design-system.md` oraz projekty na kanwie Superdesign (projekt `d71d891e-29c3-4c7e-a0c4-b53174359c5c`): strona główna — górna część `f484d4f4-af77-4ccd-b62b-234dd365e0d4` (v2), strona główna — dolne sekcje `9fe84044-27c4-44ca-b0db-672a3b74451f`, case study „Konwerter BOM” `35e4f5ca-fa64-45d3-853e-50866f9cddf1`. Treści w tych projektach są przykładowe; wiąże wygląd, nie tekst.

Najważniejsze zasady:
- **Tylko ciemny motyw**: tło `#07080a`, tekst `#ffffff` / `#9c9c9d`, linie `rgba(255,255,255,0.08–0.12)`.
- **Zorza** (karmin `#ff2f3a` → koral `#ff6b4a` → bursztyn `#ffb347`) wyłącznie za hero; niżej tylko delikatne poświaty za nagłówkami sekcji. Nigdy fiolet/indygo.
- **Inter** dla całego interfejsu, **Geist Mono** tylko dla tagów, lat, skrótów i podpisów. Fonty hostowane lokalnie (pakiety `@fontsource`), bez zapytań do Google Fonts.
- Przyciski główne „klawiszowe” `#e6e6e6`; drugorzędne — ghost pill. Karty — ciemne szkło, promień 14 px.
- Tokeny (kolory, typografia, odstępy, cienie, promienie) jako zmienne CSS w `src/styles/tokens.css`; style komponentów w zwykłym CSS w plikach `.astro`. Bez Tailwinda.

Ruch i wydajność:
- Animacje zorzy wyłącznie na `transform` i `opacity`, gradienty radialne zamiast `filter: blur` na dużych warstwach, ziarno jako statyczne tło SVG.
- `prefers-reduced-motion: reduce` → zorza zamrożona w pełnym rozkwicie, brak migającego kursora i uniesień kart.
- Na mobile zorza ograniczona do 2 smug.

## 6. Architektura techniczna

- **Astro** (aktualna stabilna wersja), TypeScript, kolekcje treści ze schematami Zod, wbudowany routing i18n (`defaultLocale: 'pl'`, `prefixDefaultLocale: false`, `locales: ['pl','en']`).
- Strona statyczna. **JavaScript tylko tam, gdzie konieczny**, jako małe skrypty z progresywnym ulepszeniem: kopiowanie e-maila (bez JS e-mail pozostaje linkiem `mailto:`), menu mobilne, podświetlanie aktywnej pozycji spisu treści.
- Obrazy przez `astro:assets` (WebP/AVIF, właściwe rozmiary).
- SEO: `<title>`/`description` per strona i język, `hreflang` + `canonical`, `@astrojs/sitemap`, `robots.txt`, statyczne obrazy Open Graph (po jednym na język), atrybut `lang`.
- Dostępność: WCAG 2.1 AA, widoczne focusy, semantyczne nagłówki, „przeskocz do treści”, przełącznik języka z `hreflang` i czytelną etykietą.

### 6.1 Układ repozytorium

```
.github/workflows/deploy.yml
public/            cv/, favicon.svg, og-pl.png, og-en.png, robots.txt
src/
  config/site.ts
  content.config.ts
  content/projects/{pl,en}/*.md
  content/experience/{pl,en}/*.md
  data/skills.yaml, collaboration.yaml, highlights.yaml
  i18n/ui.ts, utils.ts
  styles/tokens.css, global.css
  components/      Nav, LangSwitch, Aurora, Hero, CommandPalette, MetricsStrip,
                   ProjectCard, Timeline, SkillGroup, ServiceTile, ProcessSteps,
                   ContactCard, Footer, CaseStudyHeader, ResultTiles, Toc, PrevNext, CtaBand
  layouts/         BaseLayout.astro, CaseStudyLayout.astro
  pages/           index.astro, projekty/index.astro, projekty/[slug].astro, 404.astro,
                   en/index.astro, en/projects/index.astro, en/projects/[slug].astro
scripts/           check-translations.mjs, check-confidential.mjs, check-cv.mjs
tests/             smoke.spec.ts
.superdesign/      system wizualny i referencje projektu (bez .superdesign/tmp/)
```

Strony PL i EN korzystają z tych samych komponentów; różnią się tylko przekazanym językiem.

## 7. Poufność

- Repozytorium jest **publiczne** (wymóg darmowego GitHub Pages) — cała treść jest jawna.
- Projekty firmowe: bez nazwy firmy, klientów, nazw serwerów/baz, loginów, prawdziwych zrzutów ekranu. Wizualizacje to diagramy lub makiety.
- **Strażnik poufności** (`scripts/check-confidential.mjs`): przeszukuje `src/` i `public/` (pliki tekstowe) pod kątem fraz z listy przekazanej w zmiennej środowiskowej `CONFIDENTIAL_TERMS` (w CI: sekret repozytorium; lokalnie: plik poza repozytorium). Trafienie = błąd i brak publikacji. Lista fraz nigdy nie trafia do repozytorium.
- Strażnik nie czyta PDF-ów — anonimizacja CV jest po stronie właściciela.
- Do repozytorium nie trafia nic z folderów innych projektów (w szczególności `Dane_dostępowe`).

## 8. Publikacja i jakość

Workflow GitHub Actions przy pushu do `main` (i ręcznie):
1. `npm ci`
2. `astro check` (typy + schematy treści)
3. `check-translations`, `check-cv`, `check-confidential`
4. `astro build`
5. Testy dymne Playwright na zbudowanej stronie (`astro preview`): strona główna PL i EN się renderuje; przełącznik języka prowadzi do odpowiednika; linki do CV zwracają 200; każda podstrona case study z palety istnieje; brak zepsutych linków wewnętrznych.
6. `actions/deploy-pages` — tylko gdy wszystkie kroki przeszły; w przeciwnym razie na stronie zostaje poprzednia wersja.

Lokalnie: `npm run dev` (podgląd na żywo), `npm run check` (kroki 2–3), `npm test` (krok 5). Lighthouse sprawdzany ręcznie przed startem.

Repozytorium: `<login>.github.io` → adres `https://<login>.github.io/`.

## 9. Dane wejściowe od właściciela (przed publikacją)

Szkielet strony powstanie na treściach przykładowych z projektów Superdesign; przed publikacją właściciel dostarcza:
- imię i nazwisko, rolę/nagłówek, e-mail, linki LinkedIn i GitHub, login GitHub;
- prawdziwe metryki, lata i stanowiska (wartości w projektach Superdesign są przykładowe);
- listę projektów z treścią case studies (PL i EN) — firmowe zanonimizowane, własne z linkami;
- pliki CV PDF (PL i EN);
- listę fraz poufnych do sekretu `CONFIDENTIAL_TERMS`.
