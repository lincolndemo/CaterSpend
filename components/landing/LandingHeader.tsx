import Link from 'next/link';
import { ChefHat } from './icons';
import { DISPLAY, PRIMARY_BTN } from './styles';

/**
 * Transparent header sitting over the hero.
 *
 * The nav carries only "Features" and "How It Works" — both in-page anchors to
 * sections that exist on this page. The mockup also showed "Pricing" and a
 * "Resources" dropdown; both are omitted. There is no pricing (billing is an
 * explicit project non-goal) and there are no resource pages, and a nav item
 * that leads nowhere — or that implies a paid tier — is worse than a short nav.
 *
 * The anchor nav is hidden below `md`. A drawer would need client JavaScript,
 * and both destinations are a short scroll away on a phone; the two controls
 * that matter (Log in, Start Tracking) stay visible at every width.
 */
export function LandingHeader() {
  return (
    <header className="relative z-10">
      <div className="land-shell flex items-center justify-between gap-4 py-5">
        <Link
          href="/"
          className="land-focus flex items-center gap-2.5 text-[var(--land-ink)]"
          aria-label="CaterSpend home"
        >
          <span className="grid size-8 place-items-center rounded-full bg-[var(--land-brown)] text-[var(--land-on-brown)] sm:size-9">
            <ChefHat className="size-4.5 sm:size-5" />
          </span>
          <span className={`${DISPLAY} text-lg font-semibold tracking-tight sm:text-xl`}>CaterSpend</span>
        </Link>

        <nav aria-label="Sections" className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="land-focus text-sm font-medium text-[var(--land-ink-soft)] transition-colors hover:text-[var(--land-ink)]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="land-focus text-sm font-medium text-[var(--land-ink-soft)] transition-colors hover:text-[var(--land-ink)]"
          >
            How It Works
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <Link
            href="/login"
            className="land-focus whitespace-nowrap text-[13px] font-medium text-[var(--land-ink)] transition-opacity hover:opacity-70 sm:text-sm"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`${PRIMARY_BTN} whitespace-nowrap px-3.5 py-2 text-[13px] sm:px-5 sm:py-2.5 sm:text-sm`}
          >
            Start Tracking
          </Link>
        </div>
      </div>
    </header>
  );
}
