import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

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

  // If the user is NOT authenticated and tries to access protected pages,
  // redirect them to the login page.
  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile = pathname.includes('.'); // e.g. /favicon.ico, /aegislogo.png

  if (!token && !isApiRoute && !isStaticFile && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all paths except api, _next/static, _next/image, and favicon.ico
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
