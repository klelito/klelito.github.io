import { test, expect } from '@playwright/test';

test('sitemap index and sitemap list both locales', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);
  const sitemapUrl = (await index.text()).match(/<loc>([^<]+)<\/loc>/)![1];
  const sitemap = await (await request.get(new URL(sitemapUrl).pathname)).text();
  expect(sitemap).toContain('/en/projects/bom-converter/');
  expect(sitemap).toContain('/projekty/bom-converter/');
  expect(sitemap).toContain('hreflang="pl-PL"');
  expect(sitemap).not.toContain('404');
});

test('robots.txt points at the sitemap index', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  const body = await robots.text();
  expect(body).toContain('User-agent: *');
  expect(body).toMatch(/^Sitemap: https?:\/\/.+\/sitemap-index\.xml$/m);
});

test('OG images and favicon are served', async ({ request }) => {
  for (const path of ['/og-pl.png', '/og-en.png']) {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  }
  expect((await request.get('/favicon.svg')).status()).toBe(200);
});

test('unknown route returns the bilingual 404 page', async ({ page }) => {
  const res = await page.goto('/nie-istnieje/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nie znaleziono strony');
  await expect(page.getByText('Page not found')).toBeVisible();
  await expect(page.locator('main').getByRole('link', { name: 'Wróć na stronę główną' })).toHaveAttribute('href', '/');
  await expect(page.locator('main').getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en/');
});

for (const path of ['/', '/en/', '/projekty/', '/en/projects/', '/projekty/bom-converter/', '/en/projects/skills-matrix/']) {
  test(`meta description and absolute og:image on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^\s*\S.{19,}$/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https?:\/\/[^/]+\/og-(pl|en)\.png$/);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  });
}
