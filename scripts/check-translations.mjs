// Fails when PL/EN content files are out of sync (spec §4.3).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import YAML from 'yaml';

const LOCALES = ['pl', 'en'];
const SLUG = /^[a-z0-9-]+$/;
const MAX_FEATURED = 4;

function frontmatter(file) {
  const match = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? (YAML.parse(match[1]) ?? {}) : {};
}

function slugsIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -'.md'.length));
}

export function checkTranslations(contentDir) {
  const errors = [];

  for (const collection of ['projects', 'experience', 'education']) {
    const slugs = Object.fromEntries(LOCALES.map((l) => [l, slugsIn(path.join(contentDir, collection, l))]));

    for (const locale of LOCALES) {
      const other = LOCALES.find((l) => l !== locale);
      for (const slug of slugs[locale]) {
        if (!SLUG.test(slug)) {
          errors.push(`${collection}/${locale}/${slug}.md: slug "${slug}" must match ${SLUG}`);
        }
        if (!slugs[other].includes(slug)) {
          errors.push(`${collection}/${other}/${slug}.md is missing (translation of ${collection}/${locale}/${slug}.md)`);
        }
      }
    }

    if (collection !== 'projects') continue;

    for (const slug of slugs.pl.filter((s) => slugs.en.includes(s))) {
      const pl = frontmatter(path.join(contentDir, collection, 'pl', `${slug}.md`));
      const en = frontmatter(path.join(contentDir, collection, 'en', `${slug}.md`));
      for (const field of ['kind', 'featured', 'order']) {
        if (pl[field] !== en[field]) {
          errors.push(`projects/{pl,en}/${slug}.md: "${field}" differs (${pl[field]} vs ${en[field]})`);
        }
      }
    }

    for (const locale of LOCALES) {
      const featured = slugs[locale].filter((slug) => {
        const data = frontmatter(path.join(contentDir, collection, locale, `${slug}.md`));
        return data.featured === true && data.draft !== true;
      }).length;
      if (featured < 1 || featured > MAX_FEATURED) {
        errors.push(`projects/${locale}: ${featured} featured projects (allowed 1–${MAX_FEATURED})`);
      }
    }
  }

  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = checkTranslations('src/content');
  for (const e of errors) console.error(`check-translations: ${e}`);
  process.exit(errors.length ? 1 : 0);
}
