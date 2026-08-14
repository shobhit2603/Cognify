import { NextResponse } from 'next/server';

/**
 * Next.js Route Protection Proxy
 *
 * Runs on the Edge runtime before every matched request.
 * Strategy: cookie presence check.
 *   - Edge runtime cannot import Node crypto, so we cannot fully verify
 *     the JWT signature here. Instead we check that the `accessToken`
 *     HttpOnly cookie exists (set by the server on login/refresh).
 *   - Full JWT verification + authorization still happens server-side
 *     via the `requireAuth` Express middleware on every API call.
 *   - On cookie expiry, the Axios interceptor on the client will call
 *     /auth/refresh to silently rotate the token before any API request fails.
 *
 * Route map:
 *   Protected: /dashboard and all sub-routes  → redirect to /auth if no cookie
 *   Auth-only: /auth                          → redirect to /dashboard if cookie present
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const isAuthenticated = !!(accessToken || refreshToken);

  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/auth';

  // ── Redirect unauthenticated users away from protected routes ──────────────
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // ── Redirect authenticated users away from the auth page ──────────────────
  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    const nextPath = request.nextUrl.searchParams.get('next') || '/dashboard';
    url.pathname = nextPath;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match only paths that actually need middleware protection/redirection
   */
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*'
  ],
};
