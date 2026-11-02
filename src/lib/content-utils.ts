// Pure helpers over collection entries; no Astro imports so they run under plain Node in unit tests.
import type { Locale } from '../i18n/routes';

/** `'pl/bom-converter'` → `{ locale: 'pl', slug: 'bom-converter' }` */
export function splitId(id: string): { locale: Locale; slug: string } {
  const [locale, ...rest] = id.split('/');
  return { locale: locale as Locale, slug: rest.join('/') };
}

/** Neighbours of `items[index]`, wrapping around at both ends. */
export function adjacent<T>(items: T[], index: number): { prev: T; next: T } {
  const n = items.length;
  return { prev: items[(index - 1 + n) % n], next: items[(index + 1) % n] };
}
