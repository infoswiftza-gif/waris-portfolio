import { bulkHandler } from '@/lib/cms/bulk-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/stack/bulk — `{ ids: string[], action: 'delete' }`.
 *
 * Stack items are always published, so only `delete` is accepted.
 */
export const POST = bulkHandler('stack');
