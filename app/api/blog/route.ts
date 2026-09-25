import type { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/cms/blog';

/**
 * GET  /api/blog — every post, published first then newest by publish date.
 * POST /api/blog — create one (admin only).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleGet();
}

export async function POST(req: NextRequest) {
  return handlePost(req);
}
