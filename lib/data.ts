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
  /** True when any read hit a row ceiling, so every figure derived from them may understate. */
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
  if (result.count === null) return received >= EXPORT_LIMIT;

  // postgrest-js derives `count` by running `parseInt` over the segment after the slash in
  // `Content-Range`, so a response that carries rows without an exact total (`0-2/*`) yields NaN.
  // A count we cannot read is not evidence the data is complete, and this flag exists precisely to
  // stop partial figures being presented as whole ones. So an unreadable count raises the warning.
  //
  // This is the opposite of how the write actions treat an unreadable count, deliberately. On a
  // write, an ambiguous count means the write most likely landed, so staying quiet avoids telling
  // the user a successful save failed. On a read, an ambiguous count means we cannot prove the
  // figures are complete, so warning avoids presenting understated money as fact. Quiet when
  // unsure about a write, loud when unsure about a read — both resolve toward not misleading.
  if (Number.isNaN(result.count)) return true;

  return result.count > received;
}

/**
 * True only when a write definitively changed nothing.
 *
 * The write direction is the mirror of `isTruncated`, and the asymmetry is deliberate. Both face
 * the same problem — postgrest-js can hand back a `count` that is `NaN` (the `Content-Range` total
 * was `*`), `null` or `undefined` (not reported at all) — and they resolve it in opposite
 * directions, because the cost of guessing wrong is opposite:
 *
 * - On a **write**, an unreadable count most likely accompanies a write that landed. Treating it
 *   as failure tells the user their saved record did not save, and sends them to enter it twice.
 *   So only `count === 0` — a definite zero, which PostgREST does report on a matched-nothing
 *   UPDATE or DELETE — counts as failure.
 * - On a **read**, an unreadable count is not evidence the data is complete, and presenting
 *   understated money as fact is the worst failure a bookkeeping tool can have. So anything
 *   unreadable raises the truncation warning.
 *
 * Quiet when unsure about a write, loud when unsure about a read. Both resolve toward not
 * misleading the user.
 */
export function wroteNoRows(count: number | null | undefined): boolean {
  return count === 0;
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
    // Categories and jobs carry the same explicit ceiling and exact count as the money tables.
    // A caterer will realistically never reach 1000 categories, but without a count `truncated`
    // would read `false` on the strength of a query that never checked — the banner would assert
    // the figures are complete having tested only two of the four reads they are built from.
    supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .order('sort_order')
      .order('name')
      .range(0, EXPORT_LIMIT - 1),
    // Postgres guarantees no order for ties, so equal event dates would otherwise let two job
    // cards swap places between page loads. `created_at` desc reproduces the demo's stable
    // insertion order. Expenses and income need no tie-break: every consumer re-sorts them
    // through `byDateDesc`, which already breaks date ties on `created_at`.
    supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(0, EXPORT_LIMIT - 1),
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
    truncated:
      isTruncated(expenses) || isTruncated(income) || isTruncated(jobs) || isTruncated(categories),
  };
}
