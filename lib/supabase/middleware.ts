import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

// Prefix matches: these cover their own sub-paths (e.g. /auth/callback).
const PUBLIC_PREFIXES = ['/login', '/signup', '/auth'];
// Exact matches only. '/' is the public marketing landing page; it cannot go in
// PUBLIC_PREFIXES because a startsWith('/') test would make every route public.
const PUBLIC_EXACT = ['/'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // `createServerClient` throws on a missing URL or key, and this runs on every request, so an
  // unset environment variable does not break sign-in — it returns 500 for the entire site,
  // marketing page included, with `MIDDLEWARE_INVOCATION_FAILED` and no hint as to which variable.
  // Passing through instead keeps the public pages up and confines the failure to the routes that
  // genuinely need a database, where the error boundary can say so.
  if (!url || !anonKey) {
    console.error(
      '[middleware] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. ' +
        'Set both in the deployment environment and redeploy; no route that needs a session will work until then.',
    );
    return response;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    PUBLIC_EXACT.includes(path) || PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Signed in, so the landing page and the auth screens have nothing to offer: send them
  // to the dashboard instead.
  if (user && (path === '/' || path === '/login' || path === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
