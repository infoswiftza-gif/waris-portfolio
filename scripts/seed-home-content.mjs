import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import mongo from '@prisma/orm-mongo/runtime';

/**
 * Seed the collections that back the home page.
 *
 *   node scripts/seed-home-content.mjs
 *   node scripts/seed-home-content.mjs --reset
 *
 * The rows come from `lib/home-defaults.json`, which is the same file
 * `lib/cms/home.ts` falls back to, so the home page shows this content even
 * before the seed has ever run.
 *
 * By default the script is an idempotent upsert — it matches projects by
 * `slug`, experience rows by `year` + `title` and stack rows by
 * `category` + `name`, and only inserts what is missing or updates what
 * changed. Anything it does not recognise is left alone, so edits made in the
 * admin panel survive a re-run.
 *
 * `--reset` first deletes every row in `projects`, `experience` and
 * `stack_items`. Use it to throw away local edits and go back to the canonical
 * content in one go.
 */

const RESET = process.argv.includes('--reset');

const DATABASE_URL = process.env.DATABASE_URL ?? '';

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.');
  process.exit(1);
}

const contractJson = JSON.parse(
  fs.readFileSync(path.resolve('prisma', 'contract.json'), 'utf8'),
);
const defaults = JSON.parse(
  fs.readFileSync(path.resolve('lib', 'home-defaults.json'), 'utf8'),
);

const db = mongo({ contractJson, url: DATABASE_URL });

const now = new Date();
const stamp = { createdAt: now, updatedAt: now };

/** `where()` only does strict equality, so a compound key is compared in JS. */
const matches = (row, fields) => Object.entries(fields).every(([key, value]) => String(row[key] ?? '') === String(value ?? ''));

async function upsert(collection, rows, key) {
  let inserted = 0;
  let updated = 0;

  const existing = await db.orm[collection].limit(9999).all();

  for (const row of rows) {
    const found = existing.find((candidate) => matches(candidate, key(row)));
    if (found) {
      await db.orm[collection].where({ _id: String(found._id) }).update({ ...row, updatedAt: now });
      updated += 1;
    } else {
      await db.orm[collection].create({ ...row, ...stamp });
      inserted += 1;
    }
  }

  console.log(`  ${collection}: ${inserted} inserted, ${updated} updated`);
  return { inserted, updated };
}

async function main() {
  await db.connect({ url: DATABASE_URL });
  console.log(`Seeding home page content${RESET ? ' (--reset)' : ''}…`);

  if (RESET) {
    for (const collection of ['projects', 'experience', 'stack_items']) {
      const rows = await db.orm[collection].limit(9999).all();
      for (const row of rows) {
        await db.orm[collection].where({ _id: String(row._id) }).delete();
      }
      console.log(`  ${collection}: cleared ${rows.length} row(s)`);
    }
  }

  await upsert('projects', defaults.projects, (row) => ({ slug: row.slug }));
  await upsert('experience', defaults.experience, (row) => ({ year: row.year, title: row.title }));
  await upsert('stack_items', defaults.stack, (row) => ({ category: row.category, name: row.name }));

  const counts = await Promise.all(
    ['projects', 'experience', 'stack_items'].map(async (collection) => {
      const rows = await db.orm[collection].limit(9999).all();
      return `${collection}=${rows.length}`;
    }),
  );
  console.log(`Done. ${counts.join('  ')}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
