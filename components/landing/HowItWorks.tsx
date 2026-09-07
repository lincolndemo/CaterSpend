import { DISPLAY, EYEBROW } from './styles';

/**
 * Not in the brief's section list, but required by it: the header nav ships
 * "How It Works" as an in-page anchor, and the brief forbids nav that leads
 * nowhere. So this section exists to be that destination.
 *
 * The brief supplies no copy for it, so the three steps below describe only what
 * the built app actually does — sign up, record expenses and income against a
 * job, read the dashboard. Nothing here promises a feature that does not exist.
 */

const STEPS = [
  {
    title: 'Create your account',
    body: 'Add your business name and a monthly budget. Nothing else to set up.',
  },
  {
    title: 'Record as you go',
    body: 'Log each expense and payment, and tag it to the job it belongs to.',
  },
  {
    title: 'Read your figures',
    body: 'Your dashboard totals the month, splits it by category and shows what each job earned.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-[var(--land-line)] bg-[var(--land-cream-2)] py-20 lg:py-24"
    >
      <div className="land-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className={EYEBROW}>HOW IT WORKS</p>
          {/* Not "then it runs itself": nothing runs itself. CaterSpend is manual
              entry, and the second step on this very screen says so. The headline
              describes the outcome the three steps produce, which is true. */}
          <h2
            className={`${DISPLAY} mt-3 text-[clamp(1.85rem,4.5vw,2.75rem)] font-semibold leading-tight tracking-[-0.015em] text-[var(--land-ink)]`}
          >
            Three steps to a clear picture of your money
          </h2>
          <span aria-hidden="true" className="mx-auto mt-5 block h-0.5 w-16 rounded-full bg-[var(--gold)]" />
        </div>

        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className={`${DISPLAY} grid size-10 shrink-0 place-items-center rounded-full border border-[var(--land-line)] bg-[var(--land-surface)] text-base font-semibold text-[var(--land-gold-ink)]`}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <h3 className={`${DISPLAY} text-lg font-semibold text-[var(--land-ink)]`}>{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--land-ink-soft)]">{step.body}</p>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
