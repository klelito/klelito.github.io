# Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bilingual (PL default / EN) static portfolio site in the "Aurora" visual style, built with Astro and deployed to GitHub Pages by GitHub Actions.

**Architecture:** Astro static site; all copy lives in content collections (Markdown + YAML, validated by Zod) and a typed UI-strings dictionary; PL and EN pages render the same components with a `locale` prop. Pure helpers (routing, content utils) and Node check scripts are unit-tested with `node --test`; pages are tested end-to-end with Playwright against `astro preview`. A single `npm run ci` runs exactly what the GitHub workflow runs before deploying.

**Tech Stack:** Astro 7.4, TypeScript 6, Zod 4 (`astro/zod`), `@astrojs/sitemap`, `@fontsource-variable/inter`, `@fontsource/geist-mono`, `yaml`, Playwright + `@axe-core/playwright`, linkinator, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-30-portfolio-design.md` · **Design:** `.superdesign/design-system.md` + Superdesign drafts listed in spec §5 (open the preview URLs `https://p.superdesign.dev/draft/<id>` while building each section).

## Prerequisites (owner, before Task 1)

- [ ] Upgrade Node: Astro 7.4.4 requires `node >= 22.23.4`; this machine has v22.11.0. Run `winget install OpenJS.NodeJS.LTS`, open a new terminal, verify `node -v` prints ≥ `v22.23.4`.

## Global Constraints

- Node ≥ 22.23.4 locally; CI uses Node 24.
- Dependency floors: `astro ^7.4.4`, `@astrojs/sitemap ^3.7.4`, `@astrojs/check ^0.9.12`, `typescript ^6.0.3` (**not 7** — `@astrojs/check` peer range is `^5 || ^6`), `@playwright/test ^1.64.1`, `@fontsource-variable/inter ^5.3.0`, `@fontsource/geist-mono ^5.3.0`, `linkinator ^8.1.0`; `yaml`, `@axe-core/playwright` latest.
- Astro 7 APIs: collections in `src/content.config.ts`; `defineCollection`, `getCollection`, `render` from `astro:content`; `glob`, `file` from `astro/loaders`; `z` from `astro/zod` (Zod 4).
- Astro 7 compiler is strict: no unclosed tags, no block elements inside `<p>`. `compressHTML` defaults to `'jsx'` — put `{" "}` between adjacent inline elements that need a space.
- i18n: `locales: ['pl','en']`, `defaultLocale: 'pl'`, `routing.prefixDefaultLocale: false`. `trailingSlash: 'always'`.
- URLs: PL `/`, `/projekty/`, `/projekty/<slug>/`; EN `/en/`, `/en/projects/`, `/en/projects/<slug>/`. Slug = file name, shared by both languages, must match `^[a-z0-9-]+$`.
- No Tailwind, no UI framework. Client JS only for: copy-email button, TOC active-item highlight. Mobile menu uses `<details>`/`<summary>` (works without JS).
- Colors only from tokens: `#07080a` canvas, `#ffffff` text, `#9c9c9d` muted, hairlines `rgba(255,255,255,0.08–0.12)`, keycap `#e6e6e6` / `#2f3031`, aurora `#ff2f3a` → `#ff6b4a` → `#ffb347`. Never purple/indigo/violet. Dark theme only (`color-scheme: dark`).
- Fonts: Inter (all UI), Geist Mono (tags, years, shortcut chips, captions only), self-hosted via fontsource — no Google Fonts requests.
- Aurora animates only `transform` and `opacity`; no `filter: blur` on large layers; frozen at full bloom under `prefers-reduced-motion: reduce`.
- `kind: company` projects never have `links`; no employer names, servers, DB names, logins anywhere in the repo. Confidential terms are passed only via env `CONFIDENTIAL_TERMS` (`;`- or newline-separated, case-insensitive).
- GitHub Actions versions: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`.
- Commit after every task with a Conventional Commit message ending with `Co-Authored-By` line per session instructions.

## Review Focus

1. **Long text at 375 px** (60-char project title, `2 000+` metric, long e-mail) — no horizontal page scroll on any route. Test owned by Task 11 (`no horizontal overflow` over all routes).
2. **JavaScript disabled** — nav (incl. mobile menu), language switch, CV download, e-mail (`mailto:`) all usable. Test owned by Task 5 and Task 9.
3. **Optional fields absent** (project without `duration`, `diagram`, `results`; own project with only `demo`) — page renders, never prints `undefined`/empty labels. Fixture + test owned by Task 8.
4. **Internal links without trailing slash** — GitHub Pages redirects/404s; every internal `href` must end with `/`, `#…`, or a file extension. Test owned by Task 11.
5. **Confidential term in an unexpected place/case** (alt text, SVG, YAML, different letter case) — guard must catch it. Test owned by Task 4.

---

### Task 1: Project scaffold and test harness

