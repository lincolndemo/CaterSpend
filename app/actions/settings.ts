'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { parseBudgetForm, type ActionState } from '@/lib/validation';

export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseBudgetForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { supabase, userId } = await requireUser();
  const { error, count } = await supabase
    .from('profiles')
    .update(
      { business_name: parsed.value.business_name, monthly_budget: parsed.value.monthly_budget },
      { count: 'exact' },
    )
    .eq('id', userId);
  if (error) return { ok: false, error: 'Could not save your settings. Try again.' };

  // An UPDATE that matches no row is not a PostgREST error — it returns 204 with a zero count.
  // A missing profiles row is the worst case here, because the whole app keys off it, so it must
  // not come back as "Saved."
  if (!count) return { ok: false, error: 'Could not save your settings. Try again.' };

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { ok: true };
}
