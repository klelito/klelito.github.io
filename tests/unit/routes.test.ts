import { test } from 'node:test';
import assert from 'node:assert/strict';
import { homePath, projectsPath, projectPath, switchLocalePath, localeFromPath } from '../../src/i18n/routes.ts';

test('paths', () => {
  assert.equal(homePath('pl'), '/');
  assert.equal(homePath('en'), '/en/');
  assert.equal(projectsPath('pl'), '/projekty/');
  assert.equal(projectsPath('en'), '/en/projects/');
  assert.equal(projectPath('pl', 'bom-converter'), '/projekty/bom-converter/');
  assert.equal(projectPath('en', 'bom-converter'), '/en/projects/bom-converter/');
});

test('switchLocalePath', () => {
  assert.equal(switchLocalePath('/', 'en'), '/en/');
  assert.equal(switchLocalePath('/en/', 'pl'), '/');
  assert.equal(switchLocalePath('/projekty/', 'en'), '/en/projects/');
  assert.equal(switchLocalePath('/en/projects/', 'pl'), '/projekty/');
  assert.equal(switchLocalePath('/projekty/bom-converter/', 'en'), '/en/projects/bom-converter/');
  assert.equal(switchLocalePath('/en/projects/bom-converter/', 'pl'), '/projekty/bom-converter/');
  assert.equal(switchLocalePath('/en/#kontakt', 'pl'), '/#kontakt');
  assert.equal(switchLocalePath('/404/', 'en'), '/en/');
});

test('localeFromPath', () => {
  assert.equal(localeFromPath('/en/projects/x/'), 'en');
  assert.equal(localeFromPath('/en'), 'en');
  assert.equal(localeFromPath('/projekty/x/'), 'pl');
  assert.equal(localeFromPath('/enigma/'), 'pl');
});
