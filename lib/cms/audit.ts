import { cmsDb } from '@/prisma/db';
import type { Row } from './registry';

/**
 * Append-only audit trail.
 *
 * Every successful admin mutation records who did what to which document, with
 * a JSON snapshot of the fields the request actually touched. Keeping `before`
 * as well as `after` is what makes the trail useful after the fact: a delete
 * leaves `before` as the only remaining copy of the document's state, and an
 * update can be shown as a real field-level diff rather than "someone edited
 * a blog post".
 *
 * Auditing is deliberately best-effort. It must never turn a successful write
 * into a failed request, so every error here is swallowed and logged instead of
 * propagated -- losing an audit row is bad, failing the user's save because of
 * it is worse.
 */

/** Fields worth snapshotting, per resource; anything not listed is not recorded. */
const SNAPSHOT_LIMIT = 2000;

function snapshot(input: Row): string {
  try {
    const text = JSON.stringify(input);
    return text.length > SNAPSHOT_LIMIT ? `${text.slice(0, SNAPSHOT_LIMIT)}…` : text;
  } catch {
    return '{}';
  }
}

export type AuditInput = {
  action: 'create' | 'update' | 'delete' | 'bulk';
  resource: string;
  recordId?: string;
  label?: string;
  actor?: string;
  before?: Row;
  after?: Row;
};

export async function writeAudit(entry: AuditInput): Promise<void> {
  try {
    const db = await cmsDb();
    await db.orm.audit_log.create({
      action: entry.action,
      resource: entry.resource,
      recordId: entry.recordId ? String(entry.recordId) : undefined,
      label: entry.label ?? '',
      actor: entry.actor ?? '',
      before: entry.before ? snapshot(entry.before) : '',
      after: entry.after ? snapshot(entry.after) : '',
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('[cms] audit write failed (continuing):', err instanceof Error ? err.message : err);
  }
}

/**
 * A short human label for a document, used as the audit trail's `label` so the
 * log stays readable after a rename or a delete.
 */
export function labelFor(row: Row, fallback: string) {
  for (const field of ['title', 'name', 'label', 'slug', 'section']) {
    const value = row?.[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
}
