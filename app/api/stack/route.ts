import type { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/cms/stack';

/**
 * GET  /api/stack  — every stack item, ordered by `order`.
 * POST /api/stack  — create one (admin only).
 * Mutations on an existing row live in `./[id]/route.ts`.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleGet();
}

export async function POST(req: NextRequest) {
  return handlePost(req);
}
