import { test, expect } from '@playwright/test';
import { SITE, ui, featured, highlights, projectPath, projectsPath, type Locale } from './content';

for (const locale of ['pl', 'en'] as Locale[]) {
  test(`command palette lists the featured case studies (${locale})`, async ({ page }) => {
    const expected = featured(locale);
    await page.goto(locale === 'pl' ? '/' : '/en/');
    const links = page.getByRole('navigation', { name: 'Case studies' }).getByRole('link');
    await expect(links).toHaveCount(expected.length);
    await expect(links.first()).toHaveAttribute('href', projectPath(locale, expected[0].slug));
    await expect(links.first()).toHaveAttribute('data-active', '');
    await expect(links.first()).toContainText(`open ${expected[0].slug}`);
  });

  test(`hero headline keeps spaces around the accent word (${locale})`, async ({ page }) => {
    const s = ui[locale];
    await page.goto(locale === 'pl' ? '/' : '/en/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      `${s['hero.titleBefore']} ${s['hero.titleAccent']} ${s['hero.titleAfter']}`,
    );
  });
}

test('both hero CTAs are fully visible on the first screen', async ({ page }) => {
  await page.goto('/');
  const viewport = page.viewportSize()!;
  const hero = page.locator('.hero');
  // With a CV configured: "Pobierz CV" + "Porozmawiajmy"; without (SITE.cv = null): "Porozmawiajmy" + projects list.
  const ctas = SITE.cv
    ? [hero.getByRole('link', { name: ui.pl['cta.cv'], exact: true }), hero.getByRole('link', { name: ui.pl['cta.talk'] })]
    : [hero.getByRole('link', { name: ui.pl['cta.talk'] }), hero.getByRole('link', { name: ui.pl['projects.all'] })];
  if (SITE.cv) {
    await expect(ctas[0]).toHaveAttribute('href', SITE.cv.pl);
    await expect(ctas[1]).toHaveAttribute('href', '#kontakt');
  } else {
    await expect(ctas[0]).toHaveAttribute('href', '#kontakt');
    await expect(ctas[0]).toHaveClass(/btn-key/);
    await expect(ctas[1]).toHaveAttribute('href', projectsPath('pl'));
  }
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

test('metrics strip shows the highlights', async ({ page }) => {
  const expected = highlights();
  await page.goto('/');
  await expect(page.locator('.metrics .metric-value')).toHaveText(expected.map((h) => h.value));
  await expect(page.locator('.metrics .metric-label')).toHaveText(expected.map((h) => h.label.pl));
});
