import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

/**
 * Admin-only session guard shared by API routes and middleware.
 *
 * `getServerSessionSafe()` decodes the same JWE that `/api/auth/[...nextauth]`
 * writes with `strategy: 'jwt'`, using the identical secret, so a valid session
 * cookie is accepted. The returned `Session` carries `id`, `role` and `isAdmin`
 * forwarded by the `jwt` + `session` callbacks in `lib/auth.ts`.
 */

/**
 * Resolve the current session from the incoming request's cookies.
 * `getToken` reads the JWT out of `req.cookies` and falls back to the raw
 * `cookie` header, so the request is handed over untouched.
 */
async function getServerSessionSafe(request: NextRequest): Promise<Session | null> {
  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  })) as JWT | null;

  if (!token) return null;

  const session: Session = {
    user: {
      id: (token.id as string) ?? '',
      name: (token.name as string) ?? null,
      email: (token.email as string) ?? null,
      image: (token.picture as string) ?? null,
      isAdmin: Boolean(token.isAdmin),
      role: (token.role as Session['user']['role']) ?? 'ADMIN',
    },
    expires: token.exp as string,
  };

  return session;
}

export type AdminGuardResult =
  | { session: Session; response?: undefined }
  | { session?: undefined; response: NextResponse };

/**
 * Gate a mutating admin request.
 *
 * Returns `{ response }` with a 401/403 for callers to return verbatim, or
 * `{ session }` when the request is authenticated. The discriminated union
 * makes it impossible to destructure a session without handling the denial.
 */
export async function guardAdmin(request: NextRequest): Promise<AdminGuardResult> {
  const session = await getServerSessionSafe(request);

  if (!session) {
    return {
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }
  if (!session.user?.isAdmin) {
    return {
      response: NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 }),
    };
  }
  return { session };
}

/**
 * Backwards-compatible shape for existing `requireAdmin(req)` call sites.
 * Prefer `guardAdmin`, which cannot be destructured past the denial.
 */
export async function requireAdmin(request: NextRequest) {
  const { session, response } = await guardAdmin(request);
  if (response) {
    return { session: null as Session | null, request, unauthorized: true, forbidden: false };
  }
  return { session: session!, request, unauthorized: false, forbidden: false };
}

export async function requireAdminResponse(request: NextRequest) {
  const { session, response } = await guardAdmin(request);
  if (response) return response;
  return { session: session!, request };
}
