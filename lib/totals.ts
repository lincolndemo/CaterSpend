import { monthKey, monthLabel } from './dates';
import type { Category, Expense, Income, Job } from './types';

export type CategorySlice = {
  id: string;
  name: string;
  colorLight: string;
  colorDark: string;
  total: number;
  pct: number;
};

export type MonthBucket = { key: string; label: string; expense: number; income: number };

export type JobFigures = {
  spent: number;
  expCount: number;
  collected: number;
  incCount: number;
  quoted: number;
  outstanding: number;
  profit: number;
};

export function sumAmounts(rows: { amount: number }[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
}

export function categoryTotals(expenses: Expense[], categories: Category[]): CategorySlice[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const totals = new Map<string, number>();
  for (const e of expenses) {
    if (!byId.has(e.category_id)) continue;
    totals.set(e.category_id, (totals.get(e.category_id) ?? 0) + e.amount);
  }
  const grand = [...totals.values()].reduce((a, b) => a + b, 0);
  if (grand === 0) return [];
  return [...totals.entries()]
    .map(([id, total]) => {
      const c = byId.get(id)!;
      return {
        id,
        name: c.name,
        colorLight: c.color_light,
        colorDark: c.color_dark,
        total,
        pct: (total / grand) * 100,
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

export function monthlyTotals(expenses: Expense[], income: Income[], keys: string[]): MonthBucket[] {
  const buckets = new Map<string, MonthBucket>(
    keys.map((key) => [key, { key, label: monthLabel(key), expense: 0, income: 0 }]),
  );
  for (const e of expenses) {
    const b = buckets.get(monthKey(e.date));
    if (b) b.expense += e.amount;
  }
  for (const i of income) {
    const b = buckets.get(monthKey(i.date));
    if (b) b.income += i.amount;
  }
  return keys.map((key) => buckets.get(key)!);
}

export function jobFigures(job: Job, expenses: Expense[], income: Income[]): JobFigures {
  const jobExpenses = expenses.filter((e) => e.job_id === job.id);
  const jobIncome = income.filter((i) => i.job_id === job.id);
  const spent = sumAmounts(jobExpenses);
  const collected = sumAmounts(jobIncome);
  const quoted = job.quoted_amount ?? 0;
  return {
    spent,
    expCount: jobExpenses.length,
    collected,
    incCount: jobIncome.length,
    quoted,
    outstanding: Math.max(quoted - collected, 0),
    profit: collected - spent,
  };
}

export function budgetStatus(
  spent: number,
  budget: number | null,
): { pct: number; state: 'good' | 'warning' | 'critical' } | null {
  if (budget === null || budget <= 0) return null;
  const pct = (spent / budget) * 100;
  const state = pct >= 100 ? 'critical' : pct >= 80 ? 'warning' : 'good';
  return { pct, state };
}
