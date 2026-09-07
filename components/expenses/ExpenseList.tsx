'use client';

import { useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { inputClass } from '@/components/ui/Field';
import { ExpenseForm } from './ExpenseForm';
import { deleteExpense } from '@/app/actions/expenses';
import { filterExpenses, type ExpenseFilter } from '@/lib/filters';
import { formatDateShort, formatMonthOptions } from '@/lib/dates';
import { formatNaira } from '@/lib/money';
import { sumAmounts } from '@/lib/totals';
import type { Category, Expense, Job } from '@/lib/types';

export function ExpenseList({
  expenses,
  categories,
  jobs,
}: {
  expenses: Expense[];
  categories: Category[];
  jobs: Job[];
}) {
  const [filter, setFilter] = useState<ExpenseFilter>({
    search: '',
    categoryId: 'all',
    jobId: 'all',
    month: 'all',
  });

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const jobById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);
  const months = useMemo(() => formatMonthOptions(expenses.map((e) => e.date)), [expenses]);

  const rows = useMemo(
    () => filterExpenses(expenses, filter, (id) => categoryById.get(id)?.name ?? ''),
    [expenses, filter, categoryById],
  );

  return (
    <section className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          placeholder="Search description, notes or category"
          className={inputClass}
        />
        <select
          value={filter.categoryId}
          onChange={(e) => setFilter({ ...filter, categoryId: e.target.value })}
          className={inputClass}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
          title="No expenses match"
          body="Change the filters, or add your first expense with the button above."
        />
      ) : (
        <ul className="grid gap-2">
          {rows.map((e) => {
            const category = categoryById.get(e.category_id);
            const job = e.job_id ? jobById.get(e.job_id) : null;
            return (
              <li key={e.id} className="card flex flex-wrap items-center gap-3 p-4">
                <span
                  aria-hidden
                  className="dot size-2.5 shrink-0 rounded-full"
                  style={
                    {
                      '--slice-light': category?.color_light ?? 'var(--ink-mute)',
                      '--slice-dark': category?.color_dark ?? 'var(--ink-mute)',
                    } as React.CSSProperties
                  }
                />
                <div className="min-w-40 flex-1">
                  <p className="font-medium">{e.description}</p>
                  <p className="text-sm text-[var(--ink-mute)]">
                    {formatDateShort(e.date)} · {category?.name ?? 'Uncategorised'} · {e.payment_method}
                    {job ? ` · ${job.name}` : ''}
                  </p>
                </div>
                <span className="num font-medium">{formatNaira(e.amount)}</span>
                <div className="flex gap-2">
                  <Dialog
                    title="Edit expense"
                    trigger={
                      <button className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink-600)]">
                        <Pencil size={14} />
                      </button>
                    }
                  >
                    <ExpenseForm mode="edit" categories={categories} jobs={jobs} expense={e} />
                  </Dialog>
                  <form action={deleteExpense}>
                    <input type="hidden" name="id" value={e.id} />
                    <ConfirmButton
                      message={`Delete "${e.description}" (${formatNaira(e.amount)}, ${formatDateShort(e.date)})?`}
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
