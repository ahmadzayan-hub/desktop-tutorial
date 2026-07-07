import { NextRequest, NextResponse } from 'next/server';

// Lightweight auth gate. Full HMAC verification happens server-side in
// lib/auth (Node runtime); middleware only checks cookie presence/shape to
// route unauthenticated visitors to /login.
const PUBLIC_PATHS = [
  '/login',
  '/install',
  '/api/auth/login',
  '/manifest.json',
  '/sw.js',
  '/icon',
  '/robots.txt',
  '/llms.txt',
  '/sitemap.xml',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/q/') // public customer quote view (token-protected)
  ) {
    return NextResponse.next();
  }
  const token = req.cookies.get('bsp_session')?.value;
  if (!token || !token.includes('.')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
