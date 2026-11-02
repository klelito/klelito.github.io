import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitId, adjacent } from '../../src/lib/content-utils.ts';

test('splitId separates locale folder from slug', () => {
  assert.deepEqual(splitId('en/skills-matrix'), { locale: 'en', slug: 'skills-matrix' });
  assert.deepEqual(splitId('pl/bom-converter'), { locale: 'pl', slug: 'bom-converter' });
});

test('adjacent wraps around', () => {
  assert.deepEqual(adjacent(['a', 'b', 'c'], 0), { prev: 'c', next: 'b' });
  assert.deepEqual(adjacent(['a', 'b', 'c'], 2), { prev: 'b', next: 'a' });
});

test('adjacent with a single item returns the item itself', () => {
  assert.deepEqual(adjacent(['a'], 0), { prev: 'a', next: 'a' });
});
