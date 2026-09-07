'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
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
  redirect('/');
}

export async function signUp(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { email, password } = creds(fd);
  const businessName = String(fd.get('business_name') ?? '').trim();
  if (!email || !password) return { ok: false, error: 'Enter your email and password.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { business_name: businessName || null },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true, error: undefined };
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
