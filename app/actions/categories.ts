'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { wroteNoRows } from '@/lib/data';
import { ERRORS, parseCategoryForm, type ActionState } from '@/lib/validation';
import { CUSTOM_CATEGORY_COLORS } from '@/lib/types';

function refresh() {
  revalidatePath('/settings');
  revalidatePath('/expenses');
  revalidatePath('/dashboard');
}

export async function createCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseCategoryForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from('categories').insert({
    user_id: userId,
    name: parsed.value.name,
    is_builtin: false,
    color_light: CUSTOM_CATEGORY_COLORS.light,
    color_dark: CUSTOM_CATEGORY_COLORS.dark,
    sort_order: 100,
  });

  if (error) {
    if (error.code === '23505') return { ok: false, error: ERRORS.duplicateCategory };
    return { ok: false, error: 'Could not add that category. Try again.' };
  }

  refresh();
  return { ok: true };
}

export async function deleteCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: ERRORS.categoryNotRemoved };

  const { supabase } = await requireUser();
  const { error, count } = await supabase.from('categories').delete({ count: 'exact' }).eq('id', id);

  if (error) {
    if (error.code === '23503') return { ok: false, error: ERRORS.categoryInUse };
    return { ok: false, error: ERRORS.categoryNotRemoved };
  }

  // Built-in categories are protected by the `categories_delete` RLS policy (`not is_builtin`):
  // a blocked delete matches zero rows rather than raising an error. See `wroteNoRows` for why
  // only a definite zero qualifies.
  if (wroteNoRows(count)) return { ok: false, error: ERRORS.categoryNotRemoved };

  refresh();
  return { ok: true };
}
