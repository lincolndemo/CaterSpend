const TONES = {
  neutral: 'var(--ink-900)',
  good: 'var(--good)',
  critical: 'var(--critical)',
  gold: 'var(--gold)',
} as const;

export function KpiCard({
  label,
  value,
  tone = 'neutral',
  hint,
}: {
  label: string;
  value: string;
  tone?: keyof typeof TONES;
  hint?: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--ink-mute)]">{label}</p>
      <p className="num mt-1.5 text-xl font-medium" style={{ color: TONES[tone] }}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[var(--ink-mute)]">{hint}</p>}
    </div>
  );
}
