import Link from 'next/link';

/**
 * A signed-out visitor can reach this page: the middleware matcher excludes
 * paths ending in an image extension, so a broken image URL renders the 404
 * without an auth redirect. Sending that stranger to /dashboard put them behind
 * a login wall. `/` is the public marketing page and is where a lost visitor
 * belongs; a signed-in visitor who lands here is bounced from `/` straight on
 * to /dashboard by the middleware, so the one link serves both.
 */
export default function NotFound() {
  return (
    <main className="shell grid min-h-dvh place-items-center">
      <div className="text-center">
        <p className="mb-2 font-medium">Page not found.</p>
        <Link className="text-[var(--accent)] underline" href="/">
          Back to CaterSpend
        </Link>
      </div>
    </main>
  );
}
