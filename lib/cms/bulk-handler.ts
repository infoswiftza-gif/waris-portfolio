import type { NextRequest } from 'next/server';

import { bulk as blogBulk } from './blog';
import { bulk as experienceBulk } from './experience';
import { bulk as projectsBulk } from './projects';
import { bulk as stackBulk } from './stack';

/**
 * Generic bulk-action handler shared by `/api/<resource>/bulk`.
 *
 * Each collection's `route.ts` calls `bulkHandler('blog')`; routing by name
 * keeps the action list, the per-id loop, the audit row and the response shape
 * in exactly one place instead of four.
 */
const HANDLERS: Record<string, (req: NextRequest) => Promise<Response>> = {
  blog: blogBulk,
  projects: projectsBulk,
  experience: experienceBulk,
  stack: stackBulk,
};

export function bulkHandler(key: string) {
  const handler = HANDLERS[key];
  if (!handler) {
    // A typo in a route file should fail loudly at build time, not 404 silently.
    throw new Error(`bulkHandler: unknown resource "${key}"`);
  }
  return handler;
}
