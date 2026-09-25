import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { guardAdmin } from '@/lib/admin';
import { cmsDb } from '@/prisma/db';
import { invalid, isSameId, notFound, ok, readJson } from './http';
import { revalidatePublicPaths } from './revalidate';

/**
 * Experience CRUD, exposed as `/api/experience` and `/api/experience/[id]`.
 * Collection is `db.orm.experience` (the contract root name).
 */

const ExperienceSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  title: z.string().min(1).max(255),
  description: z.string().max(3000),
  tags: z.array(z.string()).max(20),
  order: z.number().int().min(-1_000_000).max(1_000_000).optional(),
});

export async function handleGet() {
  const db = await cmsDb();
  const entries = await db.orm.experience.orderBy({ order: 1 }).limit(999).all();
  return ok(entries);
}

export async function handlePost(req: NextRequest) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const body = await readJson(req);
  if (body.ok === false) return body.response;

  const parsed = ExperienceSchema.safeParse(body.value);
  if (parsed.success === false) return invalid(parsed);

  const entry = await db.orm.experience.create({
    year: parsed.data.year,
    title: parsed.data.title.trim(),
    description: parsed.data.description.trim(),
    tags: parsed.data.tags,
    order: parsed.data.order ?? 0,
  });

  revalidatePublicPaths('/experience', '/');
  return ok(entry, 201);
}

export async function handlePut(req: NextRequest, id: string) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const body = await readJson(req);
  if (body.ok === false) return body.response;

  const parsed = ExperienceSchema.partial().safeParse(body.value);
  if (parsed.success === false) return invalid(parsed);

  const existing = await db.orm.experience.where({ _id: id }).first();
  if (!isSameId(existing, id)) return notFound();

  const entry = await db.orm.experience.where({ _id: id }).update({
    ...(parsed.data.year !== undefined && { year: parsed.data.year }),
    ...(parsed.data.title && { title: parsed.data.title.trim() }),
    ...(parsed.data.description !== undefined && { description: parsed.data.description.trim() }),
    ...(parsed.data.tags !== undefined && { tags: parsed.data.tags }),
    ...('order' in parsed.data && { order: parsed.data.order ?? 0 }),
  });

  revalidatePublicPaths('/experience', '/');
  return ok(entry);
}

export async function handleDelete(req: NextRequest, id: string) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const existing = await db.orm.experience.where({ _id: id }).first();
  if (!isSameId(existing, id)) return notFound();

  const entry = await db.orm.experience.where({ _id: id }).delete();

  revalidatePublicPaths('/experience', '/');
  return ok(entry);
}
