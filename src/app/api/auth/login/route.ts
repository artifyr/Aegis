import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.AUTH_USER;
    const validPassword = process.env.AUTH_PASS;
    
    const validUsername2 = process.env.AUTH_USER_2;
    const validPassword2 = process.env.AUTH_PASS_2;
    
    const isEnvConfigured = !!(validUsername && validPassword);

    if (!isEnvConfigured) {
      return NextResponse.json(
        { success: false, message: 'Authentication is not configured on the server.' },
        { status: 500 }
      );
    }

    const isPrimaryValid = username === validUsername && password === validPassword;
    // Only check secondary if it's configured
    const isSecondaryValid = !!(validUsername2 && validPassword2) && username === validUsername2 && password === validPassword2;

    if (isPrimaryValid || isSecondaryValid) {
      // Create response and set cookie
      const response = NextResponse.json({ 
        success: true
      });
      response.cookies.set({
        name: 'aegis_auth_token',
        value: 'authenticated_aegis_session',
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
