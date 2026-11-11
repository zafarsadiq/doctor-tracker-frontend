import { NextResponse } from 'next/server';

// Runs on the edge before any page renders: unauthenticated users never reach a protected route.
// The Express API must set an httpOnly cookie named `dt_token` on login (the demo adapter sets a fake one).
export function middleware(req) {
  const authed = req.cookies.has('dt_token');
  const { pathname } = req.nextUrl;
  if (!authed && pathname !== '/login') return NextResponse.redirect(new URL('/login', req.url));
  if (authed && pathname === '/login') return NextResponse.redirect(new URL('/dashboard', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/((?!api|_next|favicon.ico).*)']  }; // /api is proxied to the backend, never redirected
