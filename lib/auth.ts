import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { cmsDb } from './prisma';

/**
 * Map an incoming HTTP request to a NextAuth session payload.

/**
 * NextAuth.js configuration for a single admin user.
 *
 * - Credentials provider checks `Admin` documents in MongoDB and compares the
 *   submitted password against the stored bcrypt hash.
 * - Session uses `strategy: 'jwt'`, so `session.user` carries `id`, `role` and
 *   `isAdmin` without a second DB round-trip.
 * - `pages.signIn` points at `/admin/login` so unauthenticated users land there.
 */

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email?.trim() || !credentials?.password) {
          return null;
        }

        const db = await cmsDb();
        const email = credentials.email.trim().toLowerCase();
        const admin = await db.orm.admins.where({ email }).first();

        if (!admin) return null;

        const passwordHash = String(admin.passwordHash ?? '');
        if (!passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, passwordHash);

        if (!valid) return null;

        return {
          id: String(admin._id ?? ''),
          email: String(admin.email ?? ''),
          name: String(admin.fullName ?? ''),
          role: admin.role === 'ADMIN' ? 'ADMIN' : 'EDITOR',
          isAdmin: admin.role === 'ADMIN',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'EDITOR';
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
};