**Files:**
- Create: `package.json`, `astro.config.ts`, `tsconfig.json`, `.gitattributes`, `playwright.config.ts`, `src/config/site.ts`, `src/pages/index.astro` (temporary), `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `SITE` from `src/config/site.ts`:
  `export const SITE = { url: 'https://example.github.io', name: 'Imię Nazwisko', email: 'kontakt@twojadomena.pl', linkedin: 'https://www.linkedin.com/in/example', github: 'https://github.com/example', cv: { pl: '/cv/cv-pl.pdf', en: '/cv/cv-en.pdf' } } as const;` (values are placeholders until spec §9 inputs arrive).
- Produces npm scripts: `dev`, `build`, `preview`, `check` (`astro check && node scripts/check-translations.mjs && node scripts/check-cv.mjs && node scripts/check-confidential.mjs` — scripts added in Task 4; until then `astro check` only), `test:unit` (`node --test "tests/unit/**/*.test.*"`), `test:e2e` (`playwright test`), `test:links` (added Task 11), `ci` (`npm run check && npm run test:unit && npm run build && npm run test:e2e && npm run test:links`).

- [ ] **Step 1:** `npm init -y`, then install: `astro@^7.4.4`, dev: `@astrojs/check@^0.9.12 typescript@^6.0.3 @playwright/test@^1.64.1`; `npx playwright install chromium`. Set `"type": "module"`, `"private": true`, `"engines": { "node": ">=22.23.4" }`.
- [ ] **Step 2:** `astro.config.ts`: `site: SITE.url`, i18n block and `trailingSlash: 'always'` per Global Constraints. `tsconfig.json` extends `astro/tsconfigs/strict`, `include: [".astro/types.d.ts", "**/*"]`, `exclude: ["dist"]`; add `"allowImportingTsExtensions": true` if `astro check` rejects the `.ts`-suffixed imports used by unit tests. `.gitattributes`: `* text=auto eol=lf`.
- [ ] **Step 3:** `playwright.config.ts`: `testDir: 'tests/e2e'`, `webServer: { command: 'npm run preview -- --port 4321', url: 'http://localhost:4321/', reuseExistingServer: !process.env.CI }`, `use.baseURL: 'http://localhost:4321'`, two projects: `desktop` (Chromium 1440×900) and `mobile` (Chromium 375×812, `isMobile: true`).
- [ ] **Step 4: Write the failing test** `tests/e2e/smoke.spec.ts`

```ts
test('home responds with Polish document', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
});
```

- [ ] **Step 5:** Run `npm run build && npm run test:e2e` → FAIL (no page yet). Add a minimal `src/pages/index.astro` with `<html lang="pl">`; re-run → PASS on both projects.
- [ ] **Step 6:** Commit `chore: scaffold Astro 7 project with Playwright harness`.

### Task 2: i18n routing helpers and UI strings

**Files:**
- Create: `src/i18n/routes.ts`, `src/i18n/ui.ts`, `tests/unit/routes.test.ts`

**Interfaces:**
- Produces (`routes.ts`, no imports — must run under Node type stripping):
  `export type Locale = 'pl' | 'en'`; `export const LOCALES: readonly Locale[] = ['pl', 'en']`;
  `homePath(l: Locale): string` → `'/'` | `'/en/'`;
  `projectsPath(l: Locale): string` → `'/projekty/'` | `'/en/projects/'`;
  `projectPath(l: Locale, slug: string): string` → `'/projekty/<slug>/'` | `'/en/projects/<slug>/'`;
  `localeFromPath(path: string): Locale`;
  `switchLocalePath(path: string, to: Locale): string` — maps home ↔ home, list ↔ list, project ↔ same-slug project; any other path → `homePath(to)`; keeps a `#hash`.
- Produces (`ui.ts`): `export const ui: Record<Locale, UiStrings>`; `export function t(locale: Locale): UiStrings`. Keys and exact copy:

