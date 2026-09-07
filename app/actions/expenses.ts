'use server';

import { revalidatePath } from 'next/cache';
import { parseExpenseForm, type ActionState } from '@/lib/validation';
import { DEMO_USER_ID, demoId, store, touch } from '@/lib/demo-store';
import type { Expense } from '@/lib/types';

function refresh() {
  revalidatePath('/');
  revalidatePath('/expenses');
  revalidatePath('/jobs');
}

export async function createExpense(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseExpenseForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const now = touch();
  const expense: Expense = {
    id: demoId('exp'),
    user_id: DEMO_USER_ID,
    ...parsed.value,
    created_at: now,
    updated_at: now,
  };
  store.expenses.push(expense);

  refresh();
  return { ok: true };
}

export async function updateExpense(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: 'Could not save that expense. Try again.' };

  const parsed = parseExpenseForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const existing = store.expenses.find((e) => e.id === id);
  if (!existing) return { ok: false, error: 'Could not save that expense. Try again.' };

  Object.assign(existing, parsed.value, { updated_at: touch() });

  refresh();
  return { ok: true };
}

export async function deleteExpense(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;

  const index = store.expenses.findIndex((e) => e.id === id);
  if (index !== -1) store.expenses.splice(index, 1);

  refresh();
}
