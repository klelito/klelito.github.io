import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/routes';
import { splitId, adjacent } from './content-utils';

export type Project = CollectionEntry<'projects'> & { slug: string };
export type ExperienceItem = CollectionEntry<'experience'>;
export type SkillGroup = CollectionEntry<'skills'>['data'];
export type CollaborationItem = CollectionEntry<'collaboration'>['data'];
export type Highlight = CollectionEntry<'highlights'>['data'];

const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;

/** Non-draft projects of one locale, sorted by `order`. */
export async function getProjects(locale: Locale): Promise<Project[]> {
  const entries = await getCollection('projects', ({ id, data }) => splitId(id).locale === locale && !data.draft);
  return entries
    .map((entry) => ({ ...entry, slug: splitId(entry.id).slug }))
    .sort((a, b) => byOrder(a.data, b.data));
}

export async function getFeaturedProjects(locale: Locale): Promise<Project[]> {
  return (await getProjects(locale)).filter((p) => p.data.featured);
}

/** `getStaticPaths` result for the case study pages of one locale; prev/next wrap around `order`. */
export async function caseStudyPaths(locale: Locale) {
  const projects = await getProjects(locale);
  return projects.map((project, i) => ({
    params: { slug: project.slug },
    props: { project, ...adjacent(projects, i) },
  }));
}

/** Experience of one locale, newest first. */
export async function getExperience(locale: Locale): Promise<ExperienceItem[]> {
  const entries = await getCollection('experience', ({ id }) => splitId(id).locale === locale);
  return entries.sort((a, b) => b.data.start - a.data.start || byOrder(a.data, b.data));
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  return (await getCollection('skills')).map((e) => e.data).sort(byOrder);
}

export async function getCollaboration(): Promise<{ services: CollaborationItem[]; steps: CollaborationItem[] }> {
  const items = (await getCollection('collaboration')).map((e) => e.data).sort(byOrder);
  return { services: items.filter((i) => i.kind === 'service'), steps: items.filter((i) => i.kind === 'step') };
}

export async function getHighlights(): Promise<Highlight[]> {
  return (await getCollection('highlights')).map((e) => e.data).sort(byOrder);
}
