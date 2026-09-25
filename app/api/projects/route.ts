import type { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/cms/projects';

/**
 * GET  /api/projects — every project, published and draft, ordered by `order`.
 * POST /api/projects — create one (admin only).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleGet();
}

export async function POST(req: NextRequest) {
  return handlePost(req);
}
