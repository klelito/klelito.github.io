import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import {
  projectSchema,
  experienceSchema,
  skillGroupSchema,
  collaborationItemSchema,
  highlightSchema,
} from './content/schemas';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: projectSchema,
});

const experience = defineCollection({
  loader: glob({ base: './src/content/experience', pattern: '**/*.md' }),
  schema: experienceSchema,
});

const skills = defineCollection({ loader: file('src/data/skills.yaml'), schema: skillGroupSchema });
const collaboration = defineCollection({ loader: file('src/data/collaboration.yaml'), schema: collaborationItemSchema });
const highlights = defineCollection({ loader: file('src/data/highlights.yaml'), schema: highlightSchema });

export const collections = { projects, experience, skills, collaboration, highlights };
