import { DEMO_USER_ID, store } from './demo-store';
import type { Category, Expense, Income, Job, Profile } from './types';

export type Workspace = {
  userId: string;
  profile: Profile;
  categories: Category[];
  jobs: Job[];
  expenses: Expense[];
  income: Income[];
};

// PREVIEW ONLY: reads from the in-memory demo store instead of Supabase.
// Once auth lands (Tasks 7-9), replace this body with the Supabase
// implementation from the Task 10 brief (requireUser + one query per table).
export async function loadWorkspace(): Promise<Workspace> {
  const categories = [...store.categories].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );

  const jobs = [...store.jobs].sort((a, b) => {
    if (a.event_date === b.event_date) return 0;
    if (a.event_date === null) return 1;
    if (b.event_date === null) return -1;
    return a.event_date < b.event_date ? 1 : -1;
  });

  const expenses = [...store.expenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const income = [...store.income].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return {
    userId: DEMO_USER_ID,
    profile: store.profile,
    categories,
    jobs,
    expenses,
    income,
  };
}