| key | pl | en |
|---|---|---|
| `skip` | Przejdź do treści | Skip to content |
| `menu` | Menu | Menu |
| `nav.projects` / `nav.experience` / `nav.skills` / `nav.collaboration` / `nav.contact` | Projekty / Doświadczenie / Umiejętności / Współpraca / Kontakt | Projects / Experience / Skills / Work with me / Contact |
| `lang.switchTo` (aria-label of the other-language link) | English version | Wersja polska |
| `cta.cv` / `cta.talk` / `cta.book` | Pobierz CV / Porozmawiajmy o projekcie / Umów rozmowę | Download CV / Let's talk about your project / Book a call |
| `hero.eyebrow` | Otwarty na nową pracę i zlecenia | Open to new roles and projects |
| `hero.titleBefore` / `hero.titleAccent` / `hero.titleAfter` | Automatyzuję / produkcję / i łączę systemy, które ze sobą nie rozmawiają. | I automate / manufacturing / and connect systems that don't talk to each other. |
| `hero.subtitle` | Inżynier oprogramowania w branży produkcji elektroniki. Buduję narzędzia wewnętrzne, integracje z SAP Business One i aplikacje, które skracają pracę z godzin do minut. | Software engineer in electronics manufacturing. I build internal tools, SAP Business One integrations and apps that turn hours of work into minutes. |
| `palette.query` / `palette.hint` | case study / ↑↓ nawigacja · enter otwórz · esc zamknij | case study / ↑↓ navigate · enter open · esc close |
| `projects.title` / `projects.all` / `projects.read` / `projects.code` / `projects.demo` | Wybrane projekty / Zobacz wszystkie projekty / Czytaj case study / Kod na GitHubie / Demo | Selected projects / See all projects / Read case study / Code on GitHub / Demo |
| `projects.listTitle` / `projects.listLead` | Projekty / Case studies z produkcji i projekty własne. | Projects / Case studies from manufacturing and personal projects. |
| `kind.company` / `kind.own` | Projekt firmowy · anonimizowany / Projekt własny | Client project · anonymized / Personal project |
| `experience.title` / `experience.present` | Doświadczenie / obecnie | Experience / present |
| `skills.title` | Umiejętności | Skills |
| `collab.title` / `collab.lead` | Współpraca / Pomagam firmom produkcyjnym pozbyć się Excela tam, gdzie powinien być system. | Work with me / I help manufacturers replace spreadsheets with real systems where it matters. |
| `contact.title` / `contact.reply` / `contact.copy` / `contact.copied` | Porozmawiajmy. / Odpowiadam zwykle w ciągu 24 godzin. / Kopiuj / Skopiowano | Let's talk. / I usually reply within 24 hours. / Copy / Copied |
| `contact.cvPl` / `contact.cvEn` (same in both locales) | Pobierz CV (PL) / Download CV (EN) | Pobierz CV (PL) / Download CV (EN) |
| `case.back` / `case.role` / `case.time` / `case.stack` / `case.toc` | Projekty / Rola / Czas / Stack / Na tej stronie | Projects / Role / Timeline / Stack / On this page |
| `case.confidential` | Projekt komercyjny — kod i zrzuty ekranu nie są publiczne. Chętnie opowiem o szczegółach na rozmowie. | Commercial project — code and screenshots are not public. Happy to walk you through the details in a call. |
| `case.prev` / `case.next` / `case.ctaTitle` | Poprzedni / Następny / Masz podobny problem? | Previous / Next / Facing a similar problem? |
| `footer.built` | Zbudowane w Astro · Hostowane na GitHub Pages | Built with Astro · Hosted on GitHub Pages |
| `meta.homeTitle` / `meta.homeDescription` | Imię Nazwisko — inżynier automatyzacji produkcji / (hero.subtitle) | Imię Nazwisko — manufacturing automation engineer / (hero.subtitle) |
| `notFound.title` / `notFound.back` | Nie znaleziono strony / Wróć na stronę główną | Page not found / Back to home |

- [ ] **Step 1: Write the failing tests** `tests/unit/routes.test.ts` (import from `../../src/i18n/routes.ts`)

```ts
test('paths', () => {
  assert.equal(homePath('en'), '/en/');
  assert.equal(projectsPath('pl'), '/projekty/');
  assert.equal(projectPath('en', 'bom-converter'), '/en/projects/bom-converter/');
});
test('switchLocalePath', () => {
  assert.equal(switchLocalePath('/', 'en'), '/en/');
  assert.equal(switchLocalePath('/en/', 'pl'), '/');
  assert.equal(switchLocalePath('/projekty/', 'en'), '/en/projects/');
  assert.equal(switchLocalePath('/projekty/bom-converter/', 'en'), '/en/projects/bom-converter/');
  assert.equal(switchLocalePath('/en/projects/bom-converter/', 'pl'), '/projekty/bom-converter/');
  assert.equal(switchLocalePath('/en/#kontakt', 'pl'), '/#kontakt');
  assert.equal(switchLocalePath('/404/', 'en'), '/en/');
});
test('localeFromPath', () => {
  assert.equal(localeFromPath('/en/projects/x/'), 'en');
  assert.equal(localeFromPath('/projekty/x/'), 'pl');
  assert.equal(localeFromPath('/enigma/'), 'pl');
});
```

- [ ] **Step 2:** `npm run test:unit` → FAIL (module not found).
- [ ] **Step 3:** Implement `routes.ts` and `ui.ts` (with `UiStrings` type derived from the PL object so EN must have identical keys — `astro check` enforces parity).
- [ ] **Step 4:** `npm run test:unit` → PASS; `npx astro check` → 0 errors.
- [ ] **Step 5:** Commit `feat: add i18n routes and UI strings`.

### Task 3: Content schemas and sample content

**Files:**
- Create: `src/content/schemas.ts`, `src/content.config.ts`, `src/lib/content-utils.ts`, `src/lib/content.ts`, `tests/unit/schemas.test.ts`, `tests/unit/content-utils.test.ts`
- Create content: `src/content/projects/{pl,en}/{bom-converter,production-platform,warehouse-scanner,skills-matrix}.md`, `src/content/experience/{pl,en}/{current,previous}.md`, `src/data/skills.yaml`, `src/data/collaboration.yaml`, `src/data/highlights.yaml`

