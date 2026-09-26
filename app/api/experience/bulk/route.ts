import { bulkHandler } from '@/lib/cms/bulk-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/experience/bulk — `{ ids: string[], action: 'delete' }`.
 *
 * Timeline entries are always published, so `publish`/`unpublish` are rejected
 * by the handler for this collection rather than silently ignored.
 */
export const POST = bulkHandler('experience');
