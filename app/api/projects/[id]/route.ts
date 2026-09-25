import type { NextRequest } from 'next/server';
import { handleDelete, handlePut } from '@/lib/cms/projects';

/**
 * PUT    /api/projects/[id] — update one project (admin only).
 * DELETE /api/projects/[id] — remove one project (admin only).
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
