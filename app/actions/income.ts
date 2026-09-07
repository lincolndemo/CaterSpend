'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { wroteNoRows } from '@/lib/data';
import { parseIncomeForm, type ActionState } from '@/lib/validation';

function refresh() {
  revalidatePath('/dashboard');
  revalidatePath('/income');
  revalidatePath('/jobs');
}

export async function createIncome(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseIncomeForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from('income').insert({ ...parsed.value, user_id: userId });
  if (error) return { ok: false, error: 'Could not save that income. Try again.' };

  refresh();
  return { ok: true };
}

export async function updateIncome(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: 'Could not save that income. Try again.' };

  const parsed = parseIncomeForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { supabase } = await requireUser();
  const { error, count } = await supabase
    .from('income')
    .update(parsed.value, { count: 'exact' })
    .eq('id', id);
  if (error) return { ok: false, error: 'Could not save that income. Try again.' };

  // An UPDATE that matches no row is not a PostgREST error — it returns 204 with a zero count.
  // The row may have been deleted from another tab, or RLS may exclude it. Either way nothing was
  // written, so do not tell the user it was saved. See `wroteNoRows` for why only a definite zero
  // qualifies.
  if (wroteNoRows(count)) return { ok: false, error: 'Could not save that income. Try again.' };

  refresh();
  return { ok: true };
}

export async function deleteIncome(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const { supabase } = await requireUser();
  // No ActionState channel here (ConfirmButton posts to a void action), so a genuine failure is
  // thrown into app/(app)/error.tsx rather than swallowed. A zero-row delete is deliberately not
  // treated as a failure: the row is already gone, which is what the user asked for.
  const { error } = await supabase.from('income').delete().eq('id', id);
  if (error) throw new Error(error.message);
  refresh();
}
