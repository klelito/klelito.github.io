import { test, expect } from '@playwright/test';
import { TEST_ORIGIN } from '../../playwright.config';
import { SITE, ui, projects, projectPath } from './content';

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
  await page.getByRole('banner').getByRole('link', { name: ui.pl['lang.switchTo'] }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await page.getByRole('banner').getByRole('link', { name: ui.en['lang.switchTo'] }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
});

test('CV pill downloads the locale CV', async ({ page }) => {
  test.skip(!SITE.cv, 'no CV configured');
  await page.goto('/en/');
  const cv = page.getByRole('banner').getByRole('link', { name: ui.en['cta.cv'] });
  await expect(cv).toHaveAttribute('href', SITE.cv!.en);
  await expect(cv).toHaveAttribute('download', '');
});

test('CV pill renders a space between its words on desktop', async ({ page }, testInfo) => {
  test.skip(!SITE.cv, 'no CV configured');
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
  await page.goto(`${TEST_ORIGIN}/`);
  await page.getByText(ui.pl.menu, { exact: true }).click();
  const contact = page.locator('details').getByRole('link', { name: ui.pl['nav.contact'] });
  await expect(contact).toBeVisible();
  await expect(contact).toHaveAttribute('href', '/#kontakt');
  await ctx.close();
});

test('skip link targets main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: ui.pl.skip });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#main');
  await expect(page.locator('main#main')).toHaveCount(1);
});

test('footer shows owner and build note', async ({ page }) => {
  await page.goto('/en/');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText(SITE.name);
  await expect(footer).toContainText(ui.en['footer.built']);
});

for (const width of [768, 820, 900, 1024, 1280]) {
  test(`nav pill fits the screen at ${width}px`, async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'viewport set explicitly');
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    for (const path of ['/', '/en/']) {
      await page.goto(`${TEST_ORIGIN}${path}`);
      const box = (await page.locator('.nav-pill').boundingBox())!;
      expect(box.x, `${path} left edge`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, `${path} right edge`).toBeLessThanOrEqual(width);
    }
    await ctx.close();
  });
}

test('mobile menu closes after choosing a section and on Escape', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(`${TEST_ORIGIN}/`);
  const menu = page.locator('details.nav-menu');
  const summary = menu.locator('summary');

  await summary.click();
  await expect(menu).toHaveJSProperty('open', true);
  await menu.getByRole('link', { name: ui.pl['nav.contact'] }).click();
  await expect(page).toHaveURL(/#kontakt$/);
  await expect(menu).toHaveJSProperty('open', false);
  await expect(page.locator('#kontakt-title')).toBeInViewport();

  await summary.click();
  await expect(menu).toHaveJSProperty('open', true);
  await page.keyboard.press('Escape');
  await expect(menu).toHaveJSProperty('open', false);
  await expect(summary).toBeFocused();
  await ctx.close();
});

test('no CV download anywhere when the site has no CV (SITE.cv = null)', async ({ page }) => {
  test.skip(SITE.cv !== null, 'a CV is configured');
  for (const path of ['/', '/en/', '/projekty/', projectPath('pl', projects('pl')[0].slug)]) {
    await page.goto(path);
    await expect(page.locator('a[href$=".pdf"]'), path).toHaveCount(0);
    await expect(page.getByRole('link', { name: ui.pl['cta.cv'] }), path).toHaveCount(0);
    await expect(page.locator('.cv-pill'), path).toHaveCount(0);
  }
});
