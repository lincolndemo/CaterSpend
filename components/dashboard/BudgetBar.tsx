import { formatNaira } from '@/lib/money';
import { budgetStatus } from '@/lib/totals';

const COLORS = {
  good: 'var(--good)',
  warning: 'var(--warning)',
  critical: 'var(--critical)',
} as const;

export function BudgetBar({ spent, budget }: { spent: number; budget: number | null }) {
  const status = budgetStatus(spent, budget);
  if (!status || budget === null) return null;

  return (
    <div className="card grid gap-2 p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-medium">This month against budget</h2>
        <span className="num text-sm text-[var(--ink-600)]">
          {formatNaira(spent)} of {formatNaira(budget)}
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(status.pct, 100))}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(status.pct, 100)}%`, background: COLORS[status.state] }}
        />
      </div>
      <p className="text-sm" style={{ color: COLORS[status.state] }}>
        {Math.round(status.pct)}% used
        {status.state === 'critical' ? ' — over budget' : status.state === 'warning' ? ' — getting close' : ''}
      </p>
    </div>
  );
}
