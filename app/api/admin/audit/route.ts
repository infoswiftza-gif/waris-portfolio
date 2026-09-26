import type { NextRequest } from 'next/server';

import { guardAdmin } from '@/lib/admin';
import { serverError } from '@/lib/cms/http';
import { cmsDb } from '@/prisma/db';

/**
 * GET /api/admin/audit — the audit trail (admin only).
 *
 * Backed by the `audit_log` collection. `orderBy` takes a single key, so the
 * newest-first ordering is done in JS after a bounded read rather than relying
 * on a compound sort the builder cannot express.
 */

const CAP = 200;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { response } = await guardAdmin(req);
  if (response) return response;

  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') ?? '20') || 20));
    const resource = url.searchParams.get('resource') ?? '';

    const db = await cmsDb();
    const orm = db.orm as unknown as Record<string, { limit: (n: number) => { all: () => Promise<Record<string, unknown>[]> } }>;
    const all = await orm.audit_log.limit(CAP).all();

    const at = (r: Record<string, unknown>) =>
      r.createdAt ? new Date(String(r.createdAt)).getTime() : 0;

    let rows = all.sort((a, b) => at(b) - at(a));
    if (resource) rows = rows.filter((r) => String(r.resource ?? '') === resource);

    const total = rows.length;
    const start = (page - 1) * pageSize;

    return Response.json({
      ok: true,
      data: rows.slice(start, start + pageSize).map((r) => ({
        id: String(r._id ?? ''),
        action: String(r.action ?? ''),
        resource: String(r.resource ?? ''),
        recordId: String(r.recordId ?? ''),
        label: String(r.label ?? ''),
        actor: String(r.actor ?? ''),
        createdAt: r.createdAt ? new Date(String(r.createdAt)).toISOString() : null,
      })),
      meta: { total, page, pageSize, hasMore: start + pageSize < total },
    });
  } catch (err) {
    return serverError(err);
  }
}
