import type { NextRequest } from 'next/server';
import { create, list } from '@/lib/cms/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET  /api/blog — admin list, drafts included. Supports
 *               `?page=&pageSize=&search=&sort=&dir=&status=`.
 * POST /api/blog — create a post (admin only).
 */
export async function GET(req: NextRequest) {
  return list(req);
}

export async function POST(req: NextRequest) {
  return create(req);
}
