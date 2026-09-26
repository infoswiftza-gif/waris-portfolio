import { z } from 'zod';

import { createResource } from './factory';
import { PREVIEW_VARIANTS } from './preview';
import { type ResourceDef, type Row, req, str } from './registry';

/**
 * Project resource.
 *
 * Collection is `db.orm.projects`, exposed at `/api/projects` (admin, drafts
 * included) and `/api/public/projects` (published only).
 */

const ProjectSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  category: z.string().max(200).optional(),
  visual: z.enum(PREVIEW_VARIANTS).optional(),
  description: z.string().max(2000),
  liveUrl: z.string().max(500).optional(),
  caseStudyUrl: z.string().max(500).optional(),
  sourceUrl: z.string().max(500).optional(),
  tags: z.array(z.string()).max(20),
  imageUrl: z.string().max(500).optional(),
  order: z.number().int().min(-1_000_000).max(1_000_000).optional(),
  published: z.boolean().optional(),
});

const def: ResourceDef = {
  key: 'projects',
  orm: 'projects',
  label: 'Project',
  plural: 'Projects',
  publicPath: '/projects',
  schema: ProjectSchema,
  hasPublished: true,
  slugField: 'slug',
  searchFields: ['title', 'slug', 'category', 'description', 'tags'],
  sortable: ['order', 'title', 'slug'],
  defaultSort: { key: 'order', dir: 1 },
  toCreate: (input) => ({
    title: req(input.title),
    slug: req(input.slug),
    category: str(input.category),
    // Card markup keys off `visual`, so a stored `undefined` would render a
    // blank card instead of the default chrome.
    visual: input.visual ?? 'default',
    description: req(input.description),
    liveUrl: str(input.liveUrl),
    caseStudyUrl: str(input.caseStudyUrl),
    sourceUrl: str(input.sourceUrl),
    tags: input.tags ?? [],
    imageUrl: str(input.imageUrl),
    order: input.order ?? 0,
    published: input.published === true,
    createdAt: new Date(),
  }),
  toUpdate: (input) => {
    const patch: Row = {};
    if (input.title) patch.title = req(input.title);
    if (input.slug) patch.slug = req(input.slug);
    if (input.category !== undefined) patch.category = str(input.category) ?? '';
    if (input.visual !== undefined) patch.visual = input.visual;
    if (input.description !== undefined) patch.description = req(input.description);
    if (input.liveUrl !== undefined) patch.liveUrl = str(input.liveUrl) ?? '';
    if (input.caseStudyUrl !== undefined) patch.caseStudyUrl = str(input.caseStudyUrl) ?? '';
    if (input.sourceUrl !== undefined) patch.sourceUrl = str(input.sourceUrl) ?? '';
    if (input.tags !== undefined) patch.tags = input.tags;
    if (input.imageUrl !== undefined) patch.imageUrl = str(input.imageUrl) ?? '';
    // `'order' in input` rather than `!== undefined`, so an explicit 0 (the
    // "move to top" action) is not swallowed.
    if ('order' in input) patch.order = input.order;
    if (input.published !== undefined) patch.published = input.published;
    return patch;
  },
  revalidateFor: () => ['/projects', '/'],
};

const projects = createResource(def);

export const projectsDef = def;
export const { list, publicList, get, create, update, remove, bulk } = projects;
