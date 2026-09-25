#!/usr/bin/env node
/**
 * Prisma 8 seed entry point (TypeScript).
 *
 * Reads the DATABASE_URL from .env, builds a fresh Prisma 8 runtime bound to
 * the compiled contract, and upserts a single admin document using bcryptjs.
 *
 * Run:
 *   npx tsx prisma/seed.ts
 *
 * Env (copy .env.example → .env.local):
 *   DATABASE_URL        (required)
 *   NEXTAUTH_SECRET     (required)
 *   ADMIN_EMAIL         (required)
 *   ADMIN_PASSWORD      (required)
 *   ADMIN_NAME          (optional)
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL ?? '';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const ADMIN_NAME = process.env.ADMIN_NAME?.trim() ?? '';

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.');
  process.exit(1);
}
if (!NEXTAUTH_SECRET) {
  console.error('NEXTAUTH_SECRET is not set. Copy .env.example to .env.local and fill it in.');
  process.exit(1);
}
if (!ADMIN_EMAIL) {
  console.error('ADMIN_EMAIL is not set.');
  process.exit(1);
}
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

const { mongo } = require('@prisma/orm-mongo/runtime');
import { cms } from '../lib/prisma';

async function main() {
  // Bind the Prisma 8 runtime to the contract.
  const db = mongo({
    contractJson: require('./prisma/contract.json'),
    url: DATABASE_URL,
  });

  // Connect so we can query the DB.
  await db.connect({ url: DATABASE_URL });

  // Hash the password with bcryptjs (pure-JS bcrypt, works in Node + Edge).
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const displayName = ADMIN_NAME || ADMIN_EMAIL.split('@')[0];

  // Check whether the admin already exists.
  const existing = await db.orm.Admin.findFirst({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Admin already exists: ${existing.email} (updated password hash)`);
    await db.close();
    return;
  }

  // Insert the initial admin.  The Credentials provider in lib/auth.ts looks
  // exactly for these fields.
  const admin = await db.orm.Admin.create({
    data: {
      email: ADMIN_EMAIL,
      passwordHash,
      fullName: displayName,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('Seeded admin:', admin.email, `(_id: ${admin._id.toString()})`);
  await db.close();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
