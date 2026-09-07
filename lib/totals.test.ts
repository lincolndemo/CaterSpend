import { describe, it, expect } from 'vitest';
import { sumAmounts, categoryTotals, monthlyTotals, jobFigures, budgetStatus } from './totals';
import type { Category, Expense, Income, Job } from './types';

const cat = (id: string, name: string, sort: number): Category => ({
  id,
  user_id: 'u1',
  name,
  is_builtin: true,
  color_light: '#111111',
  color_dark: '#eeeeee',
  sort_order: sort,
  created_at: '2026-01-01T00:00:00Z',
});

const exp = (over: Partial<Expense>): Expense => ({
  id: 'e1',
  user_id: 'u1',
  date: '2026-09-01',
  amount: 100,
  description: 'x',
  category_id: 'c1',
  payment_method: 'Cash',
  job_id: null,
  notes: null,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  ...over,
});

const inc = (over: Partial<Income>): Income => ({
  id: 'i1',
  user_id: 'u1',
  date: '2026-09-01',
  amount: 100,
  description: 'y',
  job_id: null,
  source: null,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  ...over,
});

const job: Job = {
  id: 'j1',
  user_id: 'u1',
  name: 'Adeyemi Wedding',
  client: 'Adeyemi',
  event_date: '2026-09-20',
  quoted_amount: 650000,
  notes: null,
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-01T00:00:00Z',
};

describe('sumAmounts', () => {
  it('sums an empty list to zero', () => {
    expect(sumAmounts([])).toBe(0);
  });
  it('sums amounts', () => {
    expect(sumAmounts([{ amount: 100 }, { amount: 250.5 }])).toBe(350.5);
  });
});

describe('categoryTotals', () => {
  const categories = [cat('c1', 'Ingredients', 10), cat('c2', 'Transport', 20), cat('c3', 'Staff', 30)];

  it('totals per category, descending, dropping empties', () => {
    const rows = [
      exp({ id: 'a', category_id: 'c1', amount: 300 }),
      exp({ id: 'b', category_id: 'c2', amount: 100 }),
      exp({ id: 'c', category_id: 'c1', amount: 100 }),
    ];
    const result = categoryTotals(rows, categories);
    expect(result.map((r) => r.name)).toEqual(['Ingredients', 'Transport']);
    expect(result[0].total).toBe(400);
    expect(result[0].pct).toBe(80);
    expect(result[1].pct).toBe(20);
  });

  it('returns an empty array when there are no expenses', () => {
    expect(categoryTotals([], categories)).toEqual([]);
  });

  it('ignores expenses whose category is missing', () => {
    expect(categoryTotals([exp({ category_id: 'gone' })], categories)).toEqual([]);
  });
});

describe('monthlyTotals', () => {
  it('buckets expenses and income into the given month keys', () => {
    const buckets = monthlyTotals(
      [exp({ date: '2026-08-14', amount: 500 }), exp({ date: '2026-09-02', amount: 200 })],
      [inc({ date: '2026-09-10', amount: 1000 })],
      ['2026-08', '2026-09'],
    );
    expect(buckets).toEqual([
      { key: '2026-08', label: 'Aug', expense: 500, income: 0 },
      { key: '2026-09', label: 'Sep', expense: 200, income: 1000 },
    ]);
  });

  it('drops rows outside the requested window', () => {
    const buckets = monthlyTotals([exp({ date: '2025-01-01', amount: 999 })], [], ['2026-09']);
    expect(buckets[0].expense).toBe(0);
  });
});

describe('jobFigures', () => {
  it('computes spend, collection, outstanding and profit', () => {
    const figures = jobFigures(
      job,
      [exp({ id: 'a', job_id: 'j1', amount: 120000 }), exp({ id: 'b', job_id: null, amount: 5000 })],
      [inc({ id: 'i', job_id: 'j1', amount: 400000 })],
    );
    expect(figures).toEqual({
      spent: 120000,
      expCount: 1,
      collected: 400000,
      incCount: 1,
      quoted: 650000,
      outstanding: 250000,
      profit: 280000,
    });
  });

  it('never reports negative outstanding', () => {
    const figures = jobFigures(job, [], [inc({ job_id: 'j1', amount: 900000 })]);
    expect(figures.outstanding).toBe(0);
  });

  it('treats a missing quote as zero', () => {
    const figures = jobFigures({ ...job, quoted_amount: null }, [], []);
    expect(figures.quoted).toBe(0);
    expect(figures.outstanding).toBe(0);
  });
});

describe('budgetStatus', () => {
  it('returns null when no budget is set', () => {
    expect(budgetStatus(1000, null)).toBeNull();
  });
  it('is good below 80 percent', () => {
    expect(budgetStatus(50, 100)).toEqual({ pct: 50, state: 'good' });
  });
  it('is warning at 80 percent', () => {
    expect(budgetStatus(80, 100)).toEqual({ pct: 80, state: 'warning' });
  });
  it('is critical at 100 percent', () => {
    expect(budgetStatus(120, 100)).toEqual({ pct: 120, state: 'critical' });
  });
});
