import { formatNaira, formatNairaCompact } from '@/lib/money';
import { DISPLAY } from './styles';

/**
 * STATIC MARKETING MOCK — NOT THE REAL DASHBOARD.
 *
 * Every figure below is hardcoded illustrative data for a fictional caterer. This
 * component never calls `loadWorkspace()`, never touches Supabase, and renders
 * identically for every visitor including signed-out ones. It exists only to show
 * what the product looks like. If the dashboard's layout changes, this may drift;
 * that is acceptable — it is a picture, drawn in HTML rather than shipped as a
 * screenshot so it stays crisp, themable and weightless.
 *
 * The whole block is `aria-hidden`: it is decoration, and none of it is operable.
 */

const KPIS = [
  { label: 'Spent this month', value: 486_500, tone: 'var(--land-ink)' },
  { label: 'Collected', value: 742_000, tone: 'var(--good)' },
  { label: 'Net', value: 255_500, tone: 'var(--good)' },
  { label: 'Outstanding', value: 180_000, tone: 'var(--land-gold-ink)' },
];

const SLICES = [
  { name: 'Ingredients', pct: 42, amount: 204_330, color: '#6B4226' },
  { name: 'Transport', pct: 18, amount: 87_570, color: '#A5680F' },
  { name: 'Packaging', pct: 15, amount: 72_975, color: '#C08552' },
  { name: 'Staff', pct: 14, amount: 68_110, color: '#7E9A6C' },
  { name: 'Gas', pct: 11, amount: 53_515, color: '#B2533E' },
];

const MONTHS = [
  { label: 'Apr', expense: 310, income: 430 },
  { label: 'May', expense: 402, income: 505 },
  { label: 'Jun', expense: 355, income: 610 },
  { label: 'Jul', expense: 470, income: 640 },
  { label: 'Aug', expense: 421, income: 700 },
  { label: 'Sep', expense: 486, income: 742 },
];

const ROWS = [
  { what: 'Tomatoes & peppers', where: 'Ingredients', amount: 42_500 },
  { what: 'Cooler van hire', where: 'Transport', amount: 18_000 },
  { what: 'Disposable packs', where: 'Packaging', amount: 26_750 },
  { what: 'Cooking gas refill', where: 'Gas', amount: 31_200 },
];

const NAV = ['Dashboard', 'Expenses', 'Income', 'Jobs', 'Settings'];

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_BAR = Math.max(...MONTHS.map((m) => Math.max(m.expense, m.income)));

export function DashboardPreview() {
  let travelled = 0;

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-[var(--land-line)] bg-[var(--land-surface)] shadow-[var(--land-shadow-lg)]"
    >
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--land-line)] bg-[var(--land-cream-2)] px-3 py-2">
        <span className="size-2 rounded-full bg-[#E0685E]" />
        <span className="size-2 rounded-full bg-[#E8B44A]" />
        <span className="size-2 rounded-full bg-[#7E9A6C]" />
        <span className="ml-2 truncate rounded-full bg-[var(--land-surface)] px-2.5 py-0.5 text-[9px] text-[var(--land-ink-soft)]">
          caterspend.app/dashboard
        </span>
      </div>

      <div className="flex">
        {/* sidebar — hidden on the narrowest screens so the panels below keep their width */}
        <div className="hidden w-28 shrink-0 flex-col gap-1 border-r border-[var(--land-line)] bg-[var(--land-cream-2)] p-3 sm:flex">
          <span className={`${DISPLAY} mb-2 text-[11px] font-semibold text-[var(--land-ink)]`}>
            CaterSpend
          </span>
          {NAV.map((item, i) => (
            <span
              key={item}
              className={`rounded-md px-2 py-1 text-[10px] ${
                i === 0
                  ? 'bg-[var(--land-brown)] font-semibold text-[var(--land-on-brown)]'
                  : 'text-[var(--land-ink-soft)]'
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 p-3">
          <div className="mb-2.5 flex items-baseline justify-between gap-2">
            <span className={`${DISPLAY} truncate text-xs font-semibold text-[var(--land-ink)]`}>
              Chioma&apos;s Kitchen
            </span>
            <span className="shrink-0 text-[9px] text-[var(--land-ink-soft)]">September</span>
          </div>

          {/* KPI tiles */}
          <div className="mb-2.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-[var(--land-line)] px-2 py-1.5">
                <p className="truncate text-[8px] uppercase tracking-wide text-[var(--land-ink-soft)]">
                  {kpi.label}
                </p>
                <p className="num truncate text-[11px] font-medium" style={{ color: kpi.tone }}>
                  {formatNaira(kpi.value)}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-2.5 grid gap-1.5 lg:grid-cols-2">
            {/* donut */}
            <div className="rounded-lg border border-[var(--land-line)] p-2">
              <p className="mb-1 text-[9px] font-medium text-[var(--land-ink)]">Spending by category</p>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 70 70" className="size-16 shrink-0">
                  <g transform="translate(35,35) rotate(-90)">
                    {SLICES.map((slice) => {
                      const dash = (slice.pct / 100) * CIRCUMFERENCE;
                      const offset = -travelled;
                      travelled += dash;
                      return (
                        <circle
                          key={slice.name}
                          r={RADIUS}
                          fill="none"
                          stroke={slice.color}
                          strokeWidth={10}
                          strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                          strokeDashoffset={offset}
                        />
                      );
                    })}
                  </g>
                </svg>
                <ul className="min-w-0 flex-1 space-y-0.5">
                  {SLICES.slice(0, 4).map((slice) => (
                    <li key={slice.name} className="flex items-center gap-1.5 text-[8px]">
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: slice.color }} />
                      <span className="min-w-0 flex-1 truncate text-[var(--land-ink-soft)]">{slice.name}</span>
                      <span className="num shrink-0 text-[var(--land-ink)]">
                        {formatNairaCompact(slice.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* bars */}
            <div className="rounded-lg border border-[var(--land-line)] p-2">
              <p className="mb-1 text-[9px] font-medium text-[var(--land-ink)]">Last six months</p>
              <div className="flex h-16 items-end gap-1.5">
                {MONTHS.map((m) => (
                  <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-12 w-full items-end justify-center gap-0.5">
                      <div
                        className="w-1/3 rounded-t-sm bg-[#6B4226]"
                        style={{ height: `${(m.expense / MAX_BAR) * 100}%` }}
                      />
                      <div
                        className="w-1/3 rounded-t-sm bg-[#7E9A6C]"
                        style={{ height: `${(m.income / MAX_BAR) * 100}%` }}
                      />
                    </div>
                    <span className="text-[7px] text-[var(--land-ink-soft)]">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* recent expenses */}
          <div className="rounded-lg border border-[var(--land-line)] p-2">
            <p className="mb-1 text-[9px] font-medium text-[var(--land-ink)]">Recent expenses</p>
            <ul>
              {ROWS.map((row) => (
                <li
                  key={row.what}
                  className="flex items-center gap-2 border-t border-[var(--land-line)] py-1 text-[9px] first:border-t-0"
                >
                  <span className="min-w-0 flex-1 truncate text-[var(--land-ink)]">{row.what}</span>
                  <span className="hidden shrink-0 rounded-full bg-[var(--land-tint)] px-1.5 py-0.5 text-[8px] text-[var(--land-ink-soft)] sm:inline">
                    {row.where}
                  </span>
                  <span className="num shrink-0 text-[var(--land-ink)]">{formatNaira(row.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
