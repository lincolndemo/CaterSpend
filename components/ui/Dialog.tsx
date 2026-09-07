'use client';

import { useEffect, useRef, useState } from 'react';

export function Dialog({
  trigger,
  title,
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('caterspend:close', close);
    return () => window.removeEventListener('caterspend:close', close);
  }, []);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        className="w-[min(28rem,92vw)] rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-0 text-[var(--ink-900)] backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
          <h3 className="font-medium">{title}</h3>
          <button type="button" onClick={() => setOpen(false)} className="text-[var(--ink-mute)]" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </dialog>
    </>
  );
}

export function closeDialog() {
  window.dispatchEvent(new Event('caterspend:close'));
}
