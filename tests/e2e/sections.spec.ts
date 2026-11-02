import { test, expect } from '@playwright/test';
import { SITE, ui, experience, skills, collaboration } from './content';

const s = ui.pl;
const period = (e: { start: number; end: number | null }, present: string) => `${e.start} — ${e.end ?? present}`;

test('experience timeline is newest first with a localized "present"', async ({ page }) => {
  const pl = experience('pl');
  await page.goto('/');
  const section = page.locator('section#doswiadczenie');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(s['experience.title']);
  await expect(section.locator('.period')).toHaveText(pl.map((e) => period(e, s['experience.present'])));
  if (pl[0].bullets.length) await expect(section.locator('li li').first()).toHaveText(pl[0].bullets[0]);
  await page.goto('/en/');
  await expect(page.locator('section#doswiadczenie .period').first()).toHaveText(period(experience('en')[0], ui.en['experience.present']));
});

test('skills, services and process steps', async ({ page }) => {
  const groups = skills();
  const { services, steps } = collaboration();
  await page.goto('/');
  await expect(page.locator('section#umiejetnosci .skill-group h3')).toHaveText(groups.map((g) => g.label.pl));
  await expect(page.locator('section#wspolpraca .service p')).toHaveText(services.map((i) => i.text.pl));
  await expect(page.locator('section#wspolpraca .step-number')).toHaveText(steps.map((_, i) => String(i + 1).padStart(2, '0')));
  await expect(page.locator('section#wspolpraca .step p')).toHaveText(steps.map((i) => i.text.pl));
  await expect(page.locator('section#wspolpraca').getByRole('link', { name: s['cta.book'] })).toHaveAttribute('href', '#kontakt');
});

test('copy button copies the e-mail address', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await expect(page.locator('section#kontakt').getByRole('button', { name: s['contact.copy'] })).toBeVisible();
  // Locate by attribute: the accessible name changes after the click.
  const button = page.locator('section#kontakt [data-copy-email]');
  await button.click();
  await expect(button).toHaveText(s['contact.copied']);
  await expect(page.locator('section#kontakt [data-copy-status]')).toHaveText(s['contact.copied']);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(SITE.email);
});

test('contact works without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/');
  const contact = page.locator('section#kontakt');
  await expect(contact.locator('[data-copy-email]')).toBeHidden();
  const mail = contact.getByRole('link', { name: SITE.email });
  await expect(mail).toBeVisible();
  await expect(mail).toHaveAttribute('href', `mailto:${SITE.email}`);
  await ctx.close();
});

test('contact links: profiles and both CVs', async ({ page }) => {
  const en = ui.en;
  await page.goto('/en/');
  const contact = page.locator('section#kontakt');
  await expect(contact.getByRole('heading', { level: 2 })).toHaveText(en['contact.title']);
  await expect(contact.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', SITE.linkedin);
  await expect(contact.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', SITE.github);
  if (!SITE.cv) {
    await expect(contact.getByRole('link', { name: en['contact.cvPl'] })).toHaveCount(0);
    await expect(contact.getByRole('link', { name: en['contact.cvEn'] })).toHaveCount(0);
    return;
  }
  for (const [name, href] of [
    [en['contact.cvPl'], SITE.cv.pl],
    [en['contact.cvEn'], SITE.cv.en],
  ]) {
    const link = contact.getByRole('link', { name });
    await expect(link).toHaveAttribute('href', href);
    expect((await page.request.get(href)).status()).toBe(200);
  }
});
