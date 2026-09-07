'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { parseJobForm, type ActionState } from '@/lib/validation';

function refresh() {
  revalidatePath('/dashboard');
  revalidatePath('/jobs');
  revalidatePath('/expenses');
  revalidatePath('/income');
}

export async function createJob(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseJobForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from('jobs').insert({ ...parsed.value, user_id: userId });
  if (error) return { ok: false, error: 'Could not save that job. Try again.' };

  refresh();
  return { ok: true };
}

export async function updateJob(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: 'Could not save that job. Try again.' };

  const parsed = parseJobForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { supabase } = await requireUser();
  const { error } = await supabase.from('jobs').update(parsed.value).eq('id', id);
  if (error) return { ok: false, error: 'Could not save that job. Try again.' };

  refresh();
  return { ok: true };
}

export async function deleteJob(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const { supabase } = await requireUser();
  await supabase.from('jobs').delete().eq('id', id);
  refresh();
}
