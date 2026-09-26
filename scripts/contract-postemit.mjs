/**
 * Post-process `prisma contract emit`.
 *
 * The installed @prisma/orm-mongo RC writes its artifacts as
 * `prisma/schema.json` + `prisma/schema.d.ts`, but the documented (and
 * long-established) names for this repo are `prisma/contract.json` +
 * `prisma/contract.d.ts` -- that is what `prisma/db.ts` binds, what
 * `next.config.mjs` force-includes in the file trace, and what
 * `scripts/seed-home-content.mjs` loads. Without this step the emit
 * silently updates a file nobody reads, so adding a model to
 * `prisma/schema.ts` appears to do nothing at runtime.
 *
 * Wired into `npm run contract:emit`, so the artifacts the app imports are
 * always the ones the toolchain just produced.
 */
import { existsSync, renameSync } from 'node:fs';
import path from 'node:path';

const pairs = [
  ['schema.json', 'contract.json'],
  ['schema.d.ts', 'contract.d.ts'],
];

const dir = path.resolve('prisma');
let moved = 0;

for (const [from, to] of pairs) {
  const src = path.join(dir, from);
  const dest = path.join(dir, to);

  if (!existsSync(src)) {
    console.log(`contract-postemit: ${from} not emitted, leaving ${to} untouched`);
    continue;
  }

  // renameSync overwrites on Windows, so the previous artifact is replaced.
  renameSync(src, dest);
  console.log(`contract-postemit: ${from} -> ${to}`);
  moved += 1;
}

console.log(`contract-postemit: ${moved} artifact(s) renamed into place`);
