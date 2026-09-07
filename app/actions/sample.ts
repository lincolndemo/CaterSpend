'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { buildSampleData } from '@/lib/sample-data';
import { parseDateLocal, todayISO } from '@/lib/dates';

function refresh() {
  revalidatePath('/dashboard');
  revalidatePath('/jobs');
  revalidatePath('/expenses');
  revalidatePath('/income');
}

function shiftDays(iso: string, days: number): string {
  const d = parseDateLocal(iso);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Fills an empty account with four months of believable records, once.
 *
 * The guard is the point: the button only renders on an account with nothing in it, but a form POST
 * can be replayed from the browser's history, and a second run would double every figure on the
 * dashboard. Counting first makes a replay a no-op rather than a mess the user has to clean up by
 * hand. It is not a lock — two simultaneous submissions could both pass the count — but the only
 * way to send two is to race yourself, and the cost of losing that race is duplicate sample rows a
 * user can delete, not corrupted real data.
 */
export async function loadSampleData(): Promise<void> {
  const { supabase, userId } = await requireUser();

  const [expenseCount, incomeCount, jobCount] = await Promise.all([
    supabase.from('expenses').select('id', { count: 'exact', head: true }),
    supabase.from('income').select('id', { count: 'exact', head: true }),
    supabase.from('jobs').select('id', { count: 'exact', head: true }),
  ]);
  if ((expenseCount.count ?? 0) + (incomeCount.count ?? 0) + (jobCount.count ?? 0) > 0) return;

  const today = todayISO();
  const sample = buildSampleData(today);

  const { data: insertedJobs, error: jobError } = await supabase
    .from('jobs')
    .insert(
      sample.jobs.map((j) => ({
        user_id: userId,
        name: j.name,
        client: j.client,
        event_date: shiftDays(today, j.eventOffsetDays),
        quoted_amount: j.quoted_amount,
        notes: null,
      })),
    )
    .select();
  if (jobError || !insertedJobs) throw new Error(jobError?.message ?? 'Could not create sample jobs.');

  const jobIdByName = new Map(insertedJobs.map((j) => [j.name, j.id]));
  const jobIdByKey = new Map(sample.jobs.map((j) => [j.key, jobIdByName.get(j.name) ?? null]));

  // Categories are matched by name against the user's own rows, which the signup trigger seeded.
  // Anything that fails to match is dropped rather than inserted with a null category_id, which the
  // schema rejects anyway.
  const { data: categories } = await supabase.from('categories').select('id, name');
  const categoryIdByName = new Map((categories ?? []).map((c) => [c.name, c.id]));

  const expenseRows = sample.expenses
    .map((e) => ({
      user_id: userId,
      date: e.date,
      amount: e.amount,
      description: e.description,
      category_id: categoryIdByName.get(e.categoryName) ?? null,
      payment_method: e.payment_method,
      job_id: e.jobKey ? (jobIdByKey.get(e.jobKey) ?? null) : null,
      notes: null,
    }))
    .filter((row): row is typeof row & { category_id: string } => row.category_id !== null);

  const incomeRows = sample.income.map((i) => ({
    user_id: userId,
    date: i.date,
    amount: i.amount,
    description: i.description,
    job_id: jobIdByKey.get(i.jobKey) ?? null,
    source: i.source,
  }));

  const [{ error: expenseError }, { error: incomeError }] = await Promise.all([
    supabase.from('expenses').insert(expenseRows),
    supabase.from('income').insert(incomeRows),
  ]);
  if (expenseError || incomeError) {
    throw new Error(expenseError?.message ?? incomeError?.message ?? 'Could not create sample records.');
  }

  refresh();
}
