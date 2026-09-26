import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongo from '@prisma/orm-mongo/runtime';
import { MongoClient } from 'mongodb';
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

const databaseUrl = process.env.DATABASE_URL ?? '';

// Pull the database name out of the connection string's path segment
// (".../cms?retryWrites=..." -> "cms") so we can hand Prisma a pre-built
// MongoClient via the { mongoClient, dbName } binding instead of { url }.
function dbNameFromUrl(url: string): string {
  const match = url.match(/\/([^/?]+)(?:\?|$)/);
  return match?.[1] || 'cms';
}
const dbName = dbNameFromUrl(databaseUrl);

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_CLIENT__: MongoClient | undefined;
}

/**
 * Shared MongoClient, capped to a small pool, reused across invocations
 * within the same serverless container via globalThis.
 *
 * Previously `cms` was constructed with `{ url }`, which lets Prisma 8 open
 * its own MongoClient (default pool size 100) per container. Next.js
 * prefetches every in-viewport <Link>, so loading one page fires several
 * concurrent route requests; if enough of those land on fresh/cold
 * containers at once, each opening a ~100-connection pool, the MongoDB
 * Atlas M0 (free tier) connection ceiling gets exhausted and requests start
 * failing with a 500 — intermittently, since it only happens under bursts
 * of concurrent cold starts. Capping maxPoolSize keeps each container's
 * footprint small enough that this can't happen.
 */
const mongoClient =
  globalThis.__MONGO_CLIENT__ ??
  new MongoClient(databaseUrl, {
    maxPoolSize: 5,
    minPoolSize: 0,
    maxIdleTimeMS: 10_000,
    serverSelectionTimeoutMS: 5_000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__MONGO_CLIENT__ = mongoClient;
}

/**
 * Prisma 8 MongoDB client singleton.
 *
 * The contract is bound at runtime. `cms.orm.<Model>` is the query builder,
 * `cms.query.<Model>` emits the lowered MongoDB pipeline, and `cms.connect(...)`
 * resolves the live driver when a request/process starts.
 */
export const cms = mongo({
  contractJson,
  mongoClient,
  dbName,
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
    connectPromise = cms.connect({ mongoClient, dbName });
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
