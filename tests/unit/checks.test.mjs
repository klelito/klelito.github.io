import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkTranslations } from '../../scripts/check-translations.mjs';
import { checkCv, cvFilesFromSite } from '../../scripts/check-cv.mjs';
import { parseTerms, findConfidential, readTermsFile } from '../../scripts/check-confidential.mjs';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-checks-'));
}

function write(root, rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function project({ kind = 'company', featured = true, order = 1, draft = false } = {}) {
  return `---\ntitle: X\nkind: ${kind}\nfeatured: ${featured}\norder: ${order}\ndraft: ${draft}\n---\n\nBody\n`;
}

function contentWith(projects) {
  const root = tmpDir();
  for (const [rel, body] of Object.entries(projects)) write(root, `projects/${rel}`, body);
  write(root, 'experience/pl/current.md', '---\nstart: 2022\n---\n');
  write(root, 'experience/en/current.md', '---\nstart: 2022\n---\n');
  return root;
}

test('checkTranslations passes for a consistent pair', () => {
  const root = contentWith({ 'pl/foo.md': project(), 'en/foo.md': project() });
  assert.deepEqual(checkTranslations(root), []);
});

test('checkTranslations reports a missing translation', () => {
  const root = contentWith({ 'pl/foo.md': project() });
  const errors = checkTranslations(root);
  assert.equal(errors.length > 0, true);
  assert.match(errors.join('\n'), /en\/foo\.md/);
});

test('checkTranslations reports a kind mismatch', () => {
  const root = contentWith({ 'pl/foo.md': project({ kind: 'company' }), 'en/foo.md': project({ kind: 'own' }) });
  assert.match(checkTranslations(root).join('\n'), /kind/);
});

test('checkTranslations reports a non-ASCII slug', () => {
  const root = contentWith({ 'pl/zażółć.md': project(), 'en/zażółć.md': project() });
  assert.match(checkTranslations(root).join('\n'), /zażółć/);
});

test('checkTranslations reports more than 4 featured projects', () => {
  const files = {};
  for (let i = 1; i <= 5; i++) {
    files[`pl/p${i}.md`] = project({ order: i });
    files[`en/p${i}.md`] = project({ order: i });
  }
  assert.match(checkTranslations(contentWith(files)).join('\n'), /featured/);
});

test('checkTranslations reports zero featured projects', () => {
  const root = contentWith({ 'pl/foo.md': project({ featured: false }), 'en/foo.md': project({ featured: false }) });
  assert.match(checkTranslations(root).join('\n'), /featured/);
});

test('checkTranslations reports a missing experience translation', () => {
  const root = contentWith({ 'pl/foo.md': project(), 'en/foo.md': project() });
  write(root, 'experience/pl/previous.md', '---\nstart: 2019\n---\n');
  assert.match(checkTranslations(root).join('\n'), /en\/previous\.md/);
});

test('checkCv reports a missing CV', () => {
  const root = tmpDir();
  write(root, 'cv/cv-pl.pdf', '%PDF-1.7\n...');
  const errors = checkCv(root, ['cv/cv-pl.pdf', 'cv/cv-en.pdf']);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /cv-en\.pdf/);
});

test('checkCv reports a file that is not a PDF', () => {
  const root = tmpDir();
  write(root, 'cv/cv-pl.pdf', '%PDF-1.7\n...');
  write(root, 'cv/cv-en.pdf', 'hello');
  const errors = checkCv(root, ['cv/cv-pl.pdf', 'cv/cv-en.pdf']);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /not a PDF/);
});

test('cvFilesFromSite follows SITE.cv and is empty when CV download is disabled', () => {
  assert.deepEqual(cvFilesFromSite({ cv: null }), []);
  assert.deepEqual(cvFilesFromSite({ cv: { pl: '/cv/a.pdf', en: '/cv/b.pdf' } }), ['cv/a.pdf', 'cv/b.pdf']);
});

