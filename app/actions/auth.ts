'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { resolveSiteOrigin } from '@/lib/site-url';
import type { ActionState } from '@/lib/validation';

function creds(fd: FormData) {
  const email = String(fd.get('email') ?? '').trim();
  const password = String(fd.get('password') ?? '');
  return { email, password };
}

export async function signIn(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { email, password } = creds(fd);
  if (!email || !password) return { ok: false, error: 'Enter your email and password.' };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: 'That email and password do not match.' };

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { email, password } = creds(fd);
  const businessName = String(fd.get('business_name') ?? '').trim();
  if (!email || !password) return { ok: false, error: 'Enter your email and password.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

  // Derived from the request being served, not from an environment variable somebody has to
  // remember to set. Getting this wrong is invisible: the confirmation email goes out addressed to
  // an origin that is not this deployment, the user clicks a dead link, the account stays
  // unconfirmed, and sign-in then refuses it with nothing logged anywhere.
  const origin = resolveSiteOrigin(await headers());

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { business_name: businessName || null },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true, error: undefined };
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  // Not thrown: @supabase/ssr clears the session cookies through setAll regardless of what the
  // auth server says, so this browser is signed out either way, and an already-expired session
  // makes signOut fail with nothing actually wrong. Log it so a systematic failure is visible.
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[signOut] revoke failed:', error.message);
    // One auth-js path leaves the session intact: `_useSession` fails while the access token is
    // still valid, so the local session is never removed and no cookie is cleared. The user then
    // lands on /login, the middleware finds a live session, and bounces them straight back to the
    // dashboard still signed in — a sign-out button that visibly does nothing. Clearing the
    // cookies here makes the outcome match what the button says, whatever the auth server did.
    await clearAuthCookies();
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * Deletes Supabase's auth cookies directly.
 *
 * The names are `sb-<project-ref>-auth-token`, optionally chunked with a `.0`/`.1` suffix when the
 * token exceeds the per-cookie size limit. Matching on the shape rather than composing the name
 * from the project ref means a chunked token, or a stale cookie from a previous project ref, is
 * cleared too.
 */
async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  for (const { name } of store.getAll()) {
    if (/^sb-.+-auth-token(\.\d+)?$/.test(name)) store.delete(name);
  }
}
