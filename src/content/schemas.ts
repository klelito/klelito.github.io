// Zod schemas for all content. Imports only `astro/zod` so unit tests can load it under plain Node.
import { z } from 'astro/zod';

// Strict: an unquoted comma inside a YAML flow mapping (`{ pl: a, b, en: c }`) yields a stray key — fail loudly.
const bilingual = z.strictObject({ pl: z.string(), en: z.string() });
const valueLabel = z.strictObject({ value: z.string(), label: z.string() });

export const projectSchema = z
  .object({
    title: z.string(),
    summary: z.string(),
    kind: z.enum(['company', 'own']),
    year: z.number().int(),
    duration: z.string().optional(),
    role: z.string(),
    stack: z.array(z.string()).min(1),
    metric: valueLabel,
    results: z.array(valueLabel).min(1).max(3).optional(),
    links: z.object({ repo: z.url().optional(), demo: z.url().optional() }).optional(),
    featured: z.boolean().default(false),
    order: z.number().int(),
    diagram: z.string().optional(),
    draft: z.boolean().default(false),
  })
  .refine((p) => !(p.kind === 'company' && p.links), {
    message: 'company projects must not have links',
    path: ['links'],
  });

export const experienceSchema = z.object({
  start: z.number().int(),
  end: z.number().int().nullable(),
  role: z.string(),
  org: z.string(),
  order: z.number().int(),
});

export const skillGroupSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  icon: z.string(),
  label: bilingual,
  items: z.array(z.string()).min(1),
});

export const collaborationItemSchema = z.object({
  id: z.string(),
  kind: z.enum(['service', 'step']),
  order: z.number().int(),
  title: bilingual,
  text: bilingual,
});

export const highlightSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  value: z.string(),
  label: bilingual,
});
