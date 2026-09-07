'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { closeDialog } from '@/components/ui/Dialog';
import { Field, inputClass } from '@/components/ui/Field';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { createExpense, updateExpense } from '@/app/actions/expenses';
import { IDLE_STATE } from '@/lib/validation';
import { todayISO } from '@/lib/dates';
import { PAYMENT_METHODS, type Category, type Expense, type Job } from '@/lib/types';

type Props = {
  mode: 'create' | 'edit';
  categories: Category[];
  jobs: Job[];
  expense?: Expense;
};

export function ExpenseForm({ mode, categories, jobs, expense }: Props) {
  const action = mode === 'create' ? createExpense : updateExpense;
  const [state, formAction] = useActionState(action, IDLE_STATE);

  useEffect(() => {
    if (state.ok) {
      toast.success(mode === 'create' ? 'Expense added.' : 'Expense updated.');
      closeDialog();
    }
  }, [state, mode]);

  return (
    <form action={formAction} className="grid gap-4">
      {expense && <input type="hidden" name="id" value={expense.id} />}

      <Field label="Date">
        <input type="date" name="date" required defaultValue={expense?.date ?? todayISO()} className={inputClass} />
      </Field>

      <Field label="Amount (₦)">
        <input
          name="amount"
          inputMode="decimal"
          required
          defaultValue={expense?.amount ?? ''}
          placeholder="12500"
          className={`${inputClass} num`}
        />
      </Field>

      <Field label="Description">
        <input name="description" required defaultValue={expense?.description ?? ''} className={inputClass} />
      </Field>

      <Field label="Category">
        <select name="category_id" required defaultValue={expense?.category_id ?? ''} className={inputClass}>
          <option value="">Choose a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Payment method">
        <select name="payment_method" required defaultValue={expense?.payment_method ?? 'Cash'} className={inputClass}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Job (optional)">
        <select name="job_id" defaultValue={expense?.job_id ?? ''} className={inputClass}>
          <option value="">No job</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Notes (optional)">
        <textarea name="notes" rows={2} defaultValue={expense?.notes ?? ''} className={inputClass} />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--critical)]">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton>{mode === 'create' ? 'Add expense' : 'Save changes'}</SubmitButton>
      </div>
    </form>
  );
}
