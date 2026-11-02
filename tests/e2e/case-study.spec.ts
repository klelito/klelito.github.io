import { test, expect } from '@playwright/test';

test('company case study: header, results, TOC anchors, note, no code links', async ({ page }) => {
  await page.goto('/projekty/bom-converter/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Konwerter BOM');
  await expect(page.locator('.meta-time')).toHaveText('2024 · 4 miesiące');
  await expect(page.locator('.result-tiles .result-value')).toHaveText(['−70%', '95%', '2 000+']);

  const toc = page.getByRole('navigation', { name: 'Na tej stronie' }).getByRole('link');
  await expect(toc).toHaveText(['Kontekst', 'Problem', 'Rozwiązanie', 'Efekt', 'Moja rola']);
  for (const href of await toc.evaluateAll((links) => links.map((a) => a.getAttribute('href')!))) {
    expect(href.startsWith('#')).toBe(true);
    await expect(page.locator(`[id="${decodeURIComponent(href.slice(1))}"]`)).toHaveCount(1);
  }

  await expect(page.getByText('Projekt komercyjny')).toBeVisible();
  await expect(page.locator('main a[href*="github.com"]')).toHaveCount(0);
  await expect(page.getByRole('img', { name: /Konwerter BOM/ })).toBeVisible();
});

test('own case study shows the repository link and no confidentiality note', async ({ page }) => {
  await page.goto('/projekty/skills-matrix/');
  await expect(page.locator('main').getByRole('link', { name: /Kod na GitHubie/ })).toHaveAttribute(
    'href',
    'https://github.com/example/skills-matrix',
  );
  await expect(page.getByText('Projekt komercyjny')).toHaveCount(0);
});

test('case study without optional fields renders cleanly', async ({ page }) => {
  await page.goto('/projekty/minimal-sample/');
  await expect(page.locator('body')).not.toContainText('undefined');
  await expect(page.locator('.result-tiles')).toHaveCount(0);
  await expect(page.locator('main img')).toHaveCount(0);
  await expect(page.locator('.meta-time')).toHaveText('2025');
  await expect(page.locator('main').getByRole('link', { name: /Demo/ })).toHaveAttribute('href', 'https://example.com/demo');
});

test('prev/next wrap around the project order', async ({ page }) => {
  await page.goto('/projekty/bom-converter/');
  await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', '/projekty/minimal-sample/');
  await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', '/projekty/production-platform/');
});

test('CTA band links to contact and the locale CV', async ({ page }) => {
  await page.goto('/en/projects/bom-converter/');
  const band = page.locator('.cta-band');
  await expect(band.getByRole('heading')).toHaveText('Facing a similar problem?');
  await expect(band.getByRole('link', { name: "Let's talk about your project" })).toHaveAttribute('href', '/en/#kontakt');
  await expect(band.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', '/cv/cv-en.pdf');
});

test('language switch keeps the case study', async ({ page }) => {
  await page.goto('/projekty/bom-converter/');
  await page.getByRole('banner').getByRole('link', { name: 'English version' }).click();
  await expect(page).toHaveURL(/\/en\/projects\/bom-converter\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('BOM Converter');
});
