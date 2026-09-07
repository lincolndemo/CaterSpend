'use client';

export function ConfirmButton({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--critical)] hover:bg-[var(--surface-2)]"
    >
      {children}
    </button>
  );
}
