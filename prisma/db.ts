import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongo from '@prisma/orm-mongo/runtime';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Contract } from './contract.d';

// Load the compiled contract. The `with { type: 'json' }` import syntax is not
// resolvable by Next.js/webpack at build time, so we read the file at runtime
// with fs and parse it.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractJsonRaw = fs.readFileSync(
  path.resolve(__dirname, 'contract.json'),
  'utf8'
);
const contractJson = JSON.parse(contractJsonRaw);

/**
 * Prisma 8 MongoDB client singleton.
 *
 * The contract is bound at runtime. `cms.orm.<Model>` is the query builder,
 * `cms.query.<Model>` emits the lowered MongoDB pipeline, and `cms.connect(...)`
 * resolves the live driver when a request/process starts.
 */
export const cms = mongo({
  contractJson,
  url: process.env.DATABASE_URL ?? '',
});

declare global {
  // eslint-disable-next-line no-var
  var __CMS_DB__: typeof cms;
}

if (process.env.NODE_ENV !== 'production') {
  globalThis.__CMS_DB__ = cms;
}

/**
 * Request-scoped database access.
 *
 * `connect()` throws `DRIVER.ALREADY_CONNECTED` when the driver is already
 * bound, so it is invoked at most once per process and the resulting promise
 * is reused. Call this inside every route/page so Prisma 8 connects once and
 * reuses the runtime for the whole request.
 */
let connectPromise: Promise<unknown> | null = null;

export async function cmsDb() {
  if (!connectPromise) {
    connectPromise = cms.connect({ url: process.env.DATABASE_URL ?? '' });
  }
  try {
    await connectPromise;
  } catch (err) {
    connectPromise = null;
    throw err;
  }
  return cms;
}

export type PrismaDb = typeof cms;

export type { Contract };
