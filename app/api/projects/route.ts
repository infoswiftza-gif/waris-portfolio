import type { NextRequest } from 'next/server';
import { create, list } from '@/lib/cms/projects';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET  /api/projects — admin list, drafts included, ordered by `order`.
 * POST /api/projects — create a project (admin only).
 */
export async function GET(req: NextRequest) {
  return list(req);
}

export async function POST(req: NextRequest) {
  return create(req);
}
