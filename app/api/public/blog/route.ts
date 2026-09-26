import type { NextRequest } from 'next/server';
import { publicList } from '@/lib/cms/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/public/blog — published posts only, no auth.
 *
 * The admin list at `/api/blog` includes drafts and is guarded; this is the
 * only blog collection meant for anonymous callers.
 */
export async function GET(req: NextRequest) {
  return publicList(req);
}
