import { NextResponse } from 'next/server';

/**
 * Next.js Route Protection Middleware
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
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/auth';

  // ── Redirect unauthenticated users away from protected routes ──────────────
  if (isProtectedRoute && !accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // ── Redirect authenticated users away from the auth page ──────────────────
  if (isAuthRoute && accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all routes except:
   *   - Next.js internals (_next/static, _next/image, favicon, etc.)
   *   - Public static files (images, fonts, etc.)
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|Cognify-Logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)$).*)',
  ],
};
