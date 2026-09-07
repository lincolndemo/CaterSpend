import Link from 'next/link';
import { ChefHat } from './icons';
import { DISPLAY, SCRIPT } from './styles';

/**
 * The mockup's footer also carried social icons and Blog and Support links.
 * There are no such accounts and no such pages, so they are omitted rather than
 * shipped as dead links — see the commented slot below for where they go once
 * they exist. Only working destinations are linked here.
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--land-line)] bg-[var(--land-cream)] py-12">
      <div className="land-shell">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex items-center gap-2.5 text-[var(--land-ink)]">
            <span className="grid size-9 place-items-center rounded-full bg-[var(--land-brown)] text-[var(--land-on-brown)]">
              <ChefHat className="size-5" />
            </span>
            <span className={`${DISPLAY} text-xl font-semibold`}>CaterSpend</span>
          </span>

          <span aria-hidden="true" className="my-1 h-px w-full max-w-xs bg-[var(--land-line)]" />

          <p className={`${SCRIPT} text-xl text-[var(--land-gold-ink)]`}>Simple Finances. Tastier Tomorrows.</p>
        </div>

        <nav
          aria-label="Footer"
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm"
        >
          <a href="#features" className="land-focus text-[var(--land-ink-soft)] hover:text-[var(--land-ink)]">
            Features
          </a>
          <a
            href="#how-it-works"
            className="land-focus text-[var(--land-ink-soft)] hover:text-[var(--land-ink)]"
          >
            How It Works
          </a>
          <Link href="/login" className="land-focus text-[var(--land-ink-soft)] hover:text-[var(--land-ink)]">
            Log in
          </Link>
          <Link
            href="/signup"
            className="land-focus font-semibold text-[var(--land-ink)] hover:opacity-70"
          >
            Start Tracking
          </Link>
        </nav>

        {/*
          SLOT: social links and content pages.
          Add them here once the accounts and pages actually exist — e.g. an
          `aria-label="Social"` nav of icon links (X, Instagram, Facebook) using
          the icons module, plus Blog and Support entries in the nav above. They
          were deliberately left out of this build because there is nothing for
          them to point at.
        */}

        <p className="mt-8 text-center text-xs text-[var(--land-ink-soft)]">
          © 2026 CaterSpend. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
