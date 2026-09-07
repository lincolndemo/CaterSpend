'use client';

import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { inputClass } from '@/components/ui/Field';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { createCategory, deleteCategory } from '@/app/actions/categories';
import { IDLE_STATE } from '@/lib/validation';
import type { Category } from '@/lib/types';

export function CategoryManager({ categories }: { categories: Category[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [addState, addAction] = useActionState(createCategory, IDLE_STATE);
  const [removeState, removeAction] = useActionState(deleteCategory, IDLE_STATE);

  useEffect(() => {
    if (addState.ok) {
      toast.success('Category added.');
      formRef.current?.reset();
    }
  }, [addState]);

  useEffect(() => {
    if (removeState.ok) toast.success('Category removed.');
    if (removeState.error) toast.error(removeState.error);
  }, [removeState]);

  return (
    <section className="card grid gap-4 p-5">
      <h2 className="font-medium">Categories</h2>

      <ul className="grid gap-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-lg bg-[var(--surface-2)] px-3 py-2">
            <span
              aria-hidden
              className="dot size-2.5 rounded-full"
              style={{ '--slice-light': c.color_light, '--slice-dark': c.color_dark } as React.CSSProperties}
            />
            <span className="flex-1 text-sm">{c.name}</span>
            {c.is_builtin ? (
              <span className="text-xs text-[var(--ink-mute)]">Built in</span>
            ) : (
              <form action={removeAction}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="text-sm text-[var(--critical)]">
                  Remove
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <form ref={formRef} action={addAction} className="flex flex-wrap items-end gap-2">
        <input name="name" placeholder="New category" required className={`${inputClass} flex-1`} />
        <SubmitButton>Add</SubmitButton>
      </form>

      {addState.error && (
        <p role="alert" className="text-sm text-[var(--critical)]">
          {addState.error}
        </p>
      )}
    </section>
  );
}
