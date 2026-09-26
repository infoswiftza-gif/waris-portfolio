import type { NextRequest } from 'next/server';
import { publicList } from '@/lib/cms/experience';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/public/experience — no auth.
 *
 * Experience entries carry no `published` flag (they are always public), so
 * this intentionally returns the same rows as the admin list.
 */
export async function GET(req: NextRequest) {
  return publicList(req);
}
