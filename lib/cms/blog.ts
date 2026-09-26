import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { guardAdmin } from '@/lib/admin';
import { cmsDb } from '@/prisma/db';
import {
  invalid,
  isSameId,
  notFound,
  ok,
  readJson,
  readingTime,
  slugify,
  sortBy,
  unique,
} from './http';
import { revalidatePublicPaths } from './revalidate';

/**
 * BlogPost CRUD, exposed as `/api/blog` and `/api/blog/[id]`.
 * Collection is `db.orm.blog_posts`.
 *
 * `orderBy()` only compiles a single sort key, so the published-first ordering
 * the admin list wants is applied in memory via `sortBy`.
 */

const BlogPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  excerpt: z.string().max(3000),
  content: z.string().min(1),
  // The admin form uses `null` for "no cover image", so this has to accept it —
  // `null` is also how an existing cover gets cleared on update.
  coverImage: z.string().max(500).nullish(),
  tags: z.array(z.string()).max(20),
  published: z.boolean().optional(),
});

export async function handleGet() {
  const db = await cmsDb();
  const posts = await db.orm.blog_posts.limit(999).all();

  const sorted = sortBy(
    posts as Array<Record<string, unknown>>,
    (p) => (p.publishedAt ? new Date(p.publishedAt as string).getTime() : 0),
    -1,
  );
  sorted.sort((a, b) => Number(Boolean(b.published)) - Number(Boolean(a.published)));

  return ok(sorted);
}

export async function handlePost(req: NextRequest) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const body = await readJson(req);
  if (body.ok === false) return body.response;

  const parsed = BlogPostSchema.safeParse(body.value);
  if (parsed.success === false) return invalid(parsed);

  const input = parsed.data;
  const slug = input.slug?.trim() || slugify(input.title);

  const conflict = await db.orm.blog_posts.where({ slug }).first();
  if (conflict) return unique('This slug is already in use.');

  const published = input.published ?? false;

  const post = await db.orm.blog_posts.create({
    title: input.title.trim(),
    slug,
    excerpt: input.excerpt.trim(),
    content: input.content,
    coverImage: input.coverImage?.trim(),
    tags: input.tags,
    published,
    readingTime: readingTime(input.content),
    publishedAt: published ? new Date() : null,
  });

  revalidatePublicPaths('/blog', `/blog/${post.slug}`, '/');
  return ok(post, 201);
}

export async function handlePut(req: NextRequest, id: string) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const body = await readJson(req);
  if (body.ok === false) return body.response;

  const parsed = BlogPostSchema.partial().safeParse(body.value);
  if (parsed.success === false) return invalid(parsed);

  const input = parsed.data;

  const existing = await db.orm.blog_posts.where({ _id: id }).first();
  if (!isSameId(existing, id)) return notFound();

  const incomingSlug = input.slug?.trim();
  if (incomingSlug && incomingSlug !== existing.slug) {
    const conflict = await db.orm.blog_posts.where({ slug: incomingSlug }).first();
    if (conflict && !isSameId(conflict, id)) return unique('This slug is already in use.');
  }

  const data: Record<string, unknown> = {
    ...(input.title && { title: input.title.trim() }),
    ...(incomingSlug && { slug: incomingSlug }),
    ...(input.excerpt !== undefined && { excerpt: input.excerpt.trim() }),
    ...(input.content !== undefined && { content: input.content }),
    ...(input.coverImage !== undefined && { coverImage: input.coverImage?.trim() ?? null }),
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.published !== undefined && { published: input.published }),
  };

  // readingTime is derived, so it is only recomputed when the body changes.
  if (input.content !== undefined) data.readingTime = readingTime(input.content);

  // Stamping `publishedAt` on every save would reorder the list each time, so
  // it is only set on the transition into published (or explicitly re-published).
  if (input.published !== undefined) {
    const nowPublished = input.published;
    const wasPublished = Boolean(existing.published);
    if (nowPublished && !wasPublished) data.publishedAt = new Date();
    if (!nowPublished) data.publishedAt = null;
  }

  const post = await db.orm.blog_posts.where({ _id: id }).update(data);

  revalidatePublicPaths('/blog', `/blog/${post.slug}`, '/');
  return ok(post);
}

export async function handleDelete(req: NextRequest, id: string) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const existing = await db.orm.blog_posts.where({ _id: id }).first();
  if (!isSameId(existing, id)) return notFound();

  const post = await db.orm.blog_posts.where({ _id: id }).delete();

  revalidatePublicPaths('/blog', `/blog/${post.slug}`, '/');
  return ok(post);
}
