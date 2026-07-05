import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username: string = typeof body.username === 'string' ? body.username.trim() : '';
    const password: string = typeof body.password === 'string' ? body.password : '';
    const isGuest: boolean = body.isGuest === true; // strict equality — no truthy coercion


    const validUsername = process.env.AUTH_USER;
    const validPassword = process.env.AUTH_PASS;
    const guestUsername = process.env.GUEST_USER;
    const guestPassword = process.env.GUEST_PASS;
    
    const isEnvConfigured = !!(validUsername && validPassword);

    if (!isEnvConfigured) {
      return NextResponse.json(
        { success: false, message: 'Authentication is not configured on the server.' },
        { status: 500 }
      );
    }

    const isPrimaryValid = username === validUsername && password === validPassword;
    const isGuestValid = isGuest || (username === guestUsername && password === guestPassword);

    if (isPrimaryValid || isGuestValid) {
      const role = isPrimaryValid ? 'admin' : 'guest';
      // Create response and set cookie
      const response = NextResponse.json({ 
        success: true,
        role: role
      });
      response.cookies.set({
        name: 'aegis_auth_token',
        value: `authenticated_aegis_session_${role}`,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      return response;
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Invalid credentials' 
      },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
