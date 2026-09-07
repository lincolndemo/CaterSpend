import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!ANON_KEY) {
  // Failing here names the cause. Without it the first request returns a 401 the tests would report
  // as an RLS denial — the schema looking broken because the runner was misconfigured.
  throw new Error(
    'SUPABASE_ANON_KEY is not set. Start the local stack with `npx supabase start` and export the ' +
      'anon key it prints before running the integration suite.',
  );
}

/**
 * Deliberately untyped (`SupabaseClient`, not `SupabaseClient<Database>`): several tests send values
 * the generated types forbid — a payment method outside the enum, a `user_id` belonging to someone
 * else — precisely to prove the database rejects them. A typed client would refuse to compile the
 * test instead of running it, moving the check to the wrong layer.
 */
export function anonClient(): SupabaseClient {
  return createClient(URL, ANON_KEY!, { auth: { persistSession: false } });
}

export async function newUser() {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = 'password123';
  const client = anonClient();

  const { error: signUpError } = await client.auth.signUp({ email, password });
  if (signUpError) throw signUpError;

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw error ?? new Error('sign in failed');

  return { client, userId: data.user.id, email };
}
