import { NextResponse } from 'next/server';

import { auth } from '@/auth';

const PUBLIC_PATHS = ['/', '/login'];
const SESSION_COOKIE_NAMES = ['__Secure-next-auth.session-token', 'next-auth.session-token'];

const matchesPath = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isPortalRoute = matchesPath(pathname, '/portal');
  const isAdminRoute = matchesPath(pathname, '/admin');
  const requiresAuth = isPortalRoute || isAdminRoute;

  if (isApiAuthRoute || isPublic || !requiresAuth) {
    if (req.auth && pathname === '/login') {
      return NextResponse.redirect(new URL('/portal', nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    const redirectUrl = new URL('/login', nextUrl.origin);
    const destination = pathname + nextUrl.search;
    redirectUrl.searchParams.set('callbackUrl', destination);

    const hasStaleSession = SESSION_COOKIE_NAMES.some((name) => req.cookies.get(name));
    if (hasStaleSession) {
      redirectUrl.searchParams.set('session', 'expired');
    }

    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminRoute && req.auth.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/portal', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
