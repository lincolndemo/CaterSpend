import { monthKey } from './dates';
import type { Expense, Income } from './types';

export type ExpenseFilter = {
  search: string;
  categoryId: string | 'all';
  jobId: string | 'all' | 'none';
  month: string | 'all';
};

export type IncomeFilter = {
  search: string;
  jobId: string | 'all' | 'none';
  month: string | 'all';
};

function byDateDesc(
  a: { date: string; created_at: string },
  b: { date: string; created_at: string },
): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0;
}

function matchesJob(rowJobId: string | null, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'none') return rowJobId === null;
  return rowJobId === filter;
}

export function filterExpenses(
  rows: Expense[],
  filter: ExpenseFilter,
  categoryName: (id: string) => string,
): Expense[] {
  const q = filter.search.trim().toLowerCase();
  return rows
    .filter((r) => {
      if (filter.categoryId !== 'all' && r.category_id !== filter.categoryId) return false;
      if (!matchesJob(r.job_id, filter.jobId)) return false;
      if (filter.month !== 'all' && monthKey(r.date) !== filter.month) return false;
      if (q === '') return true;
      const haystack = `${r.description} ${r.notes ?? ''} ${categoryName(r.category_id)}`.toLowerCase();
      return haystack.includes(q);
    })
    .sort(byDateDesc);
}

export function filterIncome(rows: Income[], filter: IncomeFilter): Income[] {
  const q = filter.search.trim().toLowerCase();
  return rows
    .filter((r) => {
      if (!matchesJob(r.job_id, filter.jobId)) return false;
      if (filter.month !== 'all' && monthKey(r.date) !== filter.month) return false;
      if (q === '') return true;
      return `${r.description} ${r.source ?? ''}`.toLowerCase().includes(q);
    })
    .sort(byDateDesc);
}
