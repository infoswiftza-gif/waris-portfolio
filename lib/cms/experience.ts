import { z } from 'zod';

import { createResource } from './factory';
import { type ResourceDef, req } from './registry';

/**
 * Experience resource.
 *
 * Collection is `db.orm.experience` — the contract root is already singular.
 * Timeline entries are always public, so there is no `published` flag and
 * `/api/public/experience` serves the same rows as the admin list.
 */

const ExperienceSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  title: z.string().min(1).max(255),
  description: z.string().max(3000),
  tags: z.array(z.string()).max(20),
  order: z.number().int().min(-1_000_000).max(1_000_000).optional(),
});

const def: ResourceDef = {
  key: 'experience',
  orm: 'experience',
  label: 'Experience entry',
  plural: 'Experience',
  publicPath: '/experience',
  schema: ExperienceSchema,
  hasPublished: false,
  searchFields: ['title', 'description', 'tags', 'year'],
  sortable: ['order', 'year', 'title'],
  defaultSort: { key: 'order', dir: 1 },
  toCreate: (input) => ({
    year: input.year,
    title: req(input.title),
    description: req(input.description),
    tags: input.tags ?? [],
    order: input.order ?? 0,
    createdAt: new Date(),
  }),
  toUpdate: (input) => {
    const patch: Record<string, unknown> = {};
    if (input.year !== undefined) patch.year = input.year;
    if (input.title) patch.title = req(input.title);
    if (input.description !== undefined) patch.description = req(input.description);
    if (input.tags !== undefined) patch.tags = input.tags;
    if ('order' in input) patch.order = input.order ?? 0;
    return patch;
  },
  revalidateFor: () => ['/experience', '/'],
};

const experience = createResource(def);

export const experienceDef = def;
export const { list, publicList, get, create, update, remove, bulk } = experience;
