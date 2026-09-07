import { describe, it, expect } from 'vitest';
import { parseExpenseForm, parseIncomeForm, parseJobForm, parseCategoryForm, parseBudgetForm } from './validation';

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

const validExpense = {
  date: '2026-09-01',
  amount: '12,500',
  description: 'Tomatoes',
  category_id: 'c1',
  payment_method: 'Cash',
  job_id: '',
  notes: '',
};

describe('parseExpenseForm', () => {
  it('accepts a valid expense and normalises blanks to null', () => {
    const result = parseExpenseForm(fd(validExpense));
    expect(result).toEqual({
      ok: true,
      value: {
        date: '2026-09-01',
        amount: 12500,
        description: 'Tomatoes',
        category_id: 'c1',
        payment_method: 'Cash',
        job_id: null,
        notes: null,
      },
    });
  });

  it('rejects a missing date', () => {
    expect(parseExpenseForm(fd({ ...validExpense, date: '' }))).toEqual({
      ok: false,
      error: 'Please select a date.',
    });
  });

  it('rejects a missing amount', () => {
    expect(parseExpenseForm(fd({ ...validExpense, amount: '' }))).toEqual({
      ok: false,
      error: 'Please enter an amount.',
    });
  });

  it('rejects a zero amount', () => {
    expect(parseExpenseForm(fd({ ...validExpense, amount: '0' }))).toEqual({
      ok: false,
      error: 'Please enter an amount.',
    });
  });

  it('rejects a blank description', () => {
    expect(parseExpenseForm(fd({ ...validExpense, description: '   ' }))).toEqual({
      ok: false,
      error: 'Please enter a description.',
    });
  });

  it('rejects a missing category', () => {
    expect(parseExpenseForm(fd({ ...validExpense, category_id: '' }))).toEqual({
      ok: false,
      error: 'Please select a category.',
    });
  });

  it('rejects an unknown payment method', () => {
    expect(parseExpenseForm(fd({ ...validExpense, payment_method: 'Crypto' }))).toEqual({
      ok: false,
      error: 'Please select a payment method.',
    });
  });
});

describe('parseIncomeForm', () => {
  it('accepts a valid income row', () => {
    const result = parseIncomeForm(
      fd({ date: '2026-09-02', amount: '400000', description: 'Deposit', job_id: 'j1', source: 'Bank Transfer' }),
    );
    expect(result).toEqual({
      ok: true,
      value: { date: '2026-09-02', amount: 400000, description: 'Deposit', job_id: 'j1', source: 'Bank Transfer' },
    });
  });

  it('rejects a blank description', () => {
    expect(
      parseIncomeForm(fd({ date: '2026-09-02', amount: '100', description: '', job_id: '', source: '' })),
    ).toEqual({ ok: false, error: 'Please enter a description.' });
  });
});

describe('parseJobForm', () => {
  it('accepts a job with only a name', () => {
    expect(parseJobForm(fd({ name: 'Adeyemi Wedding', client: '', event_date: '', quoted_amount: '', notes: '' }))).toEqual({
      ok: true,
      value: { name: 'Adeyemi Wedding', client: null, event_date: null, quoted_amount: null, notes: null },
    });
  });

  it('rejects a blank name', () => {
    expect(parseJobForm(fd({ name: '  ', client: '', event_date: '', quoted_amount: '', notes: '' }))).toEqual({
      ok: false,
      error: 'Please enter a job name.',
    });
  });

  it('rejects a non-numeric quote', () => {
    expect(parseJobForm(fd({ name: 'Gig', client: '', event_date: '', quoted_amount: 'soon', notes: '' }))).toEqual({
      ok: false,
      error: 'Please enter a valid price.',
    });
  });

  it('rejects a negative quote', () => {
    expect(parseJobForm(fd({ name: 'Gig', client: '', event_date: '', quoted_amount: '-1', notes: '' }))).toEqual({
      ok: false,
      error: 'Please enter a valid price.',
    });
  });
});

describe('parseCategoryForm', () => {
  it('trims the name', () => {
    expect(parseCategoryForm(fd({ name: '  Decor  ' }))).toEqual({ ok: true, value: { name: 'Decor' } });
  });
  it('rejects a blank name', () => {
    expect(parseCategoryForm(fd({ name: '' }))).toEqual({ ok: false, error: 'Please enter a description.' });
  });
});

describe('parseBudgetForm', () => {
  it('accepts a blank budget as null', () => {
    expect(parseBudgetForm(fd({ business_name: 'Ada Cuisine', monthly_budget: '' }))).toEqual({
      ok: true,
      value: { business_name: 'Ada Cuisine', monthly_budget: null },
    });
  });
  it('accepts a number', () => {
    expect(parseBudgetForm(fd({ business_name: 'Ada Cuisine', monthly_budget: '120,000' }))).toEqual({
      ok: true,
      value: { business_name: 'Ada Cuisine', monthly_budget: 120000 },
    });
  });
  it('rejects nonsense', () => {
    expect(parseBudgetForm(fd({ business_name: 'Ada Cuisine', monthly_budget: 'lots' }))).toEqual({
      ok: false,
      error: 'Please enter a valid price.',
    });
  });
  it('treats a blank business name as null', () => {
    expect(parseBudgetForm(fd({ business_name: '   ', monthly_budget: '' }))).toEqual({
      ok: true,
      value: { business_name: null, monthly_budget: null },
    });
  });
  it('accepts a business name at the 200-character limit', () => {
    const name = 'a'.repeat(200);
    expect(parseBudgetForm(fd({ business_name: name, monthly_budget: '' }))).toEqual({
      ok: true,
      value: { business_name: name, monthly_budget: null },
    });
  });
  it('rejects a business name over 200 characters', () => {
    expect(parseBudgetForm(fd({ business_name: 'a'.repeat(201), monthly_budget: '' }))).toEqual({
      ok: false,
      error: 'Business name must be 200 characters or fewer.',
    });
  });
});
