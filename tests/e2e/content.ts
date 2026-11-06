// Expected values for e2e tests, read from the same content files the site renders.
// Tests assert structure against these, so the owner can edit content without touching tests (spec §4).
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export { SITE } from '../../src/config/site';
export { ui } from '../../src/i18n/ui';
export { homePath, projectsPath, projectPath } from '../../src/i18n/routes';

export type Locale = 'pl' | 'en';
type ValueLabel = { value: string; label: string };
type Bilingual = { pl: string; en: string };

export interface ProjectData {
  slug: string;
  title: string;
  summary: string;
  kind: 'company' | 'own';
  year: number;
  duration?: string;
  role: string;
  stack: string[];
  metric: ValueLabel;
  results?: ValueLabel[];
  links?: { repo?: string; demo?: string };
  featured?: boolean;
  order: number;
  diagram?: string;
  draft?: boolean;
  /** `## ` headings of the body, in order */
  headings: string[];
}

export interface ExperienceData {
  start: number;
  end: number | null;
  role: string;
  org: string;
  order: number;
  bullets: string[];
}

function readEntry(file: string) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`no frontmatter: ${file}`);
  return { data: YAML.parse(m[1]), body: m[2] };
}

function entries(collection: string, locale: Locale) {
  const dir = path.join('src/content', collection, locale);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.slice(0, -'.md'.length), ...readEntry(path.join(dir, f)) }));
}

const lines = (body: string, re: RegExp) => body.split(/\r?\n/).flatMap((l) => l.match(re)?.[1] ?? []);
const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;
const yamlList = <T>(name: string): T[] => YAML.parse(fs.readFileSync(`src/data/${name}.yaml`, 'utf8'));

/** Non-draft projects of a locale, sorted by `order` — what the list page and prev/next use. */
export function projects(locale: Locale): ProjectData[] {
  return entries('projects', locale)
    .map(({ slug, data, body }) => ({ ...data, slug, headings: lines(body, /^## (.+)$/) }) as ProjectData)
    .filter((p) => !p.draft)
    .sort(byOrder);
}

export const featured = (locale: Locale) => projects(locale).filter((p) => p.featured === true);

/** Newest first, like the timeline. */
function timeline(collection: 'experience' | 'education', locale: Locale): ExperienceData[] {
  return entries(collection, locale)
    .map(({ data, body }) => ({ ...data, bullets: lines(body, /^- (.+)$/) }) as ExperienceData)
    .sort((a, b) => b.start - a.start || a.order - b.order);
}

export const experience = (locale: Locale) => timeline('experience', locale);
export const education = (locale: Locale) => timeline('education', locale);

export const highlights = () => yamlList<{ value: string; label: Bilingual; order: number }>('highlights').sort(byOrder);
export const skills = () => yamlList<{ label: Bilingual; items: string[]; order: number }>('skills').sort(byOrder);

export function collaboration() {
  const items = yamlList<{ kind: 'service' | 'step'; title: Bilingual; text: Bilingual; order: number }>('collaboration').sort(byOrder);
  return { services: items.filter((i) => i.kind === 'service'), steps: items.filter((i) => i.kind === 'step') };
}

export const caseTime = (p: ProjectData) => (p.duration ? `${p.year} · ${p.duration}` : String(p.year));
