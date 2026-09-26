import 'dotenv/config';

import mongo from '@prisma/orm-mongo/runtime';
import { MongoClient } from 'mongodb';
import type { Contract } from './contract.d';

// The compiled contract is imported statically so webpack inlines it into every
// server bundle, so no serverless function has to resolve a file at request
// time.
//
// It used to be read at module-load time with
//   fs.readFileSync(path.resolve(__dirname, 'contract.json'))
// where __dirname came from fileURLToPath(import.meta.url). Webpack rewrites that
// to an absolute path on the build machine (/vercel/path0 on Vercel). That path
// exists while `next build` runs, so the build reported success, but not
// inside a deployed function -- so the read threw ENOENT while the module was
// being imported and every route that touches the database returned 500. Routes
// that never import this module (/robots.txt, /about, /contact) kept working,
// which is what made it look like a partial outage instead of a build problem.
import contractJson from './contract.json';

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
  // eslint-disable-next-line no-var
  var __CMS_DB__: ReturnType<typeof mongo> | undefined;
}

/**
 * Prisma 8 MongoDB client singleton — constructed lazily, inside cmsDb(),
 * not at module top level.
 *
 * `new MongoClient(...)` and `mongo({...})` both throw *synchronously* if
 * given a malformed connection string. Constructing them at module top level
 * means that throw happens the instant this module is imported — before
 * cmsDb()'s own try/catch, and before every page's try/catch around it, ever
 * get a chance to run — turning any DATABASE_URL problem into a guaranteed,
 * uncatchable 500 on every single request. Building both lazily here, on
 * first call, turns the same failure into a normal rejected promise that
 * every caller's existing try/catch already handles.
 *
 * `cms.orm.<Model>` is the query builder, `cms.query.<Model>` emits the
 * lowered MongoDB pipeline, and `cms.connect(...)` resolves the live driver
 * when a request/process starts.
 */
let connectPromise: Promise<unknown> | null = null;
let cmsSingleton: ReturnType<typeof mongo> | null = globalThis.__CMS_DB__ ?? null;
let activeMongoClient: MongoClient | null = globalThis.__MONGO_CLIENT__ ?? null;

export async function cmsDb() {
  if (!cmsSingleton) {
    // Shared MongoClient, capped to a small pool, reused across invocations
    // within the same serverless container via globalThis. Previously `cms`
    // was constructed with `{ url }`, which lets Prisma 8 open its own
    // MongoClient (default pool size 100) per container. Next.js prefetches
    // every in-viewport <Link>, so loading one page fires several concurrent
    // route requests; if enough of those land on fresh/cold containers at
    // once, each opening a ~100-connection pool, the MongoDB Atlas M0
    // (free tier) connection ceiling gets exhausted. Capping maxPoolSize
    // keeps each container's footprint small enough that this can't happen.
    const mongoClient =
      activeMongoClient ??
      new MongoClient(databaseUrl, {
        maxPoolSize: 5,
        minPoolSize: 0,
        maxIdleTimeMS: 10_000,
        serverSelectionTimeoutMS: 5_000,
      });
    activeMongoClient = mongoClient;

    if (process.env.NODE_ENV !== 'production') {
      globalThis.__MONGO_CLIENT__ = mongoClient;
    }

    cmsSingleton = mongo({ contractJson, mongoClient, dbName });

    if (process.env.NODE_ENV !== 'production') {
      globalThis.__CMS_DB__ = cmsSingleton;
    }
  }

  const cms = cmsSingleton;

  /**
   * `connect()` throws `DRIVER.ALREADY_CONNECTED` when the driver is already
   * bound, so it is invoked at most once per process and the resulting
   * promise is reused. Call this inside every route/page so Prisma 8
   * connects once and reuses the runtime for the whole request.
   */
  if (!connectPromise) {
    connectPromise = cms.connect({ mongoClient: activeMongoClient, dbName });
  }
  try {
    await connectPromise;
  } catch (err) {
    connectPromise = null;
    throw err;
  }
  return cms;
}

export const cms = new Proxy({} as ReturnType<typeof mongo>, {
  get(_target, prop) {
    if (!cmsSingleton) {
      throw new Error('Access prisma/db.ts `cms` only after calling cmsDb() at least once.');
    }
    return (cmsSingleton as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type PrismaDb = typeof cms;

export type { Contract };
