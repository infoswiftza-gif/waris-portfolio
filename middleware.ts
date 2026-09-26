import { withAuth } from 'next-auth/middleware';

/**
 * Route protection for the admin dashboard.
 *
 * The API routes under `/api/*` verify the session themselves via
 * `guardAdmin()` in `lib/admin.ts`; this middleware gates the dashboard pages
 * so an unauthenticated visitor is redirected to the sign-in screen instead of
 * rendering an empty admin shell.
 *
 * `/admin/login` is excluded from the matcher, otherwise redirecting an
 * unauthenticated visitor there would loop.
 */
export default withAuth({
  callbacks: {
    authorized: ({ token }) => Boolean(token),
  },
  pages: {
    signIn: '/admin/login',
  },
});

export const config = {
  /**
   * `/admin/((?!login).*)` requires a trailing path segment, so the bare
   * `/admin` never matched — and `/admin` is exactly where the nav points, so
   * the dashboard was reachable only *after* signing in, and the sign-in
   * redirect landed on a 404. Listing both forms fixes it:
   *
   *   ['/admin', '/admin/((?!login).*)']
   *
   * The second entry keeps `/admin/login` (and anything under it) open so an
   * unauthenticated visitor can actually sign in, and excludes `login` only
   * rather than the whole `(auth)` route group, since route groups do not
   * appear in the URL.
   */
  matcher: ['/admin', '/admin/((?!login).*)'],
};
