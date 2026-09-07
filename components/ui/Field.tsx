export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-[var(--ink-600)]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[var(--ink-900)]';
