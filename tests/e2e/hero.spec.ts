import { test, expect } from '@playwright/test';

test('command palette lists featured case studies (PL)', async ({ page }) => {
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Case studies' }).getByRole('link');
  await expect(links).toHaveCount(4);
  await expect(links.first()).toHaveAttribute('href', '/projekty/bom-converter/');
  await expect(links.first()).toHaveAttribute('data-active', '');
  await expect(links.first()).toContainText('open bom-converter');
});

test('command palette links to EN case studies on /en/', async ({ page }) => {
  await page.goto('/en/');
  const links = page.getByRole('navigation', { name: 'Case studies' }).getByRole('link');
  await expect(links).toHaveCount(4);
  await expect(links.first()).toHaveAttribute('href', '/en/projects/bom-converter/');
});

test('hero headline keeps spaces around the accent word', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Automatyzuję produkcję i łączę systemy, które ze sobą nie rozmawiają.',
  );
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    "I automate manufacturing and connect systems that don't talk to each other.",
  );
});

test('both hero CTAs are fully visible on the first screen', async ({ page }) => {
  await page.goto('/');
  const viewport = page.viewportSize()!;
  const hero = page.locator('.hero');
  const ctas = [
    hero.getByRole('link', { name: 'Pobierz CV', exact: true }),
    hero.getByRole('link', { name: 'Porozmawiajmy o projekcie' }),
  ];
  await expect(ctas[0]).toHaveAttribute('href', '/cv/cv-pl.pdf');
  await expect(ctas[1]).toHaveAttribute('href', '#kontakt');
  for (const cta of ctas) {
    const box = (await cta.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  }
});

test('reduced motion freezes the aurora and the caret', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const names = await page
    .locator('.aurora-blade, .palette-caret')
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  expect(names.length).toBeGreaterThanOrEqual(3);
  expect(new Set(names)).toEqual(new Set(['none']));
});

test('aurora animates when motion is allowed', async ({ page }) => {
  await page.goto('/');
  const names = await page
    .locator('.aurora-blade')
    .evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== 'none').map((el) => getComputedStyle(el).animationName));
  expect(names.length).toBeGreaterThanOrEqual(2);
  expect(names).not.toContain('none');
});

test('metrics strip shows the four highlights', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.metrics .metric-value')).toHaveText(['6+', '5', '−70%', '1']);
  await expect(page.locator('.metrics .metric-label').first()).toHaveText('wdrożonych narzędzi');
});
