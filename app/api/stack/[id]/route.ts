import type { NextRequest } from 'next/server';
import { get, remove, update } from '@/lib/cms/stack';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

/** GET / PUT / DELETE a single stack item (admin only). */
export async function GET(req: NextRequest, { params }: Ctx) {
  return get(req, params.id);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return update(req, params.id);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return remove(req, params.id);
}
