import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

// API routes that do NOT require authentication
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/logout'];

export function middleware(request: NextRequest) {
  // Sync Supabase cookies and refresh sessions
  const supabaseResponse = createClient(request);

  const token = request.cookies.get('aegis_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // If the user is authenticated and tries to access the login page,
  // redirect them to the homepage.
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const isStaticFile = pathname.includes('.');
  const isAuthApiRoute = PUBLIC_API_ROUTES.some(r => pathname.startsWith(r));

  // Block unauthenticated access to API routes (except public auth endpoints)
  if (!token && pathname.startsWith('/api') && !isAuthApiRoute) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // If the user is NOT authenticated and tries to access protected pages,
  // redirect them to the login page.
  if (!token && !pathname.startsWith('/api') && !isStaticFile && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all paths except _next/static, _next/image, and favicon.ico
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
