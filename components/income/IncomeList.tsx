'use client';

import { useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { inputClass } from '@/components/ui/Field';
import { IncomeForm } from './IncomeForm';
import { deleteIncome } from '@/app/actions/income';
import { filterIncome, type IncomeFilter } from '@/lib/filters';
import { formatDateShort, formatMonthOptions } from '@/lib/dates';
import { formatNaira } from '@/lib/money';
import { sumAmounts } from '@/lib/totals';
import type { Income, Job } from '@/lib/types';

export function IncomeList({ income, jobs }: { income: Income[]; jobs: Job[] }) {
  const [filter, setFilter] = useState<IncomeFilter>({ search: '', jobId: 'all', month: 'all' });

  const jobById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);
  const months = useMemo(() => formatMonthOptions(income.map((i) => i.date)), [income]);
  const rows = useMemo(() => filterIncome(income, filter), [income, filter]);

  return (
    <section className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          placeholder="Search description or source"
          className={inputClass}
        />
        <select
          value={filter.jobId}
          onChange={(e) => setFilter({ ...filter, jobId: e.target.value })}
          className={inputClass}
        >
          <option value="all">All jobs</option>
          <option value="none">No job</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>
        <select
          value={filter.month}
          onChange={(e) => setFilter({ ...filter, month: e.target.value })}
          className={inputClass}
        >
          <option value="all">All months</option>
          {months.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-[var(--ink-mute)]">
        {rows.length} {rows.length === 1 ? 'record' : 'records'} · {formatNaira(sumAmounts(rows))}
      </p>

      {rows.length === 0 ? (
        <EmptyState
          title="No income match"
          body="Change the filters, or record your first payment with the button above."
        />
      ) : (
        <ul className="grid gap-2">
          {rows.map((i) => {
            const job = i.job_id ? jobById.get(i.job_id) : null;
            return (
              <li key={i.id} className="card flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-40 flex-1">
                  <p className="font-medium">{i.description}</p>
                  <p className="text-sm text-[var(--ink-mute)]">
                    {formatDateShort(i.date)}
                    {i.source ? ` · ${i.source}` : ''}
                    {job ? ` · ${job.name}` : ''}
                  </p>
                </div>
                <span className="num font-medium text-[var(--good)]">{formatNaira(i.amount)}</span>
                <div className="flex gap-2">
                  <Dialog
                    title="Edit income"
                    trigger={
                      <button className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink-600)]">
                        <Pencil size={14} />
                      </button>
                    }
                  >
                    <IncomeForm mode="edit" jobs={jobs} income={i} />
                  </Dialog>
                  <form action={deleteIncome}>
                    <input type="hidden" name="id" value={i.id} />
                    <ConfirmButton
                      message={`Delete "${i.description}" (${formatNaira(i.amount)}, ${formatDateShort(i.date)})?`}
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
