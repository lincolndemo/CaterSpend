'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { parseIncomeForm, type ActionState } from '@/lib/validation';

function refresh() {
  revalidatePath('/');
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
  const { error } = await supabase.from('income').update(parsed.value).eq('id', id);
  if (error) return { ok: false, error: 'Could not save that income. Try again.' };

  refresh();
  return { ok: true };
}

export async function deleteIncome(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const { supabase } = await requireUser();
  await supabase.from('income').delete().eq('id', id);
  refresh();
}
