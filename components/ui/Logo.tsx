import Image from 'next/image';
import Link from 'next/link';

/**
 * The CaterSpend logo lockup, always linked to the landing page.
 *
 * Every surface that shows the brand — the app shell, the auth screens, the
 * landing header — uses this, so the mark is identical everywhere and the click
 * target always goes to the same place.
 *
 * The link points at `/` rather than `/dashboard` even for a signed-in user.
 * That is deliberate and it is why `lib/supabase/middleware.ts` no longer
 * bounces an authenticated request for `/` to the dashboard: the landing page is
 * a real page a signed-in owner may want to reach — to show someone what the
 * product is, or to get to a marketing section — and a logo that silently
 * refuses to go home is worse than one that does.
 *
 * `width`/`height` are the asset's intrinsic pixels, which Next uses only to
 * derive the aspect ratio and reserve space against layout shift. Actual size
 * comes from `className`, which every call site sets as a height with `w-auto`.
 *
 * The asset is a single dark-brown-on-transparent lockup. On the dark theme that
 * brown sits at roughly 1.2:1 against `--page` (#101513) and is effectively
 * invisible, so `.dark .brand-logo` in globals.css lifts it to warm cream. That
 * is a filter on one asset rather than a second file: it keeps the silhouette and
 * the wordmark exact, at the cost of flattening the gold coin to the same cream.
 * A purpose-made light variant would be better and would drop the filter rule.
 */
export function Logo({
  className = 'h-8 w-auto',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href="/" className="land-focus inline-flex items-center" aria-label="CaterSpend home">
      <Image
        src="/logo.png"
        alt="CaterSpend"
        width={2172}
        height={724}
        priority={priority}
        className={`brand-logo ${className}`}
      />
    </Link>
  );
}
