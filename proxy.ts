import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Only protect the root and main pages (not api or static assets)
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|ico|svg|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // If going to login page, allow
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('aegis_auth_token');

  // Verify the token (in a real app, this would be a JWT or session validation)
  // For this local prototype, we just check if it exists and matches our expected secret
  if (!token || token.value !== 'authenticated_aegis_session') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
