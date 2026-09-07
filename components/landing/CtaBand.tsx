import Link from 'next/link';
import { Gift, Pot, Shield } from './icons';
import { DISPLAY, GOLD_BTN } from './styles';

/**
 * The mockup put "Join hundreds of caterers who trust CaterSpend" here, and
 * "Trusted by small businesses" in the trust column. Both are fabricated social
 * proof for a product with no users, so neither ships. The supporting line and
 * the three trust items below are all statements that are true today.
 */

const TRUST = [
  { Icon: Gift, label: 'Free to use' },
  { Icon: Shield, label: 'Your data stays yours' },
  { Icon: Pot, label: 'Built for the food industry' },
];

export function CtaBand() {
  return (
    <section className="bg-[var(--land-cream)] py-20 lg:py-24">
      <div className="land-shell">
        <div className="grid items-center gap-10 rounded-[28px] bg-[var(--land-brown-deep)] px-7 py-10 sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_auto_minmax(0,0.85fr)] lg:gap-12 lg:px-14 lg:py-14">
          <div>
            <h2
              className={`${DISPLAY} text-[clamp(1.7rem,3.6vw,2.4rem)] font-semibold leading-tight tracking-[-0.015em] text-[var(--land-on-brown)]`}
            >
              Ready to take control of your catering finances?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--land-on-brown-soft)] sm:text-base">
              Set up your account and start tracking in a few minutes.
            </p>
          </div>

          <div className="text-center">
            <Link href="/signup" className={GOLD_BTN}>
              Start Tracking
              <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-3 text-xs text-[var(--land-on-brown-soft)]">No credit card required.</p>
          </div>

          {/* Hairline rule: a left border from `lg` up, a top border when the
              panel stacks, so the separator never floats loose. */}
          <ul className="space-y-4 border-t border-white/15 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            {TRUST.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-[var(--land-on-brown-soft)]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-[var(--land-gold-bright)]">
                  <Icon className="size-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
