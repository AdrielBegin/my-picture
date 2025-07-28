// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import { login } from '@/utils/auth/login';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const token = await login(email, password);

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development',
      maxAge: 60 * 60 * 24, 
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro desconhecido' }, { status: 500 });
  }
}
