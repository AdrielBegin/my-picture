// src/app/middleware/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/auth/verify-token';

export function middleware(request: NextRequest) {
  
  const token = request.cookies.get('token')?.value;  
  const isAuth = token && verifyToken(token); 
  
  // Definir rotas protegidas que requerem autenticação
  const protectedPaths = [
    '/routes/dashboard',
    '/routes/meus-eventos',
    '/routes/galeria-fotos',
  ];
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath && !isAuth) {
    return NextResponse.redirect(new URL('/routes/login', request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    '/routes/dashboard/:path*',
    '/routes/meus-eventos',
    '/routes/meus-eventos/:path*',
    '/routes/galeria-fotos',
    '/routes/galeria-fotos/:path*',
  ],
};