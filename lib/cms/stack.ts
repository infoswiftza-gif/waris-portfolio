import { z } from 'zod';

import { createResource } from './factory';
import { type ResourceDef, STACK_CATEGORIES, req } from './registry';

/**
 * StackItem resource.
 *
 * Collection is `db.orm.stack_items`. Items are always public, so there is no
 * `published` flag; `db.orm` is keyed by the contract's snake_case root name,
 * not the model name.
 */

const StackItemSchema = z.object({
  category: z.enum(STACK_CATEGORIES),
  name: z.string().min(1).max(255),
  order: z.number().int().min(-1_000_000).max(1_000_000).optional(),
});

const def: ResourceDef = {
  key: 'stack',
  orm: 'stack_items',
  label: 'Stack item',
  plural: 'Stack',
  publicPath: '/stack',
  schema: StackItemSchema,
  hasPublished: false,
  searchFields: ['name', 'category'],
  sortable: ['order', 'name', 'category'],
  defaultSort: { key: 'order', dir: 1 },
  toCreate: (input) => ({
    category: input.category,
    name: req(input.name),
    order: input.order ?? 0,
    createdAt: new Date(),
  }),
  toUpdate: (input) => {
    const patch: Record<string, unknown> = {};
    if (input.category !== undefined) patch.category = input.category;
    if (input.name) patch.name = req(input.name);
    if ('order' in input) patch.order = input.order ?? 0;
    return patch;
  },
  revalidateFor: () => ['/stack', '/'],
};

const stack = createResource(def);

export const stackDef = def;
export const { list, publicList, get, create, update, remove, bulk } = stack;
