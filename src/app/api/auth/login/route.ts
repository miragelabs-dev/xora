import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const response = await fetch('http://localhost:4000/_chopin/login');

    if (!response.ok) {
      return NextResponse.json({ error: 'Login failed' }, { status: 400 });
    }

    const data = await response.json();

    const res = NextResponse.redirect(new URL('/home', request.url))

    res.cookies.set('chopin_jwt', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });

    return res;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 