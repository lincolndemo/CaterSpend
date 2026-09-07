import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="shell grid min-h-dvh place-items-center">
      <div className="text-center">
        <p className="mb-2 font-medium">Page not found.</p>
        <Link className="text-[var(--accent)] underline" href="/dashboard">
          Back to the dashboard
        </Link>
      </div>
    </main>
  );
}
