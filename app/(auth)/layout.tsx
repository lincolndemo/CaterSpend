import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      {/* The logo replaces what was the <h1>. It is a link out to the landing page, not a title, so
          the level-one heading moved down to the page beneath — "Sign in" / "Create your account",
          which is the more useful thing for a screen reader to land on anyway. Both were promoted
          from <h2> in the same change; leaving them as <h2> would have left these screens with no
          <h1> and a hierarchy starting at level two. */}
      <Logo className="mb-3 h-10 w-auto" />
      <p className="mb-8 text-[var(--ink-mute)]">Track every naira in and out of your kitchen.</p>
      <div className="card p-6">{children}</div>
    </main>
  );
}
