'use server';

import { revalidatePath } from 'next/cache';
import { parseJobForm, type ActionState } from '@/lib/validation';
import { DEMO_USER_ID, demoId, store, touch } from '@/lib/demo-store';
import type { Job } from '@/lib/types';

function refresh() {
  revalidatePath('/');
  revalidatePath('/jobs');
  revalidatePath('/expenses');
  revalidatePath('/income');
}

export async function createJob(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseJobForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const now = touch();
  const job: Job = {
    id: demoId('job'),
    user_id: DEMO_USER_ID,
    ...parsed.value,
    created_at: now,
    updated_at: now,
  };
  store.jobs.push(job);

  refresh();
  return { ok: true };
}

export async function updateJob(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: 'Could not save that job. Try again.' };

  const parsed = parseJobForm(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const existing = store.jobs.find((j) => j.id === id);
  if (!existing) return { ok: false, error: 'Could not save that job. Try again.' };

  Object.assign(existing, parsed.value, { updated_at: touch() });

  refresh();
  return { ok: true };
}

export async function deleteJob(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '');
  if (!id) return;

  const index = store.jobs.findIndex((j) => j.id === id);
  if (index === -1) return;
  store.jobs.splice(index, 1);

  // The schema's `on delete set null` FK detaches expenses and income
  // rather than deleting them — reproduce that here.
  for (const expense of store.expenses) {
    if (expense.job_id === id) {
      expense.job_id = null;
      expense.updated_at = touch();
    }
  }
  for (const income of store.income) {
    if (income.job_id === id) {
      income.job_id = null;
      income.updated_at = touch();
    }
  }

  refresh();
}
