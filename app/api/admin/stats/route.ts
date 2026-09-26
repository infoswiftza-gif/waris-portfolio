import type { NextRequest } from 'next/server';

import { guardAdmin } from '@/lib/admin';
import { RESOURCE_LIST } from '@/lib/cms';
import { serverError } from '@/lib/cms/http';
import { cmsDb } from '@/prisma/db';

/**
 * GET /api/admin/stats — dashboard counters + recent activity (admin only).
 *
 * Replaces the old dashboard, which showed a hardcoded number. Counts are read
 * per collection with one capped query each; there is no `count()` in the
 * Prisma 8 Mongo ORM, and these collections hold tens of rows, so filtering the
 * `published` flag in JS over a bounded read is both correct and cheap.
 */

const CAP = 1000;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { response } = await guardAdmin(req);
  if (response) return response;

  try {
    const db = await cmsDb();
    const orm = db.orm as unknown as Record<string, { limit: (n: number) => { all: () => Promise<Record<string, unknown>[]> } }>;

    const resources = await Promise.all(
      RESOURCE_LIST.map(async (def) => {
        const rows = await orm[def.orm].limit(CAP).all();
        const drafts = def.hasPublished ? rows.filter((r) => !r.published).length : 0;
        const published = def.hasPublished
          ? rows.length - drafts
          : rows.length;
        return {
          key: def.key,
          label: def.plural,
          total: rows.length,
          published,
          drafts,
          hasPublished: def.hasPublished,
          publicPath: def.publicPath,
        };
      }),
    );

    // Most recent admin activity. A missing or empty audit collection must not
    // take the whole dashboard down, so this part degrades to an empty list.
    let recent: unknown[] = [];
    try {
      const rows = await orm.audit_log.limit(8).all();
      const at = (r: Record<string, unknown>) =>
        r.createdAt ? new Date(String(r.createdAt)).getTime() : 0;
      recent = [...rows]
        .sort((a, b) => at(b) - at(a))
        .slice(0, 8)
        .map((r) => ({
          id: String(r._id ?? ''),
          action: String(r.action ?? ''),
          resource: String(r.resource ?? ''),
          label: String(r.label ?? ''),
          actor: String(r.actor ?? ''),
          createdAt: r.createdAt ? new Date(String(r.createdAt)).toISOString() : null,
        }));
    } catch {
      recent = [];
    }

    return Response.json({
      ok: true,
      data: {
        resources,
        totals: {
          records: resources.reduce((sum, r) => sum + r.total, 0),
          drafts: resources.reduce((sum, r) => sum + r.drafts, 0),
          published: resources.reduce((sum, r) => sum + r.published, 0),
        },
        recent,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
