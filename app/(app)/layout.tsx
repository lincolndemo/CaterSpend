import { Nav } from '@/components/ui/Nav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { signOut } from '@/app/actions/auth';
import { requireUser } from '@/lib/supabase/server';

// Force dynamic rendering: loadWorkspace() and todayISO() must run per request, not once at
// build time, or "this month" KPIs, the six-month chart labels and the current-month bar all
// freeze at build-time values. The Supabase session cookie also forces dynamic rendering on its
// own, but keeping this explicit avoids relying on that side effect.
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, userId } = await requireUser();
  const { data: profile } = await supabase.from('profiles').select('business_name').eq('id', userId).single();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="shell flex items-center justify-between py-4">
          <span className="font-[family-name:var(--font-display)] text-xl">CaterSpend</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink-600)]">
              {profile?.business_name ?? 'Your business'}
            </span>
            <form action={signOut}>
              <button className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink-600)]">
                Sign out
              </button>
            </form>
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