**Interfaces:**
- Produces (`schemas.ts`, imports only `z` from `astro/zod`):
  `projectSchema` — `title: string`, `summary: string`, `kind: 'company'|'own'`, `year: int`, `duration?: string`, `role: string`, `stack: string[]` (min 1), `metric: {value: string, label: string}`, `results?: {value,label}[]` (1–3), `links?: {repo?: url, demo?: url}`, `featured: boolean` (default false), `order: int`, `diagram?: string`, `draft: boolean` (default false); refinement: `kind === 'company'` ⇒ `links` undefined, message `"company projects must not have links"`.
  `experienceSchema` — `start: int`, `end: int | null`, `role: string`, `org: string`, `order: int`.
  `skillGroupSchema` — `id, order: int, icon: string, label: {pl, en}, items: string[]`.
  `collaborationItemSchema` — `id, kind: 'service'|'step', order: int, title: {pl, en}, text: {pl, en}`.
  `highlightSchema` — `id, order: int, value: string, label: {pl, en}`.
- Produces collections (`content.config.ts`): `projects` (glob `**/*.md`, base `./src/content/projects`), `experience` (same pattern), `skills` / `collaboration` / `highlights` (`file('src/data/<name>.yaml')`).
- Produces (`content-utils.ts`, pure): `splitId(id: string): { locale: Locale; slug: string }` (`'pl/bom-converter'` → `{locale:'pl', slug:'bom-converter'}`); `adjacent<T>(items: T[], index: number): { prev: T; next: T }` (wraps around; for length 1 both are the item itself).
- Produces (`content.ts`, uses `astro:content`): `getProjects(locale): Promise<Project[]>` (non-draft, sorted by `order` asc), `getFeaturedProjects(locale)`, `getExperience(locale)` (sorted by `start` desc), `getSkillGroups()`, `getCollaboration()` (`{ services, steps }`, each sorted by `order`), `getHighlights()`; types `Project = CollectionEntry<'projects'> & { slug: string }`, `ExperienceItem = CollectionEntry<'experience'>`, `SkillGroup = CollectionEntry<'skills'>['data']`, `CollaborationItem = CollectionEntry<'collaboration'>['data']`, `Highlight = CollectionEntry<'highlights'>['data']`.

- [ ] **Step 1: Write the failing tests** — `schemas.test.ts`: valid company project parses; company project with `links: { repo: 'https://github.com/x/y' }` fails with message `company projects must not have links`; own project with only `demo` parses; `stack: []` fails; `results` of length 4 fails. `content-utils.test.ts`: `splitId('en/skills-matrix')` → `{locale:'en', slug:'skills-matrix'}`; `adjacent(['a','b','c'], 0)` → `{prev:'c', next:'b'}`; `adjacent(['a'], 0)` → `{prev:'a', next:'a'}`.
- [ ] **Step 2:** `npm run test:unit` → FAIL.
- [ ] **Step 3:** Implement schemas, utils, `content.config.ts`, `content.ts`.
- [ ] **Step 4:** Write sample content from the Superdesign drafts (PL text verbatim from spec-referenced drafts; EN a faithful translation). Projects: `bom-converter` (company, order 1, featured, metric `−70%` / „czasu wyceny”, results `−70%` czas przygotowania wyceny, `95%` automatycznych dopasowań MPN, `2 000+` pozycji BOM tygodniowo, body sections `## Kontekst`, `## Problem`, `## Rozwiązanie`, `## Efekt`, `## Moja rola`), `production-platform` (company, 2, `40+` użytkowników dziennie), `warehouse-scanner` (company, 3, `0` przepisywanych dokumentów), `skills-matrix` (own, 4, `1` widok zamiast 12 arkuszy, `links.repo: https://github.com/example/skills-matrix`). Experience: `current` (2022–null), `previous` (2019–2022). YAML data: 4 skill groups, 4 services + 3 steps, 4 highlights — all copy from the drafts. Add a top-of-file comment `# PRZYKŁADOWE DANE — do podmiany (spec §9)` to each YAML file.
- [ ] **Step 5:** `npm run test:unit` → PASS; `npx astro check && npm run build` → PASS.
- [ ] **Step 6:** Commit `feat: add content schemas and sample content`.

### Task 4: Consistency and confidentiality check scripts

**Files:**
- Create: `scripts/check-translations.mjs`, `scripts/check-cv.mjs`, `scripts/check-confidential.mjs`, `scripts/make-placeholder-cv.mjs`, `public/cv/cv-pl.pdf`, `public/cv/cv-en.pdf`, `tests/unit/checks.test.mjs`
- Modify: `package.json` (`check` script, add dep `yaml`)

**Interfaces:**
- Produces: each script exports a pure function and runs it when executed directly (exit 1 + one line per error on stderr):
  `checkTranslations(contentDir: string): string[]` — for `projects` and `experience`: every `pl/<slug>.md` has `en/<slug>.md` and vice versa; slugs match `^[a-z0-9-]+$`; projects pairs have equal `kind`, `featured`, `order`; number of featured, non-draft projects per locale is 1–4.
  `checkCv(publicDir: string): string[]` — `cv/cv-pl.pdf` and `cv/cv-en.pdf` exist and start with bytes `%PDF-`.
  `parseTerms(raw: string): string[]` — split on `;` and newlines, trim, drop empties.
  `findConfidential(dirs: string[], terms: string[]): { file: string; line: number; term: string }[]` — case-insensitive substring match over files with extensions `.md .mdx .yaml .yml .json .ts .mjs .astro .svg .html .txt .css .xml`, skipping `node_modules`, `dist`, `.astro`.
  CLI of `check-confidential`: scans `src`, `public`, `docs`, `.superdesign`, `README.md`; terms from `CONFIDENTIAL_TERMS`, or from the file named by `CONFIDENTIAL_TERMS_FILE`; if neither is set: when `CI` is set → error `CONFIDENTIAL_TERMS is not set`; otherwise print a warning and exit 0.

