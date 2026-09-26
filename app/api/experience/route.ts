import type { NextRequest } from 'next/server';
import { create, list } from '@/lib/cms/experience';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET  /api/experience — every entry ordered by `order`.
 * POST /api/experience — create one (admin only).
 */
export async function GET(req: NextRequest) {
  return list(req);
}

export async function POST(req: NextRequest) {
  return create(req);
}
