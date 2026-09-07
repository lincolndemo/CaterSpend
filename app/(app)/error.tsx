'use client';

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card grid place-items-center gap-3 p-10 text-center">
      <p className="font-medium">Something went wrong loading your records.</p>
      <button onClick={reset} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white">
        Try again
      </button>
    </div>
  );
}