- [ ] **Step 1: Write the failing tests** `tests/unit/checks.test.mjs` using temp dirs (`fs.mkdtempSync`):
  - missing `en/foo.md` → error containing `en/foo.md`; `kind` mismatch → error containing `kind`; slug `zażółć.md` → error containing `zażółć`; 5 featured → error containing `featured`.
  - `checkCv` on dir with `cv-pl.pdf` = `%PDF-1.7…` and no `cv-en.pdf` → one error mentioning `cv-en.pdf`; a `cv-en.pdf` containing `hello` → error mentioning `not a PDF`.
  - `parseTerms(' Acme Corp; SRV-01\nsecret_db ;; ')` → `['Acme Corp','SRV-01','secret_db']`.
  - `findConfidential`: term `Acme Corp` is found in `a.md` containing `acme corp` (line 3), in `logo.svg` `<title>ACME CORP</title>`, and in `data.yaml` `alt: "Acme Corp dashboard"`; not found in `node_modules/x.md`.
  - Spawn `node scripts/check-confidential.mjs` with `CI=1` and no terms → exit code 1, stderr contains `CONFIDENTIAL_TERMS is not set`.
- [ ] **Step 2:** `npm run test:unit` → FAIL.
- [ ] **Step 3:** Implement the three scripts (frontmatter: split the first `---` block, parse with `yaml`).
- [ ] **Step 4:** `scripts/make-placeholder-cv.mjs`: launches Playwright Chromium, renders `<h1>CV — wersja robocza (PL|EN)</h1>`, writes `public/cv/cv-pl.pdf` / `cv-en.pdf` via `page.pdf()`. Run it once; commit the PDFs.
- [ ] **Step 5:** Update `check` script to the full chain; run `npm run test:unit && npm run check` → PASS (local warning about missing terms is expected).
- [ ] **Step 6:** Commit `feat: add translation, CV and confidentiality checks`.

### Task 5: Base layout, tokens, navigation and footer

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`, `src/components/LangSwitch.astro`, `src/components/Footer.astro`, `src/pages/en/index.astro` (temporary body), `tests/e2e/layout.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Locale`, `switchLocalePath`, `homePath`, `projectsPath` (Task 2); `t` (Task 2); `SITE` (Task 1).
- Produces: `BaseLayout` props `{ locale: Locale; title: string; description: string; path: string }` — renders `<html lang>`, `<meta name=description>`, `<link rel=canonical>` (absolute, `SITE.url + path`), `<link rel=alternate hreflang="pl|en|x-default">` (x-default → PL), Open Graph tags with `og:image` = `SITE.url + '/og-' + locale + '.png'`, skip link to `#main`, `<Nav>`, `<main id="main"><slot/></main>`, `<Footer>`. `Nav` props `{ locale; path }`; section links are `homePath(locale) + '#projekty' | '#doswiadczenie' | '#umiejetnosci' | '#wspolpraca' | '#kontakt'` (same anchor ids in both locales); CV pill links to `SITE.cv[locale]` with `download`. `LangSwitch` props `{ locale; path }` — segmented PL/EN, current one `aria-current="true"`, other is a link to `switchLocalePath(path, other)` with `hreflang` and `aria-label={t(locale)['lang.switchTo']}`.
- Tokens: CSS custom properties for every color/shadow/radius in Global Constraints + `--radius-card: 14px`, `--radius-key: 8px`, keycap shadow stack and hairline values from `.superdesign/design-system.md`; fonts imported from fontsource in `global.css`.

- [ ] **Step 1: Write the failing tests** `tests/e2e/layout.spec.ts`:

```ts
test('head metadata per locale', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('link[rel=alternate][hreflang=pl]')).toHaveAttribute('href', /\/$/);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/en\/$/);
});
test('language switch goes to the counterpart', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'English version' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
});
test('CV pill downloads the locale CV', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('banner').getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', '/cv/cv-en.pdf');
});
test('mobile menu works without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.getByText('Menu').click();
  await expect(page.locator('details').getByRole('link', { name: 'Kontakt' })).toBeVisible();
});
test('skip link targets main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Przejdź do treści' })).toBeFocused();
});
```

- [ ] **Step 2:** `npm run build && npm run test:e2e -- layout` → FAIL.
- [ ] **Step 3:** Implement tokens, global CSS, layout, `Nav` (floating pill per design: glyph + name left, links center, `LangSwitch` + CV pill right; below 768 px a `<details>` disclosure), `Footer` (`© {year} {SITE.name}`, `footer.built`, `LangSwitch`). Index pages use `BaseLayout` with `meta.home*` strings.
- [ ] **Step 4:** Re-run → PASS. Compare visually with draft `f484d4f4…` nav.
- [ ] **Step 5:** Commit `feat: add base layout, navigation and footer`.

