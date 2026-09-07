'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { closeDialog } from '@/components/ui/Dialog';
import { Field, inputClass } from '@/components/ui/Field';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { createJob, updateJob } from '@/app/actions/jobs';
import { IDLE_STATE } from '@/lib/validation';
import type { Job } from '@/lib/types';

export function JobForm({ mode, job }: { mode: 'create' | 'edit'; job?: Job }) {
  const action = mode === 'create' ? createJob : updateJob;
  const [state, formAction] = useActionState(action, IDLE_STATE);

  useEffect(() => {
    if (state.ok) {
      toast.success(mode === 'create' ? 'Job added.' : 'Job updated.');
      closeDialog();
    }
  }, [state, mode]);

  return (
    <form action={formAction} className="grid gap-4">
      {job && <input type="hidden" name="id" value={job.id} />}

      <Field label="Job name">
        <input name="name" required defaultValue={job?.name ?? ''} placeholder="Adeyemi Wedding" className={inputClass} />
      </Field>

      <Field label="Client (optional)">
        <input name="client" defaultValue={job?.client ?? ''} className={inputClass} />
      </Field>

      <Field label="Event date (optional)">
        <input type="date" name="event_date" defaultValue={job?.event_date ?? ''} className={inputClass} />
      </Field>

      <Field label="Quoted price (₦, optional)">
        <input
          name="quoted_amount"
          inputMode="decimal"
          defaultValue={job?.quoted_amount ?? ''}
          placeholder="650000"
          className={`${inputClass} num`}
        />
      </Field>

      <Field label="Notes (optional)">
        <textarea name="notes" rows={2} defaultValue={job?.notes ?? ''} className={inputClass} />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--critical)]">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton>{mode === 'create' ? 'Add job' : 'Save changes'}</SubmitButton>
      </div>
    </form>
  );
}
