'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { Field, inputClass } from '@/components/ui/Field';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { saveSettings } from '@/app/actions/settings';
import { IDLE_STATE } from '@/lib/validation';
import type { Profile } from '@/lib/types';

export function BudgetForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(saveSettings, IDLE_STATE);

  useEffect(() => {
    if (state.ok) toast.success('Settings saved.');
  }, [state]);

  return (
    <form action={formAction} className="card grid gap-4 p-5">
      <h2 className="font-medium">Business</h2>

      <Field label="Business name">
        <input name="business_name" defaultValue={profile.business_name ?? ''} className={inputClass} />
      </Field>

      <Field label="Monthly expense budget (₦, leave blank for none)">
        <input
          name="monthly_budget"
          inputMode="decimal"
          defaultValue={profile.monthly_budget ?? ''}
          placeholder="120000"
          className={`${inputClass} num`}
        />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--critical)]">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton>Save settings</SubmitButton>
      </div>
    </form>
  );
}