### Task 6: Hero — aurora, command palette, metrics

**Files:**
- Create: `src/components/Aurora.astro`, `src/components/Hero.astro`, `src/components/CommandPalette.astro`, `src/components/MetricsStrip.astro`, `tests/e2e/hero.spec.ts`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `getFeaturedProjects`, `getHighlights` (Task 3); `projectPath` (Task 2); `t` (Task 2).
- Produces: `Hero` props `{ locale; featured: Project[]; highlights: Highlight[] }`. `CommandPalette` props `{ locale; projects: Project[] }` — `<nav aria-label="Case studies">` with one link per project: text `open <slug>`, shortcut chip `⌘<n>` (n = 1-based index, decorative `aria-hidden`), first row has `data-active`. The query line and caret are decorative (`aria-hidden`). Hero CTA „Porozmawiajmy o projekcie” → `#kontakt`.
- Aurora: 3 light-blades on desktop, 2 below 768 px (hide the third), radial gradients + static SVG grain; keyframes on `transform`/`opacity` only; `@media (prefers-reduced-motion: reduce) { animation: none }` with the 0% (full-bloom) pose as the static state.

- [ ] **Step 1: Write the failing tests** `tests/e2e/hero.spec.ts`:
  - palette has exactly as many links as featured projects (4 with sample data) and the first is `href="/projekty/bom-converter/"`; on `/en/` it is `/en/projects/bom-converter/`.
  - H1 text equals `Automatyzuję produkcję i łączę systemy, które ze sobą nie rozmawiają.` (checks `{" "}` spacing under `compressHTML: 'jsx'`).
  - both CTAs (`Pobierz CV`, `Porozmawiajmy o projekcie`) have bounding boxes fully inside the viewport on load — run in both `desktop` and `mobile` projects (spec success criterion).
  - `page.emulateMedia({ reducedMotion: 'reduce' })` → every `.aurora-blade` and the `.palette-caret` have computed `animation-name: none`.
  - metrics strip shows 4 items with values `6+`, `5`, `−70%`, `1`.
- [ ] **Step 2:** Build + run → FAIL.
- [ ] **Step 3:** Implement components to match draft `f484d4f4…` (keycap primary, ghost secondary, 64 px H1 desktop / fluid down to 40 px, gradient on `hero.titleAccent` only).
- [ ] **Step 4:** Re-run → PASS on both projects.
- [ ] **Step 5:** Commit `feat: add hero with aurora, command palette and metrics`.

