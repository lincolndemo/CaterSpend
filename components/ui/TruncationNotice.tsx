/**
 * Shown when `loadWorkspace()` hit a row ceiling, so the records below are a partial set and every
 * figure computed from them may understate.
 *
 * It belongs on every page that renders money derived from those arrays, not just the dashboard.
 * A caterer who sees the warning on the dashboard, clicks through to Jobs and finds each job's
 * spend, profit and outstanding stated plainly has been told the opposite of the truth one click
 * later. In a bookkeeping tool a quietly incomplete number is worse than an error, so the copy is
 * identical everywhere rather than tuned per page.
 */
export function TruncationNotice() {
  return (
    <p role="status" className="card border-[var(--gold)] p-4 text-sm text-[var(--ink-600)]">
      You have more records than this page can load at once, so these figures may be incomplete.
    </p>
  );
}
