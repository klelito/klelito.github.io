// Locale-aware URL helpers. No imports: unit tests run this file directly under Node type stripping.

export type Locale = 'pl' | 'en';

export const LOCALES: readonly Locale[] = ['pl', 'en'];

const PREFIX: Record<Locale, string> = { pl: '', en: '/en' };
const PROJECTS_SEGMENT: Record<Locale, string> = { pl: 'projekty', en: 'projects' };

export function homePath(l: Locale): string {
  return `${PREFIX[l]}/`;
}

export function projectsPath(l: Locale): string {
  return `${PREFIX[l]}/${PROJECTS_SEGMENT[l]}/`;
}

export function projectPath(l: Locale, slug: string): string {
  return `${projectsPath(l)}${slug}/`;
}

export function localeFromPath(path: string): Locale {
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'pl';
}

export function switchLocalePath(path: string, to: Locale): string {
  const hashIndex = path.indexOf('#');
  const hash = hashIndex === -1 ? '' : path.slice(hashIndex);
  const pathname = hashIndex === -1 ? path : path.slice(0, hashIndex);

  const from = localeFromPath(pathname);
  const rest = from === 'en' ? pathname.slice('/en'.length) || '/' : pathname;
  const segments = rest.split('/').filter(Boolean);

  let target = homePath(to);
  if (segments.length >= 1 && segments.length <= 2 && segments[0] === PROJECTS_SEGMENT[from]) {
    target = segments.length === 1 ? projectsPath(to) : projectPath(to, segments[1]);
  }
  return target + hash;
}
