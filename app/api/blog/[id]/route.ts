import type { NextRequest } from 'next/server';
import { handleDelete, handlePut } from '@/lib/cms/blog';

/**
 * PUT    /api/blog/[id] — update one post (admin only).
 * DELETE /api/blog/[id] — remove one post (admin only).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Ctx) {
  return handlePut(req, params.id);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return handleDelete(req, params.id);
}
