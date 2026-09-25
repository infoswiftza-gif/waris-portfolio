import type { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/cms/experience';

/**
 * GET  /api/experience — every entry ordered by `order`.
 * POST /api/experience — create one (admin only).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleGet();
}

export async function POST(req: NextRequest) {
  return handlePost(req);
}
