import { z } from 'zod';

import { readingTime } from './http';
import { createResource } from './factory';
import { type ResourceDef, type Row, req, str } from './registry';

/**
 * BlogPost resource.
 *
 * Collection is `db.orm.blog_posts`, exposed at `/api/blog` (admin, drafts
 * included) and `/api/public/blog` (published only).
 */

const BlogPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  excerpt: z.string().max(3000),
  content: z.string().min(1),
  // The form submits `null` for "no cover image", and `null` is also how an
  // existing cover gets cleared, so this must stay nullish rather than optional.
  coverImage: z.string().max(500).nullish(),
  tags: z.array(z.string()).max(20),
  published: z.boolean().optional(),
});

const def: ResourceDef = {
  key: 'blog',
  orm: 'blog_posts',
  label: 'Blog post',
  plural: 'Blog posts',
  publicPath: '/blog',
  schema: BlogPostSchema,
  hasPublished: true,
  slugField: 'slug',
  searchFields: ['title', 'slug', 'excerpt', 'tags'],
  sortable: ['publishedAt', 'title', 'slug'],
  defaultSort: { key: 'publishedAt', dir: -1 },
  // `orderBy()` takes a single key, so "published first, then newest" is a
  // two-pass sort in memory.
  fallbackSort: (rows: Row[]) => {
    const at = (r: Row) => (r.publishedAt ? new Date(r.publishedAt as string).getTime() : 0);
    return rows
      .map((r, i) => ({ r, i }))
      .sort((a, b) => (at(a.r) - at(b.r)) || (a.i - b.i))
      .map(({ r }) => r)
      .sort(
        (a, b) =>
          Number(Boolean(b.published)) - Number(Boolean(a.published)) ||
          at(b) - at(a),
      );
  },
  toCreate: (input) => {
    const published = input.published === true;
    return {
      title: req(input.title),
      excerpt: req(input.excerpt),
      content: input.content,
      coverImage: str(input.coverImage) ?? null,
      tags: input.tags ?? [],
      published,
      readingTime: readingTime(String(input.content)),
      publishedAt: published ? new Date() : null,
      createdAt: new Date(),
    };
  },
  toUpdate: (input, existing) => {
    const patch: Row = {};
    if (input.title) patch.title = req(input.title);
    if (input.slug) patch.slug = req(input.slug);
    if (input.excerpt !== undefined) patch.excerpt = req(input.excerpt);
    if (input.content !== undefined) {
      patch.content = input.content;
      // readingTime is derived, so recomputing it on every save (even a title
      // edit) would make the stored value drift from the body.
      patch.readingTime = readingTime(String(input.content));
    }
    if (input.coverImage !== undefined) patch.coverImage = str(input.coverImage) ?? null;
    if (input.tags !== undefined) patch.tags = input.tags;

    if (input.published !== undefined) {
      patch.published = input.published;
      // Only stamp on the transition into published. Refreshing the date on
      // every save of an already-published post would reorder the list each time.
      if (input.published && !existing.published) patch.publishedAt = new Date();
      if (!input.published) patch.publishedAt = null;
    }
    return patch;
  },
  revalidateFor: (row) => ['/blog', `/blog/${row.slug}`, '/'],
};

const blog = createResource(def);

export const blogDef = def;
export const { list, publicList, get, create, update, remove, bulk } = blog;
