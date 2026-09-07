'use server';

import { revalidatePath } from 'next/cache';
import { parseIncomeForm, type ActionState } from '@/lib/validation';
import { DEMO_USER_ID, demoId, store, touch } from '@/lib/demo-store';
import type { Income } from '@/lib/types';

function refresh() {
  revalidatePath('/');
  revalidatePath('/income');
  revalidatePath('/jobs');
}

export async function createIncome(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseIncomeForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const now = touch();
  const income: Income = {
    id: demoId('inc'),
    user_id: DEMO_USER_ID,
    ...parsed.value,
    created_at: now,
    updated_at: now,
  };
  store.income.push(income);

  refresh();
  return { ok: true };
}

export async function updateIncome(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: 'Could not save that income. Try again.' };

  const parsed = parseIncomeForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const existing = store.income.find((i) => i.id === id);
  if (!existing) return { ok: false, error: 'Could not save that income. Try again.' };

  Object.assign(existing, parsed.value, { updated_at: touch() });

  refresh();
  return { ok: true };
}

export async function deleteIncome(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;

  const index = store.income.findIndex((i) => i.id === id);
  if (index !== -1) store.income.splice(index, 1);

  refresh();
}
