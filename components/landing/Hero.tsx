import Link from 'next/link';
import { DashboardPreview } from './DashboardPreview';
import { LoginCard } from './LoginCard';
import { Calendar, Coins, Play, Receipt } from './icons';
import { DISPLAY, EYEBROW, ICON_TINT, PRIMARY_BTN, SCRIPT, SECONDARY_BTN } from './styles';

const CHIPS = [
  { Icon: Receipt, title: 'Expense Tracking', body: 'Keep every cost in view' },
  { Icon: Coins, title: 'Profit Overview', body: "See what you're really making" },
  { Icon: Calendar, title: 'Job-Based Records', body: 'Track events from start to finish' },
];

export function Hero() {
  return (
    <section className="relative isolate pb-20 pt-8 lg:pb-16 lg:pt-12">
      {/*
        HERO ATMOSPHERE — the one element to change if a real photograph is ever
        licensed. The mockup composed this hero over food photography; none is
        available, so `.land-hero-bg` (globals.css) layers soft cream, blush and
        sage radial gradients and `.land-grain` adds a faint SVG noise. Swapping in
        a photo means editing that one CSS rule. It reaches up behind the
        transparent header via the negative top offset.

        `isolate` on the section is load-bearing, not decoration. Without it the
        nearest stacking context is <html>, so this `-z-10` layer paints at step 2
        of the CSS painting order and the opaque backgrounds of the page wrapper
        (app/page.tsx) and `html, body` (globals.css) paint over it at step 3 —
        the gradients are never seen. `isolate` creates a stacking context on the
        section, so `-z-10` resolves here: above the section's own transparent
        background, below the section's content. Do not remove it.
      */}
      <div aria-hidden="true" className="land-hero-bg land-grain absolute inset-x-0 -top-28 bottom-0 -z-10" />

      <div className="land-shell grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
        {/* left column */}
        <div>
          {/* Set verbatim in capitals, as the brief specifies the string; the
              `uppercase` in EYEBROW is then a no-op that keeps the two eyebrows
              rendering identically. */}
          <p className={EYEBROW}>SIMPLE TOOLS. A MORE PROFITABLE TOMORROW.</p>

          <h1
            className={`${DISPLAY} mt-4 text-[clamp(2.4rem,7vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-[var(--land-ink)]`}
          >
            Know exactly where your catering money goes.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--land-ink-soft)] sm:text-lg">
            Track expenses, income and jobs in one simple dashboard built for caterers and food businesses.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className={`${PRIMARY_BTN} px-6 py-3`}>
              Start Tracking
              <span aria-hidden="true">→</span>
            </Link>
            {/* No product demo exists yet, so this scrolls to the feature section
                rather than inventing a destination. */}
            <a href="#features" className={`${SECONDARY_BTN} px-6 py-3`}>
              <Play className="size-4" />
              View Demo
            </a>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-3">
            {CHIPS.map(({ Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <span className={ICON_TINT}>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--land-ink)]">{title}</span>
                  <span className="block text-xs leading-snug text-[var(--land-ink-soft)]">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* right column: the product preview, with the login card overlapping its
            lower-right corner from `lg` up. Below that the two simply stack, which
            is what keeps the pair from overflowing on a phone. */}
        <div className="relative lg:pb-32 lg:pr-4">
          {/* Handwritten flourish, in place of the mockup's script lettering over a
              photograph. Decorative: it repeats nothing the copy does not say. */}
          <p
            aria-hidden="true"
            className={`${SCRIPT} mb-3 hidden text-2xl text-[var(--land-gold-ink)] lg:block`}
          >
            your kitchen, in numbers
          </p>

          <DashboardPreview />

          <div className="mt-6 sm:mx-auto sm:max-w-sm lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:w-60 lg:max-w-none">
            <LoginCard />
          </div>
        </div>
      </div>
    </section>
  );
}
