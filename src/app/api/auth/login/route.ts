import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.AUTH_USER || 'Zer0';
    const validPassword = process.env.AUTH_PASS || 'Aegis@123';
    const isEnvConfigured = !!(process.env.AUTH_USER && process.env.AUTH_PASS);

    if (username === validUsername && password === validPassword) {
      // Create response and set cookie
      const response = NextResponse.json({ 
        success: true,
        warning: isEnvConfigured ? undefined : "AUTH_USER and AUTH_PASS environment variables are not set in Vercel. Default credentials (Zer0 / Aegis@123) are active."
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
        message: isEnvConfigured 
          ? 'Invalid credentials' 
          : 'Invalid credentials. (AUTH_USER and AUTH_PASS env variables are not configured in Vercel; using fallback credentials: Zer0 / Aegis@123)' 
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
