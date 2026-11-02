import { test, expect } from '@playwright/test';
import { ui, featured, projects, projectPath, projectsPath } from './content';

const s = ui.pl;

test('home shows the featured projects in order', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section#projekty');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(s['projects.title']);
  await expect(section.locator('article h3')).toHaveText(featured('pl').map((p) => p.title));
  await expect(section.getByRole('link', { name: s['projects.all'] })).toHaveAttribute('href', projectsPath('pl'));
});

test('company project card shows metric and kind, never a code link', async ({ page }) => {
  const project = featured('pl').find((p) => p.kind === 'company');
  test.skip(!project, 'no featured company project in the content');
  await page.goto('/');
  const card = page.locator('section#projekty article').filter({ has: page.getByRole('heading', { name: project!.title, exact: true }) });
  await expect(card).toContainText(project!.metric.value);
  await expect(card).toContainText(project!.metric.label);
  await expect(card).toContainText(s['kind.company']);
  await expect(card.getByRole('link', { name: new RegExp(s['projects.code']) })).toHaveCount(0);
  await expect(card.getByRole('link', { name: new RegExp(s['projects.read']) })).toHaveAttribute('href', projectPath('pl', project!.slug));
});

test('own project card links to its repository', async ({ page }) => {
  const project = featured('pl').find((p) => p.kind === 'own' && p.links?.repo);
  test.skip(!project, 'no featured own project with a repository in the content');
  await page.goto('/');
  const card = page.locator('section#projekty article').filter({ has: page.getByRole('heading', { name: project!.title, exact: true }) });
  await expect(card).toContainText(s['kind.own']);
  await expect(card.getByRole('link', { name: new RegExp(s['projects.code']) })).toHaveAttribute('href', project!.links!.repo!);
});

test('card links have distinct accessible names', async ({ page }) => {
  await page.goto('/');
  const names = await page
    .locator('section#projekty')
    .getByRole('link', { name: new RegExp(s['projects.read']) })
    .evaluateAll((links) => links.map((a) => a.textContent?.replace(/\s+/g, ' ').trim()));
  expect(names).toHaveLength(featured('pl').length);
  expect(new Set(names).size).toBe(names.length);
});

test('PL project list shows every published project in order', async ({ page }) => {
  await page.goto(projectsPath('pl'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(s['projects.listTitle']);
  await expect(page.locator('main article h3')).toHaveText(projects('pl').map((p) => p.title));
});

test('EN project list links to EN case studies', async ({ page }) => {
  await page.goto(projectsPath('en'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(ui.en['projects.listTitle']);
  await expect(page.locator('main article').first().getByRole('link', { name: new RegExp(ui.en['projects.read']) })).toHaveAttribute(
    'href',
    projectPath('en', projects('en')[0].slug),
  );
});
