import Link from 'next/link';
import { DISPLAY } from './styles';

/**
 * The mockup's floating "Welcome back" card.
 *
 * In the mockup this is a fully drawn login form. It does NOT ship as one. A form
 * that looks live but posts nowhere is a trap: a visitor types a real password
 * into it and nothing happens. So the field-shaped elements are `<div>`s — no
 * `<input>`, nothing focusable — and the whole presentational body is
 * `aria-hidden`.
 *
 * The card used to be a single `<a href="/login">` wrapping everything, which
 * made the "Create an account →" line at the bottom navigate to the login page:
 * a visible affordance whose destination is not what it says. The card is now a
 * plain `<div>` carrying two real links — "Log in" → `/login` and "Create an
 * account" → `/signup` — because they are genuinely two destinations and an
 * anchor cannot legally nest inside another anchor. Assistive technology sees
 * exactly those two links and nothing else; the eye still sees the mockup's card.
 * The trade is the whole-card click target, which was never worth a wrong door.
 */
export function LoginCard() {
  return (
    <div className="w-full rounded-2xl border border-[var(--land-line)] bg-[var(--land-surface)] p-5 shadow-[var(--land-shadow-lg)]">
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
      </div>

      {/* The one real control in the card body. It looks like the mockup's submit
          button, and it goes where a submit button on a login card would take
          you: the actual login page. */}
      <Link
        href="/login"
        className="land-focus land-motion mt-4 grid h-9 place-items-center rounded-full bg-[linear-gradient(180deg,var(--land-brown)_0%,var(--land-brown-2)_100%)] text-xs font-semibold text-[var(--land-on-brown)] transition-[filter] hover:brightness-110"
      >
        Log in
      </Link>

      <div aria-hidden="true" className="my-3 flex items-center gap-2">
        <span className="h-px flex-1 bg-[var(--land-line)]" />
        <span className="text-[10px] text-[var(--land-ink-soft)]">or</span>
        <span className="h-px flex-1 bg-[var(--land-line)]" />
      </div>

      <Link
        href="/signup"
        className="land-focus block text-center text-xs font-medium text-[var(--land-ink)] transition-opacity hover:opacity-70"
      >
        Create an account <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
