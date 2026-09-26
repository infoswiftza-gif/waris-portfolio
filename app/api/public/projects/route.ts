import type { NextRequest } from 'next/server';
import { publicList } from '@/lib/cms/projects';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/public/projects — published projects only, no auth. */
export async function GET(req: NextRequest) {
  return publicList(req);
}
