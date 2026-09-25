import type { NextRequest } from 'next/server';
import { handleDelete, handlePut } from '@/lib/cms/stack';

/**
 * PUT    /api/stack/[id]  — update one stack item (admin only).
 * DELETE /api/stack/[id]  — remove one stack item (admin only).
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
