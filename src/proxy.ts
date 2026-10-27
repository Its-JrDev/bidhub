import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'bidhub-super-secret-jwt-access-token-key-2026'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('bidhub_access_token')?.value;

  let session: { userId: string; email: string; role: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, ACCESS_SECRET);
      session = payload as any;
    } catch {
      session = null;
    }
  }

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isPrivateRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auctions/new') ||
    pathname.includes('/edit');
  const isAdminRoute = pathname.startsWith('/admin');

  // Unauthenticated -> redirect to /login
  if ((isPrivateRoute || isAdminRoute) && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Non-admin accessing admin -> redirect to /dashboard
  if (isAdminRoute && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Authenticated user accessing /login or /register -> redirect to /dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auctions/new',
    '/auctions/:id/edit',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};

export default proxy;
