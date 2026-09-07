export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card grid place-items-center gap-2 p-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="max-w-sm text-sm text-[var(--ink-mute)]">{body}</p>
      {action}
    </div>
  );
}
