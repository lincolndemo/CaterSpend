'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { parseExpenseForm, type ActionState } from '@/lib/validation';

function refresh() {
  revalidatePath('/dashboard');
  revalidatePath('/expenses');
  revalidatePath('/jobs');
}

export async function createExpense(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseExpenseForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from('expenses').insert({ ...parsed.value, user_id: userId });
  if (error) return { ok: false, error: 'Could not save that expense. Try again.' };

  refresh();
  return { ok: true };
}

export async function updateExpense(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: 'Could not save that expense. Try again.' };

  const parsed = parseExpenseForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { supabase } = await requireUser();
  const { error } = await supabase.from('expenses').update(parsed.value).eq('id', id);
  if (error) return { ok: false, error: 'Could not save that expense. Try again.' };

  refresh();
  return { ok: true };
}

export async function deleteExpense(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const { supabase } = await requireUser();
  await supabase.from('expenses').delete().eq('id', id);
  refresh();
}
