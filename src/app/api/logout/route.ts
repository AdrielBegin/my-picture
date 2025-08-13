import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Para apagar o cookie, você seta ele com valor vazio e maxAge 0
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    maxAge: 0,
    path: '/',
  });

  return response;
}
