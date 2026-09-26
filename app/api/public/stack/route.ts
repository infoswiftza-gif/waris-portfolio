import type { NextRequest } from 'next/server';
import { publicList } from '@/lib/cms/stack';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/public/stack — no auth.
 *
 * Stack items are always public, so the same rows as the admin list are
 * returned.
 */
export async function GET(req: NextRequest) {
  return publicList(req);
}
