import type { NextRequest } from 'next/server';
import { get, remove, update } from '@/lib/cms/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

/**
 * GET    /api/blog/[id] — one post (admin only).
 * PUT    /api/blog/[id] — update one post (admin only).
 * DELETE /api/blog/[id] — remove one post (admin only).
 *
 * GET was missing here entirely, so the admin UI had no way to fetch a single
 * record — for example to open a draft for preview.
 */
export async function GET(req: NextRequest, { params }: Ctx) {
  return get(req, params.id);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return update(req, params.id);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return remove(req, params.id);
}
