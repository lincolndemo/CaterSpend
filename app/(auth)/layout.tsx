export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <h1 className="mb-1 font-[family-name:var(--font-display)] text-3xl">CaterSpend</h1>
      <p className="mb-8 text-[var(--ink-mute)]">Track every naira in and out of your kitchen.</p>
      <div className="card p-6">{children}</div>
    </main>
  );
}
