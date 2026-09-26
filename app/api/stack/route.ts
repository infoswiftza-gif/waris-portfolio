import type { NextRequest } from 'next/server';
import { create, list } from '@/lib/cms/stack';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET  /api/stack — every stack item, ordered by `order`.
 * POST /api/stack — create one (admin only).
 */
export async function GET(req: NextRequest) {
  return list(req);
}

export async function POST(req: NextRequest) {
  return create(req);
}
