import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/redirects';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  // `next` is attacker-controlled query input concatenated onto our own origin, and string
  // concatenation is not path joining: `next=@evil.com` yields `https://our.domain@evil.com`, which
  // every URL parser reads as userinfo `our.domain` against host evil.com. safeNextPath accepts
  // only a same-origin relative path. See lib/redirects.ts for the full set of shapes it refuses.
  const next = safeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=confirm`);
}
