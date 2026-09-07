const DEFAULT_NEXT_PATH = '/dashboard';

/**
 * The value of a `next` query parameter, reduced to something safe to append to our own origin.
 *
 * Only a same-origin relative path is accepted: one leading `/`, with the character after it
 * neither `/` nor `\`. Everything else falls back to the dashboard.
 *
 * The rejected shapes are not hypothetical. `next=@evil.com` concatenated onto an origin gives
 * `https://caterspend.example.com@evil.com`, which every URL parser reads as userinfo
 * `caterspend.example.com` against host **evil.com** — a phishing page reached through a link on
 * the genuine domain, which is what makes it survive both inspection and link-rewriting filters.
 * `//evil.com` is the protocol-relative form of the same trick, and `/\evil.com` is the form some
 * parsers normalise into `//evil.com`. String concatenation is not path joining.
 *
 * Please do not "simplify" this back to a bare `startsWith('/')` check.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return DEFAULT_NEXT_PATH;
  if (!next.startsWith('/')) return DEFAULT_NEXT_PATH;
  if (next[1] === '/' || next[1] === '\\') return DEFAULT_NEXT_PATH;
  if (hasControlCharacter(next)) return DEFAULT_NEXT_PATH;
  return next;
}

/**
 * Browsers strip tabs, newlines and other control characters out of a URL before parsing it, so a
 * `next` containing one does not mean, once parsed, what it looks like here.
 */
function hasControlCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}
