// Fails when any confidential term (employer name, servers, databases, logins) appears in the public repo (spec §7).
// Terms come only from the environment, never from the repository:
//   CONFIDENTIAL_TERMS="term one; term two"   or   CONFIDENTIAL_TERMS_FILE=<path outside the repo>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const EXTENSIONS = new Set(['.md', '.mdx', '.yaml', '.yml', '.json', '.ts', '.mjs', '.astro', '.svg', '.html', '.txt', '.css', '.xml']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro']);
const TARGETS = ['src', 'public', 'docs', '.superdesign', 'README.md'];

export function parseTerms(raw) {
  return raw
    .split(/[;\r\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function* walk(target) {
  if (!fs.existsSync(target)) return;
  if (fs.statSync(target).isFile()) {
    yield target;
    return;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(path.join(target, entry.name));
    } else {
      yield path.join(target, entry.name);
    }
  }
}

export function findConfidential(dirs, terms) {
  const needles = terms.map((term) => ({ term, lower: term.toLowerCase() }));
  const hits = [];
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      if (!EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((text, i) => {
        const lower = text.toLowerCase();
        for (const { term, lower: needle } of needles) {
          if (lower.includes(needle)) hits.push({ file, line: i + 1, term });
        }
      });
    }
  }
  return hits;
}

function loadTerms(env) {
  if (env.CONFIDENTIAL_TERMS) return parseTerms(env.CONFIDENTIAL_TERMS);
  if (env.CONFIDENTIAL_TERMS_FILE) return parseTerms(fs.readFileSync(env.CONFIDENTIAL_TERMS_FILE, 'utf8'));
  return null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const terms = loadTerms(process.env);
  if (!terms) {
    if (process.env.CI) {
      console.error('check-confidential: CONFIDENTIAL_TERMS is not set');
      process.exit(1);
    }
    console.warn('check-confidential: no CONFIDENTIAL_TERMS / CONFIDENTIAL_TERMS_FILE set — skipped locally');
    process.exit(0);
  }
  const hits = findConfidential(TARGETS, terms);
  // Never print the term itself: CI logs of a public repository are public.
  for (const h of hits) console.error(`check-confidential: ${h.file}:${h.line} contains confidential term #${terms.indexOf(h.term) + 1}`);
  process.exit(hits.length ? 1 : 0);
}
