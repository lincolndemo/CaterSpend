'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { closeDialog } from '@/components/ui/Dialog';
import { Field, inputClass } from '@/components/ui/Field';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { createIncome, updateIncome } from '@/app/actions/income';
import { IDLE_STATE } from '@/lib/validation';
import { todayISO } from '@/lib/dates';
import { PAYMENT_METHODS, type Income, type Job } from '@/lib/types';

type Props = {
  mode: 'create' | 'edit';
  jobs: Job[];
  income?: Income;
};

export function IncomeForm({ mode, jobs, income }: Props) {
  const action = mode === 'create' ? createIncome : updateIncome;
  const [state, formAction] = useActionState(action, IDLE_STATE);

  useEffect(() => {
    if (state.ok) {
      toast.success(mode === 'create' ? 'Income recorded.' : 'Income updated.');
      closeDialog();
    }
  }, [state, mode]);

  return (
    <form action={formAction} className="grid gap-4">
      {income && <input type="hidden" name="id" value={income.id} />}

      <Field label="Date">
        <input type="date" name="date" required defaultValue={income?.date ?? todayISO()} className={inputClass} />
      </Field>

      <Field label="Amount (₦)">
        <input
          name="amount"
          inputMode="decimal"
          required
          defaultValue={income?.amount ?? ''}
          placeholder="400000"
          className={`${inputClass} num`}
        />
      </Field>

      <Field label="Description">
        <input name="description" required defaultValue={income?.description ?? ''} className={inputClass} />
      </Field>

      <Field label="Job (optional)">
        <select name="job_id" defaultValue={income?.job_id ?? ''} className={inputClass}>
          <option value="">No job</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Received via (optional)">
        <select name="source" defaultValue={income?.source ?? ''} className={inputClass}>
          <option value="">Not recorded</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--critical)]">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton>{mode === 'create' ? 'Record income' : 'Save changes'}</SubmitButton>
      </div>
    </form>
  );
}
