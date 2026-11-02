import { test, expect } from '@playwright/test';

test('head metadata per locale', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('link[rel=alternate][hreflang=pl]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/$/);
  await expect(page.locator('link[rel=alternate][hreflang=x-default]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/$/);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/en\/$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https?:\/\/.+\/og-en\.png$/);
});

test('language switch goes to the counterpart', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('banner').getByRole('link', { name: 'English version' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await page.getByRole('banner').getByRole('link', { name: 'Wersja polska' }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
});

test('CV pill downloads the locale CV', async ({ page }) => {
  await page.goto('/en/');
  const cv = page.getByRole('banner').getByRole('link', { name: 'Download CV' });
  await expect(cv).toHaveAttribute('href', '/cv/cv-en.pdf');
  await expect(cv).toHaveAttribute('download', '');
});

test('CV pill renders a space between its words on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'the prefix is visually hidden on mobile');
  await page.goto('/');
  const gap = await page.locator('.cv-pill').evaluate((a) => {
    const prefixText = a.querySelector('.cv-prefix')!.firstChild as Text;
    const word = document.createRange();
    word.setStart(prefixText, 0);
    word.setEnd(prefixText, prefixText.data.trimEnd().length);
    const cv = document.createRange();
    cv.selectNodeContents(a.lastChild!);
    return cv.getBoundingClientRect().left - word.getBoundingClientRect().right;
  });
  expect(gap).toBeGreaterThan(2);
});

test('mobile menu works without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/');
  await page.getByText('Menu').click();
  const contact = page.locator('details').getByRole('link', { name: 'Kontakt' });
  await expect(contact).toBeVisible();
  await expect(contact).toHaveAttribute('href', '/#kontakt');
  await ctx.close();
});

test('skip link targets main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Przejdź do treści' });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#main');
  await expect(page.locator('main#main')).toHaveCount(1);
});

test('footer shows owner and build note', async ({ page }) => {
  await page.goto('/en/');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText('Imię Nazwisko');
  await expect(footer).toContainText('Built with Astro · Hosted on GitHub Pages');
});
