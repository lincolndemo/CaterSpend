import Link from 'next/link';
import { DISPLAY } from './styles';

/**
 * The mockup's floating "Welcome back" card.
 *
 * In the mockup this is a fully drawn login form. It does NOT ship as one. A form
 * that looks live but posts nowhere is a trap: a visitor types a real password
 * into it and nothing happens. So the whole card is a single link to `/login`,
 * and the field-shaped elements are `<div>`s — no `<input>`, nothing focusable,
 * the entire visual body `aria-hidden`. Assistive technology sees one link named
 * "Log in to CaterSpend"; the eye sees the card from the mockup.
 */
export function LoginCard() {
  return (
    <Link
      href="/login"
      aria-label="Log in to CaterSpend"
      className="land-focus land-motion block w-full rounded-2xl border border-[var(--land-line)] bg-[var(--land-surface)] p-5 shadow-[var(--land-shadow-lg)] transition-transform hover:-translate-y-0.5"
    >
      <div aria-hidden="true">
        <p className={`${DISPLAY} text-lg font-semibold text-[var(--land-ink)]`}>Welcome back</p>
        <p className="mt-0.5 text-xs text-[var(--land-ink-soft)]">
          Sign in to pick up where your books left off.
        </p>

        <div className="mt-4 space-y-2.5">
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--land-ink-soft)]">
              Email
            </p>
            <div className="flex h-8 items-center rounded-lg border border-[var(--land-line)] bg-[var(--land-cream-2)] px-2.5 text-xs text-[var(--land-ink-soft)]">
              you@yourkitchen.com
            </div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--land-ink-soft)]">
              Password
            </p>
            <div className="flex h-8 items-center rounded-lg border border-[var(--land-line)] bg-[var(--land-cream-2)] px-2.5 text-xs tracking-[0.3em] text-[var(--land-ink-soft)]">
              ••••••••
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--land-ink-soft)]">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-[4px] border border-[var(--land-line)] bg-[var(--land-cream-2)]" />
            Remember me
          </span>
          <span className="text-[var(--land-gold-ink)]">Forgot password?</span>
        </div>

        <div className="mt-4 grid h-9 place-items-center rounded-full bg-[linear-gradient(180deg,var(--land-brown)_0%,var(--land-brown-2)_100%)] text-xs font-semibold text-[var(--land-on-brown)]">
          Log in
        </div>

        <div className="my-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-[var(--land-line)]" />
          <span className="text-[10px] text-[var(--land-ink-soft)]">or</span>
          <span className="h-px flex-1 bg-[var(--land-line)]" />
        </div>

        <p className="text-center text-xs font-medium text-[var(--land-ink)]">Create an account →</p>
      </div>
    </Link>
  );
}
