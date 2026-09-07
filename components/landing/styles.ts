/**
 * Shared class strings for the landing page.
 *
 * These live in one module rather than a wrapper component so every call site
 * can keep a literal `href` — `typedRoutes` checks those statically, and a
 * generic `<Button href={...}>` would hide the route behind a prop.
 */

export const PRIMARY_BTN =
  'land-focus land-motion inline-flex items-center justify-center gap-2 rounded-full ' +
  'bg-[linear-gradient(180deg,var(--land-brown)_0%,var(--land-brown-2)_100%)] ' +
  'px-5 py-2.5 text-sm font-semibold text-[var(--land-on-brown)] shadow-[var(--land-shadow)] ' +
  'transition-[filter,box-shadow] hover:brightness-110';

export const SECONDARY_BTN =
  'land-focus land-motion inline-flex items-center justify-center gap-2 rounded-full ' +
  'border border-[var(--land-brown)]/35 bg-[var(--land-surface)]/70 px-5 py-2.5 text-sm ' +
  'font-semibold text-[var(--land-ink)] transition-colors hover:bg-[var(--land-surface)]';

export const GOLD_BTN =
  'land-focus-invert land-motion inline-flex items-center justify-center gap-2 rounded-full ' +
  'bg-[var(--land-gold-bright)] px-6 py-3 text-sm font-bold text-[var(--land-brown-deep)] ' +
  'transition-[filter] hover:brightness-105';

export const EYEBROW = 'text-xs font-semibold uppercase tracking-[0.18em] text-[var(--land-gold-ink)]';

export const CARD =
  'rounded-3xl border border-[var(--land-line)] bg-[var(--land-surface)] shadow-[var(--land-shadow)]';

export const ICON_TINT =
  'grid size-12 shrink-0 place-items-center rounded-full bg-[var(--land-tint)] text-[var(--land-gold-ink)]';

export const DISPLAY = 'font-[family-name:var(--font-display)]';

export const SCRIPT = 'font-[family-name:var(--font-script)]';
