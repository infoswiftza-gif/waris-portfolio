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
  matcher: ['/admin/((?!login).*)'],
};
