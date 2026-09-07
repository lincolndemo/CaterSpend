import { Nav } from '@/components/ui/Nav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
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
