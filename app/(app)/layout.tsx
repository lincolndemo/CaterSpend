import { Nav } from '@/components/ui/Nav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Force dynamic rendering: loadWorkspace() and todayISO() must run per request, not once at
// build time, or "this month" KPIs, the six-month chart labels and the current-month bar all
// freeze at build-time values. The in-memory data store that Server Actions mutate is also
// process-local, so a static build would serve a dashboard that never reflects writes. Once
// Supabase auth lands, the session cookie will force dynamic rendering on its own and this can
// be revisited (though it will likely still be desirable to keep explicit).
export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="shell flex items-center justify-between py-4">
          <span className="font-[family-name:var(--font-display)] text-xl">CaterSpend</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink-600)]">
              Demo
            </span>
          </div>
        </div>
        <div className="shell">
          <Nav />
        </div>
      </header>
      <main className="shell py-6">{children}</main>
    </div>
  );
}
