import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/reset-password',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/community-guidelines',
    '/auth/callback',
    '/auth/update-password',
    '/api/og',
    '/api/og/trade-card',
    '/sitemap.xml',
    '/robots.txt',
];

// Routes that start with these prefixes are public
const PUBLIC_PREFIXES = [
    '/api/cron',
    '/api/market',
    '/api/stock',  // Stock profile data - public for SEO
    '/learn',      // Trading Academy - public for SEO
    '/_next',
    '/favicon',
    '/icons',
];

function isPublicRoute(pathname: string): boolean {
    // Check exact matches
    if (PUBLIC_ROUTES.includes(pathname)) return true;

    // Check prefixes
    for (const prefix of PUBLIC_PREFIXES) {
        if (pathname.startsWith(prefix)) return true;
    }

    // Stock pages are public (SEO)
    if (pathname.startsWith('/stock/')) return true;

    // Static files are public (includes verification files like yandex_*.html)
    if (pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|js|css|html|txt|xml)$/)) return true;

    return false;
}

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Handle Domain Redirects (ticko.se -> tickomarkets.com)
    // We check the 'host' header because request.nextUrl.hostname can be 'localhost' in some environments
    const host = request.headers.get('host') || '';
    const isOldDomain = host.includes('ticko.se');

    if (isOldDomain) {
        const url = new URL(request.url);
        url.hostname = 'tickomarkets.com';
        url.port = ''; // Ensure standard ports for production
        url.protocol = 'https:';
        url.pathname = '/'; // Redirect everything to homepage
        url.search = ''; // Clear query params for a clean slate

        return NextResponse.redirect(url);
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Get the user session
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname;

    // If the route is public, allow access
    if (isPublicRoute(pathname)) {
        return response;
    }

    // If user is not logged in and trying to access protected route, redirect to login
    if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname); // Remember where they wanted to go
        return NextResponse.redirect(loginUrl);
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
