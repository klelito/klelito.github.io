// Fails when any confidential term (employer name, servers, databases, logins) appears in the public repo (spec §7).
// Terms come only from the environment, never from the repository:
//   CONFIDENTIAL_TERMS="term one; term two"   or   CONFIDENTIAL_TERMS_FILE=<path outside the repo>
// Matching is done on normalized text so that anything that *renders* as a term is caught:
// line wraps, non-breaking spaces, Unicode forms (NFC/NFD), HTML/XML entities and labels split across tags.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', '.git', '.superpowers', 'test-results', 'playwright-report']);
const BINARY_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.pdf', '.woff', '.woff2', '.ttf', '.otf', '.zip']);
const MARKUP_EXTENSIONS = new Set(['.svg', '.html', '.htm', '.astro', '.xml', '.md', '.mdx']);
const FALLBACK_TARGETS = ['src', 'public', 'docs', '.superdesign', 'scripts', 'tests', '.github', 'README.md'];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Case-, whitespace- and Unicode-insensitive form used for matching. */
export function normalize(s) {
  return s.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ');
}

export function parseTerms(raw) {
  return raw
    .split(/[;\r\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Reads a terms file written by any common Windows/Unix editor (UTF-8, UTF-8 BOM, UTF-16 LE/BE BOM). */
export function readTermsFile(file) {
  const buf = fs.readFileSync(file);
  let text;
  if (buf[0] === 0xff && buf[1] === 0xfe) text = buf.subarray(2).toString('utf16le');
  else if (buf[0] === 0xfe && buf[1] === 0xff) text = Buffer.from(buf.subarray(2)).swap16().toString('utf16le');
  else if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) text = buf.subarray(3).toString('utf8');
  else text = buf.toString('utf8');
  const terms = parseTerms(text);
  if (terms.some((t) => /[\u0000�]/.test(t))) {
    throw new Error(`${file}: unexpected encoding — save it as UTF-8 (or UTF-16 with BOM)`);
  }
  return terms;
}

function isBinary(file, buf) {
  if (BINARY_EXTENSIONS.has(path.extname(file).toLowerCase())) return true;
  return buf.subarray(0, 8000).includes(0);
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

/** Index of the first line (0-based) at which `predicate(lines.slice(start, end))` holds, by binary search. */
function locateLine(lines, needle, view) {
  const contains = (from, to) => view(lines.slice(from, to).join('\n')).includes(needle);
  let lo = 0;
  let hi = lines.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (contains(0, mid + 1)) hi = mid;
    else lo = mid + 1;
  }
  const end = lo;
  let start = 0;
  let top = end;
  while (start < top) {
    const mid = (start + top + 1) >> 1;
    if (contains(mid, end + 1)) start = mid;
    else top = mid - 1;
  }
  return start + 1;
}

/**
 * Finds confidential terms in files under `targets` (files or directories).
 * Returns one hit per (file, term); `line` is 1-based, or 0 when the term is in the file path.
 */
export function findConfidential(targets, terms) {
  const needles = terms.map((term) => ({ term, text: normalize(term), path: normalize(term.replace(/[-_./\\]+/g, ' ')) }));
  const views = [
    (s) => normalize(decodeEntities(s)),
    (s) => normalize(decodeEntities(s.replace(/<[^>]*>/g, ' '))), // markup only: text with tags removed
  ];
  const hits = [];
  for (const target of targets) {
    for (const file of walk(target)) {
      const rel = normalize(file.replace(/[-_./\\]+/g, ' '));
      const buf = fs.readFileSync(file);
      const text = isBinary(file, buf) ? null : buf.toString('utf8');
      const fileViews = text === null ? [] : MARKUP_EXTENSIONS.has(path.extname(file).toLowerCase()) ? views : views.slice(0, 1);
      for (const needle of needles) {
        if (rel.includes(needle.path)) {
          hits.push({ file, line: 0, term: needle.term });
          continue;
        }
        const view = fileViews.find((v) => v(text).includes(needle.text));
        if (view) hits.push({ file, line: locateLine(text.split(/\r?\n/), needle.text, view), term: needle.term });
      }
    }
  }
  return hits;
}

/** Every file that would be published: tracked + untracked-but-not-ignored. Falls back to a directory walk without git. */
function repoFiles() {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' });
    return out.split('\0').filter((f) => f && fs.existsSync(f));
  } catch {
    return FALLBACK_TARGETS;
  }
}

function loadTerms(env) {
  if (env.CONFIDENTIAL_TERMS !== undefined) return parseTerms(env.CONFIDENTIAL_TERMS);
  if (env.CONFIDENTIAL_TERMS_FILE) return readTermsFile(env.CONFIDENTIAL_TERMS_FILE);
  return null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const requireTerms = Boolean(process.env.CI) || process.argv.includes('--require-terms');
  let terms;
  try {
    terms = loadTerms(process.env);
  } catch (e) {
    console.error(`check-confidential: ${e.message}`);
    process.exit(1);
  }
  if (terms === null) {
    if (requireTerms) {
      console.error('check-confidential: CONFIDENTIAL_TERMS is not set (or set CONFIDENTIAL_TERMS_FILE) — see README "Poufność"');
      process.exit(1);
    }
    console.warn('check-confidential: no CONFIDENTIAL_TERMS / CONFIDENTIAL_TERMS_FILE set — skipped locally');
    process.exit(0);
  }
  if (terms.length === 0) {
    console.error('check-confidential: no confidential terms parsed from the configured list');
    process.exit(1);
  }
  const files = repoFiles();
  const hits = findConfidential(files, terms);
  // Never print the term itself: CI logs of a public repository are public.
  for (const h of hits) {
    const where = h.line === 0 ? `${h.file} (file name)` : `${h.file}:${h.line}`;
    console.error(`check-confidential: ${where} contains confidential term #${terms.indexOf(h.term) + 1}`);
  }
  const scanned = files.reduce((n, f) => n + [...walk(f)].length, 0);
  console.log(`check-confidential: ${terms.length} term(s), ${scanned} files, ${hits.length} hits`);
  process.exit(hits.length ? 1 : 0);
}
