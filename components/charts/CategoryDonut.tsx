import { donutSegments } from '@/lib/chart';
import { formatNaira } from '@/lib/money';
import type { CategorySlice } from '@/lib/totals';

const RADIUS = 50;

export function CategoryDonut({ slices, total }: { slices: CategorySlice[]; total: number }) {
  const segments = donutSegments(slices, RADIUS);

  return (
    <div className="card grid gap-4 p-5">
      <h2 className="font-medium">Spending by category</h2>

      {slices.length === 0 ? (
        <p className="text-sm text-[var(--ink-mute)]">No expenses recorded yet.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-6">
          <svg viewBox="0 0 140 140" className="size-36 shrink-0" role="img" aria-label="Spending by category">
            <g transform="translate(70,70) rotate(-90)">
              {slices.map((slice, i) => (
                <circle
                  key={slice.id}
                  className="slice"
                  r={RADIUS}
                  fill="none"
                  style={
                    { '--slice-light': slice.colorLight, '--slice-dark': slice.colorDark } as React.CSSProperties
                  }
                  strokeWidth={18}
                  strokeDasharray={`${segments[i].dash} ${segments[i].gap}`}
                  strokeDashoffset={segments[i].offset}
                />
              ))}
            </g>
            <text
              x="70"
              y="74"
              textAnchor="middle"
              className="num"
              fontSize="13"
              fill="var(--ink-900)"
            >
              {formatNaira(total)}
            </text>
          </svg>

          <ul className="grid flex-1 gap-1.5 text-sm">
            {slices.map((slice) => (
              <li key={slice.id} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="dot size-2.5 rounded-full"
                  style={
                    { '--slice-light': slice.colorLight, '--slice-dark': slice.colorDark } as React.CSSProperties
                  }
                />
                <span className="flex-1">{slice.name}</span>
                <span className="num text-[var(--ink-600)]">{formatNaira(slice.total)}</span>
                <span className="num w-12 text-right text-[var(--ink-mute)]">{Math.round(slice.pct)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
