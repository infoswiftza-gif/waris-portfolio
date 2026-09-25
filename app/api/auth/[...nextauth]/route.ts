import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth.js handler for `/api/auth/[...nextauth]`.
 *
 * The App Router requires named `GET`/`POST` exports; a bare default export is
 * treated as "no HTTP methods exported" and every request 405s. Binding the
 * single NextAuth handler to both verbs exposes the `csrf`, `session`,
 * `callback/credentials`, `providers` and `signout` actions.
 */

export const runtime = 'nodejs';
export const maxDuration = 30;

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
