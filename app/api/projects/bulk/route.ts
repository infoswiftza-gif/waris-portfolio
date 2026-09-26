import { bulkHandler } from '@/lib/cms/bulk-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/projects/bulk — `{ ids: string[], action: 'delete' | 'publish' | 'unpublish' }`.
 * Admin only.
 */
export const POST = bulkHandler('projects');
