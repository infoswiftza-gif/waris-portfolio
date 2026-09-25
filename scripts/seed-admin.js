/**
 * PRISMA SEED — create the initial admin user.
 *
 * Run after defining DATABASE_URL and NEXTAUTH_SECRET:
 *
 *   node scripts/seed-admin.js
 *
 * Environment:
 *   ADMIN_EMAIL   (required)
 *   ADMIN_PASSWORD (required)
 *   ADMIN_NAME    (optional, defaults to ADMIN_EMAIL local-part)
 *
 * The password is hashed with `bcryptjs` (pure-JS bcrypt that works in Node
 * and on Vercel Edge).  The created document is then readable by the
 * Credentials provider in `lib/auth.ts`.
 */

import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import bcrypt from 'bcryptjs';
import { cms } from '../lib/prisma';

// 1. Validate the required env vars.
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_NAME?.trim();

if (!email) {
  console.error('ADMIN_EMAIL is required.');
  console.error(
    'Set it and run again, e.g.\n  ADMIN_EMAIL=admin@waris.dev ADMIN_PASSWORD=super-secret node scripts/seed-admin.js',
  );
  process.exit(1);
}

if (!password || password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

// 2. Connect to MongoDB via Prisma 8.
const uri = process.env.DATABASE_URL ?? '';
const client = new (
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('mongodb').MongoClient
)(uri);

/** Hash the password with bcryptjs. */
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/** Seed if the admin doesn't already exist. */
async function main() {
  await client.connect();
  const db = client.db();
  const admins = db.collection('admins');

  const existing = await admins.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    return;
  }

  const passwordHash = await hashPassword(password);
  const name = fullName || email.split('@')[0];

  await admins.insertOne({
    email,
    passwordHash,
    fullName: name,
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Created admin:', email);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
