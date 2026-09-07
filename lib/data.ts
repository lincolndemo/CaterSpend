import { requireUser } from './supabase/server';
import type { Database } from './supabase/database.types';
import type { Category, Expense, Income, Job, PaymentMethod, Profile } from './types';

export type Workspace = {
  userId: string;
  profile: Profile;
  categories: Category[];
  jobs: Job[];
  expenses: Expense[];
  income: Income[];
  /** True when the expense or income read hit a row ceiling, so every figure may understate. */
  truncated: boolean;
};

// PostgREST caps every response at the server's `max-rows` setting and reports the cap nowhere in
// the response body — the rows simply stop. That is 1000 on the local stack
// (`supabase/config.toml`) and 1000 by default on a hosted project too. An unbounded read would
// therefore silently understate the KPIs, the donut, the monthly bars and every job's profit once
// a caterer crosses that many records, which is the one failure a bookkeeping tool cannot have.
//
// So the ceiling is stated here rather than inherited from server configuration, and truncation is
// detected rather than assumed away — see `isTruncated`. Real pagination and server-side
// aggregation are deferred past MVP.
export const EXPORT_LIMIT = 5000;

// `{ count: 'exact' }` puts the true number of matching rows after the slash in `Content-Range`,
// which postgrest-js surfaces as `count`. Comparing it against what actually arrived catches
// truncation from either ceiling — the server's `max-rows` or ours — instead of only ours. If the
// count is missing for any reason, fall back to the length test the ceiling alone allows.
export function isTruncated(result: { data: unknown[] | null; count: number | null }): boolean {
  const received = result.data?.length ?? 0;
  if (result.count !== null) return result.count > received;
  return received >= EXPORT_LIMIT;
}

// PostgREST can serialise `numeric` columns as JSON strings depending on configuration, even
// though the generated types declare them as `number`. Coerce once here, at the data layer,
// rather than at every call site that reads `.amount` / `.quoted_amount` / `.monthly_budget`.
function toNumber(value: number | string): number {
  return typeof value === 'string' ? Number(value) : value;
}

function toNullableNumber(value: number | string | null): number | null {
  return value === null ? null : toNumber(value);
}

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type JobRow = Database['public']['Tables']['jobs']['Row'];
type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type IncomeRow = Database['public']['Tables']['income']['Row'];

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    business_name: row.business_name,
    monthly_budget: toNullableNumber(row.monthly_budget),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    is_builtin: row.is_builtin,
    color_light: row.color_light,
    color_dark: row.color_dark,
    sort_order: row.sort_order,
    created_at: row.created_at,
  };
}

function toJob(row: JobRow): Job {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    client: row.client,
    event_date: row.event_date,
    quoted_amount: toNullableNumber(row.quoted_amount),
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    user_id: row.user_id,
    date: row.date,
    amount: toNumber(row.amount),
    description: row.description,
    category_id: row.category_id,
    payment_method: row.payment_method as PaymentMethod,
    job_id: row.job_id,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toIncome(row: IncomeRow): Income {
  return {
    id: row.id,
    user_id: row.user_id,
    date: row.date,
    amount: toNumber(row.amount),
    description: row.description,
    job_id: row.job_id,
    source: row.source,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function loadWorkspace(): Promise<Workspace> {
  const { supabase, userId } = await requireUser();

  const [profile, categories, jobs, expenses, income] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('categories').select('*').order('sort_order').order('name'),
    // Postgres guarantees no order for ties, so equal event dates would otherwise let two job
    // cards swap places between page loads. `created_at` desc reproduces the demo's stable
    // insertion order. Expenses and income need no tie-break: every consumer re-sorts them
    // through `byDateDesc`, which already breaks date ties on `created_at`.
    supabase
      .from('jobs')
      .select('*')
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(0, EXPORT_LIMIT - 1),
    supabase
      .from('income')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(0, EXPORT_LIMIT - 1),
  ]);

  const failure = [profile, categories, jobs, expenses, income].find((r) => r.error);
  if (failure?.error) throw new Error(failure.error.message);

  return {
    userId,
    profile: toProfile(profile.data as ProfileRow),
    categories: ((categories.data ?? []) as CategoryRow[]).map(toCategory),
    jobs: ((jobs.data ?? []) as JobRow[]).map(toJob),
    expenses: ((expenses.data ?? []) as ExpenseRow[]).map(toExpense),
    income: ((income.data ?? []) as IncomeRow[]).map(toIncome),
    truncated: isTruncated(expenses) || isTruncated(income),
  };
}
