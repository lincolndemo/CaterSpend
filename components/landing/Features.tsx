import { Chart, Pot, Receipt } from './icons';
import { CARD, DISPLAY, EYEBROW, ICON_TINT } from './styles';

const FEATURES = [
  {
    Icon: Receipt,
    title: 'Track every expense',
    body: 'Record ingredients, transport, packaging and more.',
  },
  {
    Icon: Pot,
    title: 'See profit by job',
    body: 'Monitor spending and income for each event or order.',
  },
  {
    Icon: Chart,
    title: 'Make better decisions',
    body: 'Use simple charts to spot patterns and control costs.',
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-[var(--land-cream)] py-20 lg:py-24">
      <div className="land-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className={EYEBROW}>BUILT FOR CATERERS, BY PEOPLE WHO GET IT.</p>
          <h2
            className={`${DISPLAY} mt-3 text-[clamp(1.85rem,4.5vw,2.75rem)] font-semibold leading-tight tracking-[-0.015em] text-[var(--land-ink)]`}
          >
            Tools to help your catering business grow
          </h2>
          <span aria-hidden="true" className="mx-auto mt-5 block h-0.5 w-16 rounded-full bg-[var(--gold)]" />
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }) => (
            <li key={title} className={`${CARD} p-7`}>
              <span className={ICON_TINT}>
                <Icon className="size-6" />
              </span>
              <h3 className={`${DISPLAY} mt-5 text-xl font-semibold text-[var(--land-ink)]`}>{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--land-ink-soft)]">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