test('checkCv has nothing to check when no CV is configured', () => {
  assert.deepEqual(checkCv(tmpDir(), []), []);
});

test('parseTerms splits on semicolons and newlines', () => {
  assert.deepEqual(parseTerms(' Acme Corp; SRV-01\nsecret_db ;; '), ['Acme Corp', 'SRV-01', 'secret_db']);
});

test('findConfidential matches case-insensitively across file types', () => {
  const root = tmpDir();
  write(root, 'src/a.md', 'line one\nline two\nwe worked for acme corp here\n');
  write(root, 'src/logo.svg', '<svg><title>ACME CORP</title></svg>');
  write(root, 'src/data.yaml', 'alt: "Acme Corp dashboard"\n');
  write(root, 'src/node_modules/x.md', 'Acme Corp');
  write(root, 'src/clean.md', 'nothing to see');
  const hits = findConfidential([path.join(root, 'src')], ['Acme Corp']);
  const byFile = Object.fromEntries(hits.map((h) => [path.basename(h.file), h]));
  assert.deepEqual(Object.keys(byFile).sort(), ['a.md', 'data.yaml', 'logo.svg']);
  assert.equal(byFile['a.md'].line, 3);
  assert.equal(byFile['a.md'].term, 'Acme Corp');
});

test('check-confidential CLI fails in CI when no terms are configured', () => {
  const env = { ...process.env, CI: '1' };
  delete env.CONFIDENTIAL_TERMS;
  delete env.CONFIDENTIAL_TERMS_FILE;
  const res = spawnSync(process.execPath, ['scripts/check-confidential.mjs'], { env, encoding: 'utf8' });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /CONFIDENTIAL_TERMS is not set/);
});

// --- Final-review findings: terms that render on the page must be caught however the source spells them ---

function hitsIn(files, terms) {
  const root = tmpDir();
  for (const [rel, content] of Object.entries(files)) write(root, rel, content);
  return { root, hits: findConfidential([root], terms) };
}

test('findConfidential catches a term wrapped across two lines', () => {
  const { hits } = hitsIn({ 'a.md': 'intro\nPraca dla Acme\nCorp w 2024\n' }, ['Acme Corp']);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].line, 2);
});

test('findConfidential catches a term separated by a non-breaking space or &nbsp;', () => {
  const { hits } = hitsIn({ 'a.md': 'Klient: Acme\u00a0Corp\n', 'b.html': '<p>Acme&nbsp;Corp</p>\n' }, ['Acme Corp']);
  assert.deepEqual(hits.map((h) => path.basename(h.file)).sort(), ['a.md', 'b.html']);
});

test('findConfidential matches across Unicode normalization forms', () => {
  const nfd = 'Zakład Łódź'.normalize('NFD');
  const { hits } = hitsIn({ 'a.md': `Klient: ${nfd}\n` }, ['zakład łódź'.normalize('NFC')]);
  assert.equal(hits.length, 1);
});

test('findConfidential catches a label split across SVG <text> elements and XML entities', () => {
  const { hits } = hitsIn(
    {
      'split.svg': '<svg><text x="1" y="2">Acme</text><text x="1" y="3">Corp</text></svg>\n',
      'amp.svg': '<svg><text>Smith &amp; Sons</text></svg>\n',
    },
    ['Acme Corp', 'Smith & Sons'],
  );
  assert.deepEqual(hits.map((h) => `${path.basename(h.file)}:${h.term}`).sort(), ['amp.svg:Smith & Sons', 'split.svg:Acme Corp']);
});

