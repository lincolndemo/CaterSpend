import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { PRIMARY_BTN } from './styles';

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
 *
 * The brand lockup is the shared `Logo` component, so this header, the app shell
 * and the auth screens all show the same mark and all link to the same place.
 *
 * It replaced a chef-hat circle plus a separate "CaterSpend" wordmark that had to
 * be hidden below 360px: at 320px the pair plus the shrink-0 right group
 * overflowed the shell by roughly 55px, and the page wrapper clips rather than
 * scrolls, so "Start Tracking" was cut off and unreachable. The lockup is about
 * 96px wide at `h-8` against roughly 150px for the old pair, so it fits at 320px
 * with room to spare and needs no responsive hiding — the wordmark now survives
 * at every width instead of disappearing on the narrowest phones.
 *
 * `priority` is set because the lockup sits in the hero viewport; without it Next
 * lazy-loads the image and the brand pops in after first paint.
 */
export function LandingHeader() {
  return (
    <header className="relative z-10">
      <div className="land-shell flex items-center justify-between gap-4 py-5">
        <Logo className="h-8 w-auto sm:h-9" priority />

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
