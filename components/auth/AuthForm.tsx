'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { IDLE_STATE, type ActionState } from '@/lib/validation';

type Props = {
  mode: 'login' | 'signup';
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, IDLE_STATE);
  const isSignup = mode === 'signup';

  if (isSignup && state.ok) {
    return (
      <p className="text-[var(--ink-600)]">
        Check your inbox to confirm your email, then <Link className="text-[var(--accent)] underline" href="/login">sign in</Link>.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      {isSignup && (
        <label className="grid gap-1.5 text-sm">
          <span className="text-[var(--ink-600)]">Business name</span>
          <input
            name="business_name"
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
            placeholder="Chioma Catering"
          />
        </label>
      )}

      <label className="grid gap-1.5 text-sm">
        <span className="text-[var(--ink-600)]">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
        />
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="text-[var(--ink-600)]">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--critical)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        {pending ? 'Working…' : isSignup ? 'Create account' : 'Sign in'}
      </button>
    </form>
  );
}