test('findConfidential scans any text file, skips binaries, and checks file names', () => {
  const { root, hits } = hitsIn(
    {
      'public/demo/sample.csv': 'part;customer\nR1;Acme Corp\n',
      'src/scripts/x.js': 'const c = "Acme Corp";\n',
      'tests/e2e/leak.spec.ts': "expect(page).not.toContainText('Acme Corp');\n",
      'LICENSE': 'Copyright Acme Corp\n',
      'src/content/projects/pl/acme-corp-portal.md': 'clean body\n',
    },
    ['Acme Corp'],
  );
  fs.writeFileSync(path.join(root, 'public', 'img.png'), Buffer.concat([Buffer.from([0x89, 0x50, 0x00, 0x00]), Buffer.from('Acme Corp')]));
  const all = findConfidential([root], ['Acme Corp']).map((h) => path.relative(root, h.file).split(path.sep).join('/')).sort();
  assert.deepEqual(all, [
    'LICENSE',
    'public/demo/sample.csv',
    'src/content/projects/pl/acme-corp-portal.md',
    'src/scripts/x.js',
    'tests/e2e/leak.spec.ts',
  ]);
  assert.equal(hits.find((h) => h.file.endsWith('acme-corp-portal.md')).line, 0);
});

test('readTermsFile decodes UTF-16LE (PowerShell 5.1 default) and UTF-8 with BOM', () => {
  const root = tmpDir();
  const utf16 = path.join(root, 'utf16.txt');
  fs.writeFileSync(utf16, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('Konwerter BOM\r\nŁódź SA\r\n', 'utf16le')]));
  assert.deepEqual(readTermsFile(utf16), ['Konwerter BOM', 'Łódź SA']);
  const bom8 = path.join(root, 'bom8.txt');
  fs.writeFileSync(bom8, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('Acme Corp\n', 'utf8')]));
  assert.deepEqual(readTermsFile(bom8), ['Acme Corp']);
});

test('readTermsFile rejects a mis-encoded file instead of matching nothing', () => {
  const root = tmpDir();
  const file = path.join(root, 'bad.txt');
  fs.writeFileSync(file, Buffer.from('Acme Corp\n', 'utf16le')); // UTF-16 without BOM
  assert.throws(() => readTermsFile(file), /encoding/);
});

function runGuard(env, args = []) {
  const clean = { ...process.env, ...env };
  for (const k of ['CONFIDENTIAL_TERMS', 'CONFIDENTIAL_TERMS_FILE', 'CI']) if (!(k in env)) delete clean[k];
  return spawnSync(process.execPath, ['scripts/check-confidential.mjs', ...args], { env: clean, encoding: 'utf8' });
}

test('check-confidential CLI fails in CI when the term list is blank', () => {
  const res = runGuard({ CI: '1', CONFIDENTIAL_TERMS: ' ; \n ' });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /no confidential terms/i);
});

test('check-confidential CLI --require-terms fails locally without terms (pre-push hook)', () => {
  const res = runGuard({}, ['--require-terms']);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /CONFIDENTIAL_TERMS/);
});

test('check-confidential CLI prints a summary on a clean run', () => {
  const res = runGuard({ CONFIDENTIAL_TERMS: `probe-${process.pid}-never-present` });
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /1 term\(s\), \d+ files, 0 hits/);
});

test('install-hooks points git at .githooks so pre-push runs the guard', () => {
  const repo = tmpDir();
  spawnSync('git', ['init', '-q'], { cwd: repo });
  const script = path.resolve('scripts/install-hooks.mjs');
  const res = spawnSync(process.execPath, [script], { cwd: repo, encoding: 'utf8' });
  assert.equal(res.status, 0, res.stderr);
  const cfg = spawnSync('git', ['config', '--get', 'core.hooksPath'], { cwd: repo, encoding: 'utf8' });
  assert.equal(cfg.stdout.trim(), '.githooks');
  const hook = fs.readFileSync('.githooks/pre-push', 'utf8');
  assert.match(hook, /check-confidential\.mjs --require-terms/);
});

test('install-hooks is a no-op outside a git repository', () => {
  const dir = tmpDir();
  const res = spawnSync(process.execPath, [path.resolve('scripts/install-hooks.mjs')], { cwd: dir, encoding: 'utf8' });
  assert.equal(res.status, 0, res.stderr);
});
