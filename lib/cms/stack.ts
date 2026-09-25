import { NextRequest } from 'next/server';
import { z } from 'zod';
import { guardAdmin } from '@/lib/admin';
import { cmsDb } from '@/prisma/db';
import { invalid, isSameId, notFound, ok, readJson } from './http';
import { revalidatePublicPaths } from './revalidate';

/**
 * StackItem CRUD.
 *
 * Handlers live here (not in the route files) so `route.ts` can expose
 * GET/POST while `[id]/route.ts` exposes PUT/DELETE against the same logic.
 * The admin UI calls `/api/stack` for the collection and `/api/stack/{_id}`
 * for mutations on an existing row.
 *
 * Note the collection is `db.orm.stack_items` — the Prisma 8 client is keyed
 * by the contract's snake_case root name, and reads are a chainable builder
 * (`where().orderBy().limit().all()`) rather than `find({...}).all()`.
 */

const StackItemSchema = z.object({
  category: z.enum(['FRONTEND', 'BACKEND', 'DATABASE', 'CMS', 'DEPLOYMENT', 'OTHER']),
  name: z.string().min(1).max(255),
  order: z.number().int().min(-1_000_000).max(1_000_000).optional(),
});

export async function handleGet() {
  const db = await cmsDb();
  const items = await db.orm.stack_items.orderBy({ order: 1 }).limit(999).all();
  return ok(items);
}

export async function handlePost(req: NextRequest) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const body = await readJson(req);
  if (body.ok === false) return body.response;

  const parsed = StackItemSchema.safeParse(body.value);
  if (parsed.success === false) return invalid(parsed);

  const item = await db.orm.stack_items.create({
    category: parsed.data.category,
    name: parsed.data.name.trim(),
    order: parsed.data.order ?? 0,
  });

  revalidatePublicPaths('/stack', '/');
  return ok(item, 201);
}

export async function handlePut(req: NextRequest, id: string) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const body = await readJson(req);
  if (body.ok === false) return body.response;

  const parsed = StackItemSchema.partial().safeParse(body.value);
  if (parsed.success === false) return invalid(parsed);

  const existing = await db.orm.stack_items.where({ _id: id }).first();
  if (!isSameId(existing, id)) return notFound();

  const item = await db.orm.stack_items.where({ _id: id }).update({
    ...(parsed.data.category !== undefined && { category: parsed.data.category }),
    ...(parsed.data.name && { name: parsed.data.name.trim() }),
    ...('order' in parsed.data && { order: parsed.data.order ?? 0 }),
  });

  revalidatePublicPaths('/stack', '/');
  return ok(item);
}

export async function handleDelete(req: NextRequest, id: string) {
  const { response } = await guardAdmin(req);
  if (response) return response;
  const db = await cmsDb();

  const existing = await db.orm.stack_items.where({ _id: id }).first();
  if (!isSameId(existing, id)) return notFound();

  const item = await db.orm.stack_items.where({ _id: id }).delete();

  revalidatePublicPaths('/stack', '/');
  return ok(item);
}
