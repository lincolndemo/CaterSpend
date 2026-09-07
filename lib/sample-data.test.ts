import { describe, it, expect } from 'vitest';
import { buildSampleData } from './sample-data';
import { monthKey, lastNMonthKeys } from './dates';

describe('buildSampleData', () => {
  const data = buildSampleData('2026-09-05');

  it('creates two jobs, twenty expenses and four income records', () => {
    expect(data.jobs).toHaveLength(2);
    expect(data.expenses).toHaveLength(20);
    expect(data.income).toHaveLength(4);
  });

  it('puts every row inside the last four months', () => {
    const window = lastNMonthKeys(4, '2026-09-05');
    for (const row of [...data.expenses, ...data.income]) {
      expect(window).toContain(monthKey(row.date));
    }
  });

  it('only references category names that exist as built-ins', () => {
    const builtins = new Set([
      'Ingredients',
      'Packaging',
      'Transport',
      'Gas/Fuel',
      'Staff/Labour',
      'Equipment',
      'Marketing',
      'Utilities',
      'Other',
    ]);
    for (const e of data.expenses) expect(builtins.has(e.categoryName)).toBe(true);
  });

  it('links every income record and some expenses to a sample job', () => {
    const jobKeys = new Set(data.jobs.map((j) => j.key));
    for (const i of data.income) expect(jobKeys.has(i.jobKey)).toBe(true);
    expect(data.expenses.some((e) => e.jobKey !== null)).toBe(true);
  });

  it('gives every amount a positive value', () => {
    for (const row of [...data.expenses, ...data.income]) expect(row.amount).toBeGreaterThan(0);
  });

  it('never lands on a day the shortest month does not have', () => {
    // dateFor pins a literal day onto a month key. February has 28 days, so a template day above
    // 28 would produce 2026-02-30 — a string every date helper accepts and Postgres rejects.
    for (const row of [...data.expenses, ...data.income]) {
      expect(Number(row.date.slice(8))).toBeLessThanOrEqual(28);
    }
  });
});
