import { NextResponse, type NextRequest } from 'next/server';

/**
 * Protect every route under /admin (except /admin/login and the
 * /api/auth/[...nextauth] API route).
 *
 * NextAuth.js session cookies are HTTP-only, so middleware reads them via
 * `next/headers` and decodes the JWT with the same secret the API routes use.
 * If there is no session, the browser is bounced to /admin/login.
 *
 * `adminlogin` and `[...nextauth]` are excluded so the loop never happens.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never serve the admin area publicly.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { headers: h } = require('next/headers');
    const nativeHeaders = Object.fromEntries((h() as Map<string, string>).entries());

    // Look for the NextAuth session cookie.
    const sessionToken =
      nativeHeaders['next-auth.session-token'] ||
      nativeHeaders['__Secure-next-auth.session-token'];

    if (!sessionToken) {
      const url = new URL('/admin/login', request.nextUrl.origin);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match every page under /admin, but skip the two public-facing routes.
  matcher: ['/admin/:path*'],
};
