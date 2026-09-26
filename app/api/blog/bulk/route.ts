import { bulkHandler } from '@/lib/cms/bulk-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/blog/bulk — `{ ids: string[], action: 'delete' | 'publish' | 'unpublish' }`.
 * Admin only. Writes one audit row for the whole batch.
 */
export const POST = bulkHandler('blog');
