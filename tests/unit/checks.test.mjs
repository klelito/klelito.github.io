import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkTranslations } from '../../scripts/check-translations.mjs';
import { checkCv } from '../../scripts/check-cv.mjs';
import { parseTerms, findConfidential } from '../../scripts/check-confidential.mjs';

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
  const errors = checkCv(root);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /cv-en\.pdf/);
});

test('checkCv reports a file that is not a PDF', () => {
  const root = tmpDir();
  write(root, 'cv/cv-pl.pdf', '%PDF-1.7\n...');
  write(root, 'cv/cv-en.pdf', 'hello');
  const errors = checkCv(root);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /not a PDF/);
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
