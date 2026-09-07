import { describe, it, expect } from 'vitest';
import { filterExpenses, filterIncome } from './filters';
import type { Expense, Income } from './types';

const names: Record<string, string> = { c1: 'Ingredients', c2: 'Transport' };
const nameOf = (id: string) => names[id] ?? '';

const rows: Expense[] = [
  {
    id: 'a', user_id: 'u', date: '2026-09-01', amount: 100, description: 'Tomatoes',
    category_id: 'c1', payment_method: 'Cash', job_id: 'j1', notes: null,
    created_at: '2026-09-01T09:00:00Z', updated_at: '2026-09-01T09:00:00Z',
  },
  {
    id: 'b', user_id: 'u', date: '2026-09-03', amount: 200, description: 'Bus fare',
    category_id: 'c2', payment_method: 'Cash', job_id: null, notes: 'To Ikeja',
    created_at: '2026-09-03T09:00:00Z', updated_at: '2026-09-03T09:00:00Z',
  },
  {
    id: 'c', user_id: 'u', date: '2026-08-30', amount: 300, description: 'Rice',
    category_id: 'c1', payment_method: 'Bank Transfer', job_id: 'j2', notes: null,
    created_at: '2026-08-30T09:00:00Z', updated_at: '2026-08-30T09:00:00Z',
  },
];

const base = { search: '', categoryId: 'all' as const, jobId: 'all' as const, month: 'all' as const };

describe('filterExpenses', () => {
  it('sorts by date descending by default', () => {
    expect(filterExpenses(rows, base, nameOf).map((r) => r.id)).toEqual(['b', 'a', 'c']);
  });
  it('matches the description case-insensitively', () => {
    expect(filterExpenses(rows, { ...base, search: 'tomato' }, nameOf).map((r) => r.id)).toEqual(['a']);
  });
  it('matches the notes', () => {
    expect(filterExpenses(rows, { ...base, search: 'ikeja' }, nameOf).map((r) => r.id)).toEqual(['b']);
  });
  it('matches the category name', () => {
    expect(filterExpenses(rows, { ...base, search: 'transport' }, nameOf).map((r) => r.id)).toEqual(['b']);
  });
  it('filters by category', () => {
    expect(filterExpenses(rows, { ...base, categoryId: 'c1' }, nameOf).map((r) => r.id)).toEqual(['a', 'c']);
  });
  it('filters by job', () => {
    expect(filterExpenses(rows, { ...base, jobId: 'j1' }, nameOf).map((r) => r.id)).toEqual(['a']);
  });
  it('filters to rows with no job', () => {
    expect(filterExpenses(rows, { ...base, jobId: 'none' }, nameOf).map((r) => r.id)).toEqual(['b']);
  });
  it('filters by month', () => {
    expect(filterExpenses(rows, { ...base, month: '2026-08' }, nameOf).map((r) => r.id)).toEqual(['c']);
  });
});

const incomeRows: Income[] = [
  {
    id: 'x', user_id: 'u', date: '2026-09-02', amount: 400, description: 'Deposit',
    job_id: 'j1', source: 'Bank Transfer',
    created_at: '2026-09-02T09:00:00Z', updated_at: '2026-09-02T09:00:00Z',
  },
  {
    id: 'y', user_id: 'u', date: '2026-09-05', amount: 500, description: 'Balance',
    job_id: null, source: 'Cash',
    created_at: '2026-09-05T09:00:00Z', updated_at: '2026-09-05T09:00:00Z',
  },
];

describe('filterIncome', () => {
  it('sorts by date descending', () => {
    expect(filterIncome(incomeRows, { search: '', jobId: 'all', month: 'all' }).map((r) => r.id)).toEqual(['y', 'x']);
  });
  it('matches the source', () => {
    expect(filterIncome(incomeRows, { search: 'cash', jobId: 'all', month: 'all' }).map((r) => r.id)).toEqual(['y']);
  });
  it('filters to rows with no job', () => {
    expect(filterIncome(incomeRows, { search: '', jobId: 'none', month: 'all' }).map((r) => r.id)).toEqual(['y']);
  });
});
