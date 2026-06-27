import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    // Define route types
    const adminRoutes = ['/admin'];
    const protectedRoutes = ['/account', '/orders', '/checkout', '/payment-success'];
    const authRoutes = ['/login', '/signup'];
    const publicRoutes = ['/', '/products', '/pricing', '/contact', '/track-order', '/banned'];

    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.includes(pathname);
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    // Admin routes - highest priority
    if (isAdminRoute) {
      if (!user) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!userData?.is_admin) {
        return NextResponse.redirect(new URL('/account', request.url));
      }

      return response;
    }

    // Protected routes
    if (isProtectedRoute) {
      if (!user) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if banned
      const { data: userData } = await supabase
        .from('users')
        .select('is_banned')
        .eq('id', user.id)
        .single();

      if (userData?.is_banned) {
        return NextResponse.redirect(new URL('/banned', request.url));
      }

      return response;
    }

    // Auth routes - redirect to account if already logged in
    if (isAuthRoute && user) {
      // Check if banned
      const { data: userData } = await supabase
        .from('users')
        .select('is_banned')
        .eq('id', user.id)
        .single();

      if (userData?.is_banned) {
        return NextResponse.redirect(new URL('/banned', request.url));
      }

      return NextResponse.redirect(new URL('/account', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};