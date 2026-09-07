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
  const { error, count } = await supabase
    .from('jobs')
    .update(parsed.value, { count: 'exact' })
    .eq('id', id);
  if (error) return { ok: false, error: 'Could not save that job. Try again.' };

  // An UPDATE that matches no row is not a PostgREST error — it returns 204 with a zero count.
  // The row may have been deleted from another tab, or RLS may exclude it. Either way nothing was
  // written, so do not tell the user it was saved.
  if (!count) return { ok: false, error: 'Could not save that job. Try again.' };

  refresh();
  return { ok: true };
}

export async function deleteJob(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const { supabase } = await requireUser();
  // No ActionState channel here (ConfirmButton posts to a void action), so a genuine failure is
  // thrown into app/(app)/error.tsx rather than swallowed. A zero-row delete is deliberately not
  // treated as a failure: the row is already gone, which is what the user asked for.
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  if (error) throw new Error(error.message);
  refresh();
}
