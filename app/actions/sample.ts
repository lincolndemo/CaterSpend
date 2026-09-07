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

  const insertedJobIds = insertedJobs.map((j) => j.id);
  const jobIdByName = new Map(insertedJobs.map((j) => [j.name, j.id]));
  const jobIdByKey = new Map(sample.jobs.map((j) => [j.key, jobIdByName.get(j.name) ?? null]));

  // Categories are matched by name against the user's own rows, which the signup trigger seeded.
  // A failed read here would leave an empty map, every expense row would be dropped as
  // uncategorised, and the user would get jobs and income with no spending at all — so it is an
  // abort, not a fallback.
  const { data: categories, error: categoryError } = await supabase.from('categories').select('id, name');
  if (categoryError || !categories) {
    await undo(supabase, insertedJobIds, []);
    throw new Error(categoryError?.message ?? 'Could not read categories.');
  }
  const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

  // A name that matches nothing is dropped rather than sent with a null category_id, which the
  // schema rejects. This only stays unreachable because the seeded categories are `is_builtin` and
  // the RLS policies in 0001_init.sql refuse to update or delete a built-in — if that ever relaxes,
  // a user who renamed "Ingredients" would silently get fewer sample expenses.
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

  const { data: insertedExpenses, error: expenseError } = await supabase
    .from('expenses')
    .insert(expenseRows)
    .select('id');
  if (expenseError || !insertedExpenses) {
    await undo(supabase, insertedJobIds, []);
    throw new Error(expenseError?.message ?? 'Could not create sample expenses.');
  }

  const incomeRows = sample.income.map((i) => ({
    user_id: userId,
    date: i.date,
    amount: i.amount,
    description: i.description,
    job_id: jobIdByKey.get(i.jobKey) ?? null,
    source: i.source,
  }));

  const { error: incomeError } = await supabase.from('income').insert(incomeRows);
  if (incomeError) {
    await undo(
      supabase,
      insertedJobIds,
      insertedExpenses.map((e) => e.id),
    );
    throw new Error(incomeError.message);
  }

  refresh();
}

/**
 * Compensating delete for a run that failed part way through.
 *
 * PostgREST gives each request its own transaction, so these three inserts cannot be made atomic
 * from here. Without an undo, a failure after the jobs landed would leave the account holding two
 * jobs and nothing else: no longer empty, so the "Load sample data" button never renders again, and
 * no way back except deleting the jobs by hand. Undoing costs a couple of round trips on a path
 * that should never run.
 *
 * Best effort by design. If the undo itself fails there is nothing further to try, and the original
 * error is the one worth showing, so failures here are logged and swallowed rather than thrown.
 */
async function undo(
  supabase: Awaited<ReturnType<typeof requireUser>>['supabase'],
  jobIds: string[],
  expenseIds: string[],
): Promise<void> {
  try {
    if (expenseIds.length > 0) await supabase.from('expenses').delete().in('id', expenseIds);
    if (jobIds.length > 0) await supabase.from('jobs').delete().in('id', jobIds);
  } catch (err) {
    console.error('[loadSampleData] could not undo a partial sample load:', err);
  }
}
