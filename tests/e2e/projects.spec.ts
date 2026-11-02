import { test, expect } from '@playwright/test';

const SAMPLE_TITLES_PL = ['Konwerter BOM', 'Platforma zespołu produkcji', 'Skaner przesunięć magazynowych', 'Macierz kompetencji'];

test('home shows the featured projects in order', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section#projekty');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Wybrane projekty');
  await expect(section.locator('article h3')).toHaveText(SAMPLE_TITLES_PL);
  await expect(section.getByRole('link', { name: 'Zobacz wszystkie projekty' })).toHaveAttribute('href', '/projekty/');
});

test('company project card shows metric and kind, never a code link', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('section#projekty article').filter({ hasText: 'Konwerter BOM' });
  await expect(card).toContainText('−70%');
  await expect(card).toContainText('czasu wyceny');
  await expect(card).toContainText('Projekt firmowy · anonimizowany');
  await expect(card.getByRole('link', { name: /Kod na GitHubie/ })).toHaveCount(0);
  await expect(card.getByRole('link', { name: /Czytaj case study/ })).toHaveAttribute('href', '/projekty/bom-converter/');
});

test('own project card links to its repository', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('section#projekty article').filter({ hasText: 'Macierz kompetencji' });
  await expect(card).toContainText('Projekt własny');
  await expect(card.getByRole('link', { name: /Kod na GitHubie/ })).toHaveAttribute('href', 'https://github.com/example/skills-matrix');
});

test('card links have distinct accessible names', async ({ page }) => {
  await page.goto('/');
  const names = await page
    .locator('section#projekty')
    .getByRole('link', { name: /Czytaj case study/ })
    .evaluateAll((links) => links.map((a) => a.textContent?.replace(/\s+/g, ' ').trim()));
  expect(names).toHaveLength(4);
  expect(new Set(names).size).toBe(names.length);
});

test('PL project list starts with the sample projects in order', async ({ page }) => {
  await page.goto('/projekty/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projekty');
  const titles = await page.locator('main article h3').allTextContents();
  expect(titles.slice(0, 4)).toEqual(SAMPLE_TITLES_PL);
});

test('EN project list links to EN case studies', async ({ page }) => {
  await page.goto('/en/projects/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
  await expect(page.locator('main article').first().getByRole('link', { name: /Read case study/ })).toHaveAttribute(
    'href',
    '/en/projects/bom-converter/',
  );
});
