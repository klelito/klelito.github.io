import { test, expect } from '@playwright/test';

const EMAIL = 'kontakt@twojadomena.pl';

test('experience timeline is newest first with a localized "present"', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section#doswiadczenie');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Doświadczenie');
  await expect(section.locator('.period')).toHaveText(['2022 — obecnie', '2019 — 2022']);
  await expect(section.locator('li li').first()).toContainText('Zaprojektowałem i wdrożyłem 6 narzędzi');
  await page.goto('/en/');
  await expect(page.locator('section#doswiadczenie .period').first()).toHaveText('2022 — present');
});

test('skills, services and process steps', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section#umiejetnosci .skill-group')).toHaveCount(4);
  await expect(page.locator('section#umiejetnosci .skill-group h3').first()).toHaveText('Backend i web');
  await expect(page.locator('section#wspolpraca .service')).toHaveCount(4);
  await expect(page.locator('section#wspolpraca .service p')).toHaveText([
    'Spójne dane między ERP a halą produkcyjną.',
    'Aplikacje szyte na miarę procesu, nie odwrotnie.',
    'Skanery, etykiety, przesunięcia bez papieru.',
    'BOM, kartoteki, raporty, które się zgadzają.',
  ]);
  await expect(page.locator('section#wspolpraca .step-number')).toHaveText(['01', '02', '03']);
  await expect(page.locator('section#wspolpraca .step p')).toHaveText([
    '30 minut, bez zobowiązań',
    'Konkretny zakres i termin',
    'Iteracyjnie, z demo co tydzień',
  ]);
  await expect(page.locator('section#wspolpraca').getByRole('link', { name: 'Umów rozmowę' })).toHaveAttribute('href', '#kontakt');
});

test('copy button copies the e-mail address', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await expect(page.locator('section#kontakt').getByRole('button', { name: 'Kopiuj' })).toBeVisible();
  // Locate by attribute: the accessible name changes after the click.
  const button = page.locator('section#kontakt [data-copy-email]');
  await button.click();
  await expect(button).toHaveText('Skopiowano');
  await expect(page.locator('section#kontakt [data-copy-status]')).toHaveText('Skopiowano');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
});

test('contact works without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/');
  const contact = page.locator('section#kontakt');
  await expect(contact.locator('[data-copy-email]')).toBeHidden();
  const mail = contact.getByRole('link', { name: EMAIL });
  await expect(mail).toBeVisible();
  await expect(mail).toHaveAttribute('href', `mailto:${EMAIL}`);
  await ctx.close();
});

test('contact links: profiles and both CVs', async ({ page }) => {
  await page.goto('/en/');
  const contact = page.locator('section#kontakt');
  await expect(contact.getByRole('heading', { level: 2 })).toHaveText("Let's talk.");
  await expect(contact.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/example');
  await expect(contact.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/example');
  for (const [name, href] of [
    ['Pobierz CV (PL)', '/cv/cv-pl.pdf'],
    ['Download CV (EN)', '/cv/cv-en.pdf'],
  ]) {
    const link = contact.getByRole('link', { name });
    await expect(link).toHaveAttribute('href', href);
    expect((await page.request.get(href)).status()).toBe(200);
  }
});