### Task 7: Project cards, home section and project list pages

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/ProjectsSection.astro`, `src/pages/projekty/index.astro`, `src/pages/en/projects/index.astro`, `tests/e2e/projects.spec.ts`
- Modify: home pages

**Interfaces:**
- Consumes: `getProjects`, `getFeaturedProjects` (Task 3), `projectPath`, `projectsPath`, `t`.
- Produces: `ProjectCard` props `{ locale; project: Project }` — kind chip (`kind.company` | `kind.own`), title (h3), summary, metric (value + label), stack pills, link `projects.read` → `projectPath`, and for `own` with `links.repo` an extra `projects.code` link, with `links.demo` a `projects.demo` link. `ProjectsSection` (`id="projekty"`) props `{ locale; projects: Project[] }` — H2 `projects.title`, 2×2 grid, link `projects.all` → `projectsPath(locale)`.

- [ ] **Step 1: Write the failing tests:** home shows 4 cards in `order`; card for `bom-converter` contains `−70%` and `Projekt firmowy · anonimizowany` and no `Kod na GitHubie`; `skills-matrix` card has `Kod na GitHubie` linking to its repo; `/projekty/` lists non-draft projects by `order`, starting with `bom-converter`, `production-platform`, `warehouse-scanner`, `skills-matrix` (do not assert an exact count — Task 8 adds a fixture); `/en/projects/` has H1 `Projects`.
- [ ] **Step 2:** Build + run → FAIL.
- [ ] **Step 3:** Implement per draft `f484d4f4…` (dark-glass cards, abstract inline SVG at top of card, hover lift 2 px + warm shadow).
- [ ] **Step 4:** Re-run → PASS.
- [ ] **Step 5:** Commit `feat: add project cards and project list pages`.

### Task 8: Case study pages

**Files:**
- Create: `src/layouts/CaseStudyLayout.astro`, `src/components/CaseStudyHeader.astro`, `src/components/ResultTiles.astro`, `src/components/Toc.astro`, `src/components/PrevNext.astro`, `src/components/CtaBand.astro`, `src/scripts/toc-highlight.ts`, `src/pages/projekty/[slug].astro`, `src/pages/en/projects/[slug].astro`, `tests/e2e/case-study.spec.ts`
- Create fixture: `src/content/projects/{pl,en}/minimal-sample.md` (own, `draft: false`, `featured: false`, `order: 99`, only `links.demo`, no `duration`/`diagram`/`results`) — keep it until real content replaces samples (spec §9), then delete together with the samples.

**Interfaces:**
- Consumes: `getProjects`, `adjacent`, `splitId` (Task 3); `render` from `astro:content`; `projectPath`, `projectsPath`, `t`; `BaseLayout`.
- Produces: `getStaticPaths` per locale returning `{ params: { slug }, props: { project, prev, next } }`. `CaseStudyLayout` props `{ locale; project: Project; headings: MarkdownHeading[]; prev: Project; next: Project }` — header (breadcrumb `case.back` → `projectsPath`, kind chip, H1, summary as lead, meta row: `case.role`, `case.time` = `year` + ` · duration` only when present, `case.stack` pills), `ResultTiles` only when `results` present, 2-column body with sticky `Toc` (depth-2 headings), optional diagram (`astro:assets` `<Image>`), confidentiality note (`case.confidential`) only for `company`, `PrevNext`, `CtaBand` (`case.ctaTitle`, keycap `cta.talk` → `homePath(locale) + '#kontakt'`, ghost `cta.cv` → `SITE.cv[locale]`). `toc-highlight.ts` marks the TOC link of the section in view with `aria-current="true"` (IntersectionObserver).

- [ ] **Step 1: Write the failing tests** `tests/e2e/case-study.spec.ts`:
  - `/projekty/bom-converter/`: H1 `Konwerter BOM`; TOC has 5 links and each `href="#<id>"` resolves to an existing element (incl. heading `Rozwiązanie` with a diacritic); note `Projekt komercyjny` visible; no link to `github.com`.
  - `/projekty/skills-matrix/`: repo link present; no confidentiality note.
  - `/projekty/minimal-sample/`: page body text does not contain `undefined`; no element with class `result-tiles`; meta row shows the year without a trailing `·`; demo link present.
  - prev/next on the first project by `order` points to the last (`minimal-sample`) and to the second (`production-platform`).
  - language switch on `/projekty/bom-converter/` → `/en/projects/bom-converter/`.
- [ ] **Step 2:** Build + run → FAIL.
- [ ] **Step 3:** Implement per draft `35e4f5ca…`.
- [ ] **Step 4:** Re-run → PASS.
- [ ] **Step 5:** Commit `feat: add case study pages`.

### Task 9: Experience, skills, collaboration and contact sections

**Files:**
- Create: `src/components/Timeline.astro`, `src/components/SkillGroup.astro`, `src/components/ServiceTile.astro`, `src/components/ProcessSteps.astro`, `src/components/ContactCard.astro`, `src/scripts/copy-email.ts`, `tests/e2e/sections.spec.ts`
- Modify: home pages (section order per spec §3.1)

**Interfaces:**
- Consumes: `getExperience`, `getSkillGroups`, `getCollaboration` (Task 3); `t`; `SITE`.
- Produces: sections with ids `doswiadczenie`, `umiejetnosci`, `wspolpraca`, `kontakt`. Timeline item period: `start — end` or `start — experience.present` when `end === null` (Geist Mono). `ContactCard`: e-mail as `<a href="mailto:…">` (always), copy button rendered with `hidden` and un-hidden by `copy-email.ts`, which writes to `navigator.clipboard` and sets the button label to `contact.copied` for 2 s; if the Clipboard API is missing or rejects, the button stays hidden and nothing else changes. CV buttons `contact.cvPl` → `SITE.cv.pl`, `contact.cvEn` → `SITE.cv.en`. `cta.book` in the collaboration section → `#kontakt`.

- [ ] **Step 1: Write the failing tests** `tests/e2e/sections.spec.ts`:
  - experience entries in order `2022 — obecnie`, `2019 — 2022`; on `/en/` first reads `2022 — present`.
  - 4 skill groups, 4 service tiles, 3 process steps with numbers `01`, `02`, `03`.
  - with `context.grantPermissions(['clipboard-read','clipboard-write'])`: clicking `Kopiuj` puts `SITE.email` on the clipboard and the button reads `Skopiowano`.
  - with JavaScript disabled: `Kopiuj` button not visible; `mailto:` link visible.
  - both CV buttons in `#kontakt` link to the two PDFs and respond 200 (`page.request.get`).
- [ ] **Step 2:** Build + run → FAIL.
- [ ] **Step 3:** Implement per draft `9fe84044…`.
- [ ] **Step 4:** Re-run → PASS.
- [ ] **Step 5:** Commit `feat: add experience, skills, collaboration and contact sections`.

### Task 10: SEO assets, sitemap and 404

**Files:**
- Create: `public/robots.txt`, `public/favicon.svg`, `scripts/og-template.html`, `scripts/make-og.mjs`, `public/og-pl.png`, `public/og-en.png`, `src/pages/404.astro`, `tests/e2e/seo.spec.ts`
- Modify: `astro.config.ts` (add `@astrojs/sitemap` with `i18n: { defaultLocale: 'pl', locales: { pl: 'pl-PL', en: 'en-US' } }`), `package.json` (`og` script)

