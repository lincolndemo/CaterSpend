/**
 * Hand-drawn inline SVG icons for the landing page.
 *
 * The project has `lucide-react` as a dependency, but the brief for this page
 * calls for hand-drawn icons in this module and no new packages; these are
 * written here so the landing page's icon set is self-contained and tuned to
 * the food-industry subject (chef hat, pot, receipt) rather than a generic set.
 *
 * Every icon is decorative: it is rendered next to its own text label, so each
 * carries `aria-hidden` and no accessible name. Size and colour come from the
 * caller via `className` (`currentColor` stroke, `size-*` utilities).
 */

type IconProps = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

export function ChefHat({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 13.5a3.5 3.5 0 0 1-1.2-6.8 3.6 3.6 0 0 1 3.5-3.2 3.6 3.6 0 0 1 3.7 2.2 3.6 3.6 0 0 1 3.7-2.2 3.6 3.6 0 0 1 3.5 3.2A3.5 3.5 0 0 1 18 13.5Z" />
      <path d="M6.6 13.5v5.2c0 .9.7 1.6 1.6 1.6h7.6c.9 0 1.6-.7 1.6-1.6v-5.2" />
      <path d="M6.8 17.2h10.4" />
    </svg>
  );
}

export function Receipt({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3h12v17.4l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3Z" />
      <path d="M9 8h6M9 11.5h6M9 15h3.5" />
    </svg>
  );
}

export function Chart({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16.5v-4.2M12 16.5V7.5M16 16.5v-6.6" />
    </svg>
  );
}

export function Pot({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.6 9.2h14.8v5.6a4 4 0 0 1-4 4H8.6a4 4 0 0 1-4-4Z" />
      <path d="M4.6 11.6H3M19.4 11.6H21" />
      <path d="M9.4 6.4c0-1 1-1.4 1-2.4M12 6.4c0-1 1-1.4 1-2.4M14.6 6.4c0-1 1-1.4 1-2.4" />
    </svg>
  );
}

export function Calendar({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.4" />
      <path d="M3.5 9.6h17M8.4 3.4v3.2M15.6 3.4v3.2" />
      <path d="M7.6 13.2h2.2M7.6 16.6h2.2M14.2 13.2h2.2" />
    </svg>
  );
}

export function Coins({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <ellipse cx="12" cy="6.6" rx="6.6" ry="2.8" />
      <path d="M5.4 6.6v4.8c0 1.5 3 2.8 6.6 2.8s6.6-1.3 6.6-2.8V6.6" />
      <path d="M5.4 11.4v5c0 1.6 3 2.8 6.6 2.8s6.6-1.2 6.6-2.8v-5" />
    </svg>
  );
}

export function Play({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M10.3 8.9 15.5 12l-5.2 3.1Z" fill="currentColor" />
    </svg>
  );
}

export function Shield({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.2 5 5.8v5.4c0 4 2.9 7.6 7 9.6 4.1-2 7-5.6 7-9.6V5.8Z" />
      <path d="m9.2 12.2 2 2 3.6-3.9" />
    </svg>
  );
}

export function Gift({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.6" y="9.4" width="16.8" height="11" rx="1.8" />
      <path d="M3.6 13.4h16.8M12 9.4v11" />
      <path d="M12 9.4S10.8 5 8.6 5a2 2 0 0 0 0 4.4Zm0 0S13.2 5 15.4 5a2 2 0 0 1 0 4.4Z" />
    </svg>
  );
}
