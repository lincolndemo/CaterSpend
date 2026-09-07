import { parseAmount } from './money';
import { PAYMENT_METHODS, type PaymentMethod } from './types';

export type ActionState = { ok: boolean; error?: string };
export const IDLE_STATE: ActionState = { ok: false };

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export const ERRORS = {
  date: 'Please select a date.',
  amount: 'Please enter an amount.',
  description: 'Please enter a description.',
  category: 'Please select a category.',
  paymentMethod: 'Please select a payment method.',
  jobName: 'Please enter a job name.',
  price: 'Please enter a valid price.',
  duplicateCategory: 'That category already exists.',
  categoryInUse: "Can't remove — in use by an expense.",
} as const;

export type ExpenseInput = {
  date: string;
  amount: number;
  description: string;
  category_id: string;
  payment_method: PaymentMethod;
  job_id: string | null;
  notes: string | null;
};

export type IncomeInput = {
  date: string;
  amount: number;
  description: string;
  job_id: string | null;
  source: string | null;
};

export type JobInput = {
  name: string;
  client: string | null;
  event_date: string | null;
  quoted_amount: number | null;
  notes: string | null;
};

export type CategoryInput = { name: string };
export type BudgetInput = { monthly_budget: number | null };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function text(fd: FormData, key: string): string {
  const raw = fd.get(key);
  return typeof raw === 'string' ? raw.trim() : '';
}

function optional(fd: FormData, key: string): string | null {
  const value = text(fd, key);
  return value === '' ? null : value;
}

export function parseExpenseForm(fd: FormData): Parsed<ExpenseInput> {
  const date = text(fd, 'date');
  if (!DATE_RE.test(date)) return { ok: false, error: ERRORS.date };

  const amount = parseAmount(text(fd, 'amount'));
  if (amount === null || amount <= 0) return { ok: false, error: ERRORS.amount };

  const description = text(fd, 'description');
  if (description === '') return { ok: false, error: ERRORS.description };

  const category_id = text(fd, 'category_id');
  if (category_id === '') return { ok: false, error: ERRORS.category };

  const method = text(fd, 'payment_method');
  if (!(PAYMENT_METHODS as readonly string[]).includes(method)) {
    return { ok: false, error: ERRORS.paymentMethod };
  }

  return {
    ok: true,
    value: {
      date,
      amount,
      description,
      category_id,
      payment_method: method as PaymentMethod,
      job_id: optional(fd, 'job_id'),
      notes: optional(fd, 'notes'),
    },
  };
}

export function parseIncomeForm(fd: FormData): Parsed<IncomeInput> {
  const date = text(fd, 'date');
  if (!DATE_RE.test(date)) return { ok: false, error: ERRORS.date };

  const amount = parseAmount(text(fd, 'amount'));
  if (amount === null || amount <= 0) return { ok: false, error: ERRORS.amount };

  const description = text(fd, 'description');
  if (description === '') return { ok: false, error: ERRORS.description };

  return {
    ok: true,
    value: { date, amount, description, job_id: optional(fd, 'job_id'), source: optional(fd, 'source') },
  };
}

export function parseJobForm(fd: FormData): Parsed<JobInput> {
  const name = text(fd, 'name');
  if (name === '') return { ok: false, error: ERRORS.jobName };

  const rawQuote = text(fd, 'quoted_amount');
  let quoted_amount: number | null = null;
  if (rawQuote !== '') {
    const parsed = parseAmount(rawQuote);
    if (parsed === null || parsed < 0) return { ok: false, error: ERRORS.price };
    quoted_amount = parsed;
  }

  const event_date = optional(fd, 'event_date');
  if (event_date !== null && !DATE_RE.test(event_date)) return { ok: false, error: ERRORS.date };

  return {
    ok: true,
    value: { name, client: optional(fd, 'client'), event_date, quoted_amount, notes: optional(fd, 'notes') },
  };
}

export function parseCategoryForm(fd: FormData): Parsed<CategoryInput> {
  const name = text(fd, 'name');
  if (name === '') return { ok: false, error: ERRORS.description };
  return { ok: true, value: { name } };
}

export function parseBudgetForm(fd: FormData): Parsed<BudgetInput> {
  const raw = text(fd, 'monthly_budget');
  if (raw === '') return { ok: true, value: { monthly_budget: null } };
  const parsed = parseAmount(raw);
  if (parsed === null || parsed < 0) return { ok: false, error: ERRORS.price };
  return { ok: true, value: { monthly_budget: parsed } };
}
