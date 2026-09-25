import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { guardAdmin } from '@/lib/admin';
import { cmsDb } from '@/prisma/db';
import { invalid, isSameId, notFound, ok, readJson, slugify, unique } from './http';
import { revalidatePublicPaths } from './revalidate';

/**
 * Project CRUD, exposed as `/api/projects` and `/api/projects/[id]`.
 * Collection is `db.orm.projects`.
 *
 * The admin UI sees drafts too, so the collection route returns every
 * document; public pages are the ones that filter on `published: true`.
 */

const ProjectSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  category: z.string().max(200).optional(),
  visual: z.enum(['swiftza', 'zirconia', 'ev', 'default']).optional(),
  description: z.string().max(2000),
  liveUrl: z.string().max(500).optional(),
  caseStudyUrl: z.string().max(500).optional(),
  sourceUrl: z.string().max(500).optional(),
  tags: z.array(z.string()).max(20),
  imageUrl: z.string().max(500).optional(),
  order: z.number().int().min(-1_000_000).max(1_000_000).optional(),
  published: z.boolean().optional(),
});

export async function handleGet() {
  const db = await cmsDb();
  const projects = await db.orm.projects.orderBy({ order: 1 }).limit(999).all();
  return ok(projects);
}

export async function handlePost(req: NextRequest) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const body = await readJson(req);
  if (body.ok === false) return body.response;

  const parsed = ProjectSchema.safeParse(body.value);
  if (parsed.success === false) return invalid(parsed);

  const input = parsed.data;
  const slug = input.slug.trim() || slugify(input.title);

  const existing = await db.orm.projects.where({ slug }).first();
  if (existing) return unique('A project with this slug already exists.');

  const project = await db.orm.projects.create({
    title: input.title.trim(),
    slug,
    category: input.category?.trim(),
    visual: input.visual ?? 'default',
    description: input.description.trim(),
    liveUrl: input.liveUrl?.trim(),
    caseStudyUrl: input.caseStudyUrl?.trim(),
    sourceUrl: input.sourceUrl?.trim(),
    tags: input.tags,
    imageUrl: input.imageUrl?.trim(),
    order: input.order,
    published: input.published ?? false,
  });

  revalidatePublicPaths('/projects', '/');
  return ok(project, 201);
}

export async function handlePut(req: NextRequest, id: string) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const body = await readJson(req);
  if (body.ok === false) return body.response;

  const parsed = ProjectSchema.partial().safeParse(body.value);
  if (parsed.success === false) return invalid(parsed);

  const input = parsed.data;
  const existing = await db.orm.projects.where({ _id: id }).first();
  if (!isSameId(existing, id)) return notFound();

  const updateSlug = input.slug?.trim();
  if (updateSlug && updateSlug !== existing.slug) {
    const conflict = await db.orm.projects.where({ slug: updateSlug }).first();
    // A conflict only counts when it belongs to a *different* document.
    if (conflict && !isSameId(conflict, id)) {
      return unique('A project with this slug already exists.');
    }
  }

  const project = await db.orm.projects.where({ _id: id }).update({
    ...(input.title && { title: input.title.trim() }),
    ...(updateSlug && { slug: updateSlug }),
    ...(input.category !== undefined && { category: input.category.trim() }),
    ...(input.visual !== undefined && { visual: input.visual }),
    ...(input.description !== undefined && { description: input.description.trim() }),
    ...(input.liveUrl !== undefined && { liveUrl: input.liveUrl.trim() }),
    ...(input.caseStudyUrl !== undefined && { caseStudyUrl: input.caseStudyUrl.trim() }),
    ...(input.sourceUrl !== undefined && { sourceUrl: input.sourceUrl.trim() }),
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl.trim() }),
    ...('order' in input && { order: input.order }),
    ...(input.published !== undefined && { published: input.published }),
  });

  revalidatePublicPaths('/projects', '/');
  return ok(project);
}

export async function handleDelete(req: NextRequest, id: string) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const existing = await db.orm.projects.where({ _id: id }).first();
  if (!isSameId(existing, id)) return notFound();

  const project = await db.orm.projects.where({ _id: id }).delete();

  revalidatePublicPaths('/projects', '/');
  return ok(project);
}
