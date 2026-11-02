import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectSchema, experienceSchema, collaborationItemSchema } from '../../src/content/schemas.ts';

const companyProject = {
  title: 'Konwerter BOM',
  summary: 'Normalizuje listy materiałowe.',
  kind: 'company',
  year: 2024,
  role: 'Projekt i implementacja',
  stack: ['Python'],
  metric: { value: '−70%', label: 'czasu wyceny' },
  order: 1,
};

test('valid company project parses with defaults', () => {
  const parsed = projectSchema.parse(companyProject);
  assert.equal(parsed.featured, false);
  assert.equal(parsed.draft, false);
});

test('company project with links is rejected', () => {
  const result = projectSchema.safeParse({ ...companyProject, links: { repo: 'https://github.com/x/y' } });
  assert.equal(result.success, false);
  assert.match(JSON.stringify(result.error?.issues), /company projects must not have links/);
});

test('own project with only a demo link parses', () => {
  const result = projectSchema.safeParse({ ...companyProject, kind: 'own', links: { demo: 'https://example.com/demo' } });
  assert.equal(result.success, true);
});

test('empty stack is rejected', () => {
  assert.equal(projectSchema.safeParse({ ...companyProject, stack: [] }).success, false);
});

test('more than 3 results are rejected', () => {
  const r = { value: '1', label: 'x' };
  assert.equal(projectSchema.safeParse({ ...companyProject, results: [r, r, r, r] }).success, false);
});

test('experience accepts null end (current job)', () => {
  const parsed = experienceSchema.parse({ start: 2022, end: null, role: 'Inżynier', org: 'Firma z branży EMS', order: 1 });
  assert.equal(parsed.end, null);
});

test('bilingual text rejects stray keys (YAML commas split unquoted flow values)', () => {
  // `{ pl: Skanery, etykiety, en: ... }` parses as { pl: 'Skanery', etykiety: null, en: ... }
  const result = collaborationItemSchema.safeParse({
    id: 'automation',
    kind: 'service',
    order: 3,
    title: { pl: 'A', en: 'A' },
    text: { pl: 'Skanery', etykiety: null, en: 'Scanners' },
  });
  assert.equal(result.success, false);
});
