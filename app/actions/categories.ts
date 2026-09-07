'use server';

import { revalidatePath } from 'next/cache';
import { ERRORS, parseCategoryForm, type ActionState } from '@/lib/validation';
import { CUSTOM_CATEGORY_COLORS, DEMO_USER_ID, demoId, store, touch } from '@/lib/demo-store';
import type { Category } from '@/lib/types';

function refresh() {
  revalidatePath('/settings');
  revalidatePath('/expenses');
  revalidatePath('/');
}

export async function createCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseCategoryForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const name = parsed.value.name;
  // Mirrors the schema's `unique (user_id, lower(btrim(name)))` index.
  const duplicate = store.categories.some((c) => c.name.trim().toLowerCase() === name.toLowerCase());
  if (duplicate) return { ok: false, error: ERRORS.duplicateCategory };

  const category: Category = {
    id: demoId('cat'),
    user_id: DEMO_USER_ID,
    name,
    is_builtin: false,
    color_light: CUSTOM_CATEGORY_COLORS.light,
    color_dark: CUSTOM_CATEGORY_COLORS.dark,
    sort_order: 100,
    created_at: touch(),
  };
  store.categories.push(category);

  refresh();
  return { ok: true };
}

export async function deleteCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: 'Could not remove that category.' };

  const category = store.categories.find((c) => c.id === id);
  if (!category) return { ok: false, error: 'Could not remove that category.' };

  // Built-in categories cannot be deleted (mirrors the schema's guarded delete policy).
  if (category.is_builtin) return { ok: false, error: 'Could not remove that category.' };

  // Mirrors the `on delete restrict` FK from expenses to categories.
  const inUse = store.expenses.some((e) => e.category_id === id);
  if (inUse) return { ok: false, error: ERRORS.categoryInUse };

  const index = store.categories.findIndex((c) => c.id === id);
  store.categories.splice(index, 1);

  refresh();
  return { ok: true };
}
