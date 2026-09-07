import { formatNairaCompact } from '@/lib/money';
import type { MonthBucket } from '@/lib/totals';

export function MonthlyBars({ buckets, currentKey }: { buckets: MonthBucket[]; currentKey: string }) {
  const max = Math.max(1, ...buckets.map((b) => Math.max(b.expense, b.income)));

  return (
    <div className="card grid gap-4 p-5">
      <h2 className="font-medium">Last six months</h2>

      <div className="flex items-end gap-3" role="img" aria-label="Expenses and income by month">
        {buckets.map((b) => (
          <div key={b.key} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="num text-xs text-[var(--ink-mute)]">{formatNairaCompact(b.expense)}</span>
            <div className="flex h-32 w-full items-end justify-center gap-1">
              <div
                title={`Expenses ${formatNairaCompact(b.expense)}`}
                className="w-1/3 rounded-t"
                style={{
                  height: `${(b.expense / max) * 100}%`,
                  background: b.key === currentKey ? 'var(--gold)' : 'var(--accent)',
                }}
              />
              <div
                title={`Income ${formatNairaCompact(b.income)}`}
                className="w-1/3 rounded-t"
                style={{ height: `${(b.income / max) * 100}%`, background: 'var(--good)' }}
              />
            </div>
            <span className="text-xs text-[var(--ink-600)]">{b.label}</span>
          </div>
        ))}
      </div>

      <p className="flex gap-4 text-xs text-[var(--ink-mute)]">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm" style={{ background: 'var(--accent)' }} /> Expenses
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm" style={{ background: 'var(--good)' }} /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm" style={{ background: 'var(--gold)' }} /> This month
        </span>
      </p>
    </div>
  );
}
