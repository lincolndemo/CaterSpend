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
};

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
    supabase.from('jobs').select('*').order('event_date', { ascending: false, nullsFirst: false }),
    supabase.from('expenses').select('*').order('date', { ascending: false }),
    supabase.from('income').select('*').order('date', { ascending: false }),
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
  };
}
