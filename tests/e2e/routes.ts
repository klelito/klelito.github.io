import fs from 'node:fs';
import path from 'node:path';

// Every page the site builds, derived from the content files (drafts excluded).
function slugs(locale: 'pl' | 'en'): string[] {
  const dir = path.join('src/content/projects', locale);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => !/^draft:\s*true\s*$/m.test(fs.readFileSync(path.join(dir, f), 'utf8')))
    .map((f) => f.slice(0, -'.md'.length));
}

export const ALL_ROUTES: string[] = [
  '/',
  '/en/',
  '/projekty/',
  '/en/projects/',
  ...slugs('pl').map((s) => `/projekty/${s}/`),
  ...slugs('en').map((s) => `/en/projects/${s}/`),
];