**Interfaces:**
- Produces: `npm run og` — renders `scripts/og-template.html?lang=pl|en` (name, `hero.titleBefore/Accent/After` in the Aurora look) at 1200×630 with Playwright and writes `public/og-<locale>.png`. `404.astro` uses `BaseLayout` with `locale="pl"`, shows `notFound.title` in PL and EN with links to `/` and `/en/`. `robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: <SITE.url>/sitemap-index.xml`. `favicon.svg`: warm diamond glyph.

- [ ] **Step 1: Write the failing tests** `tests/e2e/seo.spec.ts`: `/sitemap-index.xml` → 200; the sitemap it references contains `/en/projects/bom-converter/` and `hreflang="pl-PL"`; `/robots.txt` contains `Sitemap:`; `/og-pl.png` → 200 with `content-type` `image/png`; `/nie-istnieje/` → status 404 and text `Nie znaleziono strony`; every page in `[/, /en/, /projekty/, /projekty/bom-converter/]` has a non-empty `meta[name=description]` and an absolute `og:image`.
- [ ] **Step 2:** Build + run → FAIL.
- [ ] **Step 3:** Implement; run `npm run og` once and commit the PNGs.
- [ ] **Step 4:** Re-run → PASS.
- [ ] **Step 5:** Commit `feat: add sitemap, OG images, robots and 404`.

### Task 11: Site-wide quality gates

**Files:**
- Create: `tests/e2e/site.spec.ts`, `tests/e2e/routes.ts` (exports `ALL_ROUTES: string[]` — both home pages, both list pages, every project page in both locales, built from the `src/content/projects/*/` file names)
- Modify: `package.json` (`test:links`: `linkinator http://localhost:4321/ --recurse --skip "^(?!http://localhost)"` run while `npm run preview` is up — wrap with Playwright's server or a small `scripts/run-links.mjs` that starts preview, runs linkinator, stops preview), add dev deps `@axe-core/playwright`, `linkinator@^8.1.0`

- [ ] **Step 1: Write the failing tests** `tests/e2e/site.spec.ts`, looping over `ALL_ROUTES`:
  - **no horizontal overflow** (mobile project): `document.documentElement.scrollWidth <= window.innerWidth`.
  - **trailing slashes**: every `a[href^="/"]` href matches `/(\/|#[\w-]*|\.[a-z0-9]+)$/`.
  - **axe**: `new AxeBuilder({ page }).analyze()` has zero `serious`/`critical` violations.
  - **no undefined**: body text does not contain `undefined` or `[object Object]`.
- [ ] **Step 2:** Run → expect failures to surface real issues (if all pass on first run, add a temporary 60-character project title to `production-platform` PL to confirm the overflow test can fail, then revert).
- [ ] **Step 3:** Fix every reported issue in the owning component.
- [ ] **Step 4:** `npm run ci` → PASS end to end.
- [ ] **Step 5:** Manual: Lighthouse (mobile) on `/` and `/projekty/bom-converter/` via `npm run preview` — record scores in the commit message; each category ≥ 95, otherwise fix and re-measure.
- [ ] **Step 6:** Commit `test: add site-wide overflow, link, a11y gates`.

### Task 12: GitHub Actions deploy and README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Workflow `Deploy`: triggers `push` on `main` and `workflow_dispatch`; `permissions: { contents: read, pages: write, id-token: write }`; `concurrency: { group: pages, cancel-in-progress: false }`. Job `build` (ubuntu-latest): checkout@v7 → setup-node@v7 (`node-version: 24`, `cache: npm`) → `npm ci` → `npx playwright install --with-deps chromium` → `npm run ci` with `env: { CI: true, CONFIDENTIAL_TERMS: ${{ secrets.CONFIDENTIAL_TERMS }} }` → configure-pages@v6 → upload-pages-artifact@v5 (`path: dist`). Job `deploy` (`needs: build`, `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }`): deploy-pages@v5 (`id: deployment`).
- README (Polish): how to run locally (`npm run dev`, `npm run ci`); where each piece of content lives (table from spec §4); how to replace CVs and OG images (`npm run og`); confidentiality rules (spec §7) and how to set `CONFIDENTIAL_TERMS` locally via `CONFIDENTIAL_TERMS_FILE` pointing outside the repo; the checklist of spec §9 inputs.

- [ ] **Step 1:** Write the workflow and README.
- [ ] **Step 2:** Verify locally in Git Bash with a random probe term (a fixed example term would also match this plan in `docs/`): `T="probe-$RANDOM$RANDOM"; CI=1 CONFIDENTIAL_TERMS="$T" npm run ci` → PASS; then `echo "$T" >> src/content/projects/pl/bom-converter.md; CONFIDENTIAL_TERMS="$T" npm run check` → FAIL naming that file and line; `git checkout -- src/content/projects/pl/bom-converter.md`.
- [ ] **Step 3:** Commit `ci: add GitHub Pages deploy workflow and README`.
- [ ] **Step 4 (owner, needs explicit go-ahead — publishes the site):** create public repo `<login>.github.io`; Settings → Pages → Source: GitHub Actions; Settings → Secrets → `CONFIDENTIAL_TERMS`; set `SITE.url` to `https://<login>.github.io`; `git remote add origin …`, `git push -u origin main`; confirm the `Deploy` run is green and the site opens at `https://<login>.github.io/`.
