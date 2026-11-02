import { test, expect } from '@playwright/test';
import { SITE, ui, projects, projectPath, homePath, caseTime } from './content';

const s = ui.pl;

test('company case study: header, results, TOC anchors, note, no code links', async ({ page }) => {
  const project = projects('pl').find((p) => p.kind === 'company');
  test.skip(!project, 'no company project in the content');
  await page.goto(projectPath('pl', project!.slug));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(project!.title);
  await expect(page.locator('.meta-time')).toHaveText(caseTime(project!));
  if (project!.results) await expect(page.locator('.result-tiles .result-value')).toHaveText(project!.results.map((r) => r.value));

  const toc = page.getByRole('navigation', { name: s['case.toc'] }).getByRole('link');
  await expect(toc).toHaveText(project!.headings);
  for (const href of await toc.evaluateAll((links) => links.map((a) => a.getAttribute('href')!))) {
    expect(href.startsWith('#')).toBe(true);
    await expect(page.locator(`[id="${decodeURIComponent(href.slice(1))}"]`)).toHaveCount(1);
  }

  await expect(page.getByText(s['case.confidential'])).toBeVisible();
  await expect(page.locator('main a[href*="github.com"]')).toHaveCount(0);
  if (project!.diagram) await expect(page.getByRole('img', { name: new RegExp(project!.title) })).toBeVisible();
});

test('TOC headings with Polish diacritics resolve to anchors', async ({ page }) => {
  const project = projects('pl').find((p) => p.headings.some((h) => /[ąćęłńóśźż]/i.test(h)));
  test.skip(!project, 'no heading with diacritics in the content');
  await page.goto(projectPath('pl', project!.slug));
  const heading = project!.headings.find((h) => /[ąćęłńóśźż]/i.test(h))!;
  const href = await page.getByRole('navigation', { name: s['case.toc'] }).getByRole('link', { name: heading }).getAttribute('href');
  await expect(page.locator(`[id="${decodeURIComponent(href!.slice(1))}"]`)).toHaveText(heading);
});

test('own case study shows the repository link and no confidentiality note', async ({ page }) => {
  const project = projects('pl').find((p) => p.kind === 'own' && p.links?.repo);
  test.skip(!project, 'no own project with a repository in the content');
  await page.goto(projectPath('pl', project!.slug));
  await expect(page.locator('main').getByRole('link', { name: new RegExp(s['projects.code']) })).toHaveAttribute('href', project!.links!.repo!);
  await expect(page.getByText(s['case.confidential'])).toHaveCount(0);
});

test('case study without optional fields renders cleanly', async ({ page }) => {
  // Review Focus #3. Covered by src/content/projects/*/minimal-sample.md until real content replaces the samples.
  const project = projects('pl').find((p) => !p.duration && !p.results && !p.diagram);
  test.skip(!project, 'no project without duration/results/diagram in the content');
  await page.goto(projectPath('pl', project!.slug));
  await expect(page.locator('body')).not.toContainText('undefined');
  await expect(page.locator('.result-tiles')).toHaveCount(0);
  await expect(page.locator('main img')).toHaveCount(0);
  await expect(page.locator('.meta-time')).toHaveText(String(project!.year));
  if (project!.links?.demo) {
    await expect(page.locator('main').getByRole('link', { name: new RegExp(s['projects.demo']) })).toHaveAttribute('href', project!.links.demo);
  }
});

test('prev/next wrap around the project order', async ({ page }) => {
  const list = projects('pl');
  test.skip(list.length < 2, 'needs at least two projects');
  await page.goto(projectPath('pl', list[0].slug));
  await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', projectPath('pl', list[list.length - 1].slug));
  await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', projectPath('pl', list[1].slug));
});

test('CTA band links to contact and the locale CV', async ({ page }) => {
  const en = ui.en;
  await page.goto(projectPath('en', projects('en')[0].slug));
  const band = page.locator('.cta-band');
  await expect(band.getByRole('heading')).toHaveText(en['case.ctaTitle']);
  await expect(band.getByRole('link', { name: en['cta.talk'] })).toHaveAttribute('href', `${homePath('en')}#kontakt`);
  await expect(band.getByRole('link', { name: en['cta.cv'] })).toHaveAttribute('href', SITE.cv.en);
});

test('language switch keeps the case study', async ({ page }) => {
  const project = projects('pl')[0];
  const counterpart = projects('en').find((p) => p.slug === project.slug)!;
  await page.goto(projectPath('pl', project.slug));
  await page.getByRole('banner').getByRole('link', { name: s['lang.switchTo'] }).click();
  await expect(page).toHaveURL(new RegExp(`${projectPath('en', project.slug)}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(counterpart.title);
});
