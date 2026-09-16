import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/about',
  '/blog',
  '/compliance',
  '/contact',
  '/countries',
  '/customers',
  '/faq',
  '/integrations',
  '/pricing',
  '/privacy',
  '/products',
  '/request-demo',
  '/resources',
  '/reviews',
  '/solutions',
  '/terms',
];

const APP_PREFIX = '/dashboard';

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/countries/')) return true;
  if (pathname.startsWith('/products/')) return true;
  if (pathname.startsWith('/solutions/')) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('soko_token')?.value;

  const isAppRoute = pathname.startsWith(APP_PREFIX) ||
    pathname === '/pos' ||
    pathname === '/sales' ||
    pathname === '/orders' ||
    pathname === '/returns' ||
    pathname === '/shifts' ||
    pathname === '/products' ||
    pathname === '/inventory' ||
    pathname === '/customers' ||
    pathname === '/suppliers' ||
    pathname === '/purchasing' ||
    pathname === '/accounting' ||
    pathname === '/invoices' ||
    pathname === '/expenses' ||
    pathname === '/receivables' ||
    pathname === '/payables' ||
    pathname === '/analytics' ||
    pathname === '/reports' ||
    pathname === '/settings' ||
    pathname === '/help';

  if (isAppRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
