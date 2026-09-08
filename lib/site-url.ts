/**
 * Where the app thinks it lives.
 *
 * Pure and unit tested rather than inline in the sign-up action, because getting it wrong is
 * invisible until users start reporting that they cannot confirm their accounts.
 */

/** Anything with a header lookup: a `Headers`, or the result of `await headers()`. */
type HeaderReader = { get(name: string): string | null };

const LOCAL_ORIGIN = 'http://localhost:3000';

/**
 * The absolute origin to build links back into this app with — confirmation emails, above all.
 *
 * Precedence, first hit wins:
 *
 * 1. `NEXT_PUBLIC_SITE_URL`. An explicit operator override always wins: behind a proxy that
 *    rewrites or drops the forwarded headers, the request's own idea of its host can be wrong,
 *    and the operator's cannot.
 * 2. The forwarded origin from the request. Vercel sets both `x-forwarded-proto` and
 *    `x-forwarded-host`; a plainer host sets only `host`.
 * 3. `http://localhost:3000`, for a bare `next dev` with no proxy in front of it.
 *
 * The fallback used to be step 3 alone, which meant a deployment without `NEXT_PUBLIC_SITE_URL`
 * mailed every new user a confirmation link to `http://localhost:3000/auth/callback` — a link that
 * resolves to the user's own machine, where nothing is listening. The account stayed unconfirmed,
 * sign-in refused it, and nothing was logged on the operator's side. Deriving the origin from the
 * request that is actually being served makes the correct value the default rather than a
 * configuration step somebody has to remember.
 */
export function resolveSiteOrigin(headers: HeaderReader): string {
  const configured = normaliseConfiguredOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  // Either header can arrive as a comma-separated chain when more than one proxy is in the path
  // ("https,http"). The first entry is the one closest to the client, which is the public one.
  const host = firstEntry(headers.get('x-forwarded-host')) ?? firstEntry(headers.get('host'));
  if (!host) return LOCAL_ORIGIN;

  const proto = firstEntry(headers.get('x-forwarded-proto')) ?? (isLocalHost(host) ? 'http' : 'https');
  return `${proto}://${host}`;
}

/**
 * Accepts what an operator is likely to paste. A bare `caterspend.example.com` with no scheme
 * would otherwise produce `caterspend.example.com/auth/callback`, a relative path inside an email.
 */
function normaliseConfiguredOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withScheme.replace(/\/+$/, '');
}

function firstEntry(value: string | null): string | null {
  const first = value?.split(',')[0]?.trim();
  return first ? first : null;
}

function isLocalHost(host: string): boolean {
  const hostname = host.replace(/:\d+$/, '').toLowerCase();
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]'
  );
}
