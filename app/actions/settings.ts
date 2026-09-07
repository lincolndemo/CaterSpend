'use server';

import { revalidatePath } from 'next/cache';
import { parseBudgetForm, type ActionState } from '@/lib/validation';
import { store, touch } from '@/lib/demo-store';

export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseBudgetForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const businessName = String(fd.get('business_name') ?? '').trim();

  store.profile.business_name = businessName || null;
  store.profile.monthly_budget = parsed.value.monthly_budget;
  store.profile.updated_at = touch();

  revalidatePath('/');
  revalidatePath('/settings');
  return { ok: true };
}
