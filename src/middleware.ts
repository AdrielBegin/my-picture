// src/app/middleware/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/auth/verify-token';

export function middleware(request: NextRequest) {
  
  const token = request.cookies.get('token')?.value;  
  const isAuth = token && verifyToken(token); 
  const isProtectedPath = request.nextUrl.pathname.startsWith('/routes/dashboard');  
  
  if (isProtectedPath && !isAuth) {
    return NextResponse.redirect(new URL('/routes/login', request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ['/routes/dashboard/:path*'],
};