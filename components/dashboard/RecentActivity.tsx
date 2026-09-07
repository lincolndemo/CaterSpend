import { formatDateShort } from '@/lib/dates';
import { formatNaira } from '@/lib/money';
import type { Category, Expense, Income, Job } from '@/lib/types';

type Entry = {
  id: string;
  kind: 'expense' | 'income';
  date: string;
  created_at: string;
  description: string;
  amount: number;
  detail: string;
};

export function RecentActivity({
  expenses,
  income,
  categories,
  jobs,
}: {
  expenses: Expense[];
  income: Income[];
  categories: Category[];
  jobs: Job[];
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const jobById = new Map(jobs.map((j) => [j.id, j]));

  const entries: Entry[] = [
    ...expenses.map((e) => ({
      id: `e-${e.id}`,
      kind: 'expense' as const,
      date: e.date,
      created_at: e.created_at,
      description: e.description,
      amount: e.amount,
      detail: [categoryById.get(e.category_id)?.name, e.job_id ? jobById.get(e.job_id)?.name : null]
        .filter(Boolean)
        .join(' · '),
    })),
    ...income.map((i) => ({
      id: `i-${i.id}`,
      kind: 'income' as const,
      date: i.date,
      created_at: i.created_at,
      description: i.description,
      amount: i.amount,
      detail: [i.source, i.job_id ? jobById.get(i.job_id)?.name : null].filter(Boolean).join(' · '),
    })),
  ]
    .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.created_at < b.created_at ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="card grid gap-3 p-5">
      <h2 className="font-medium">Recent activity</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-[var(--ink-mute)]">Nothing recorded yet.</p>
      ) : (
        <ul className="grid gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-[var(--ink-mute)]">{formatDateShort(entry.date)}</span>
              <span className="flex-1">
                {entry.description}
                {entry.detail && <span className="text-[var(--ink-mute)]"> · {entry.detail}</span>}
              </span>
              <span
                className="num font-medium"
                style={{ color: entry.kind === 'income' ? 'var(--good)' : 'var(--ink-900)' }}
              >
                {entry.kind === 'income' ? '+' : '−'}
                {formatNaira(entry.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
