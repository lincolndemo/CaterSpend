'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/income', label: 'Income' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/settings', label: 'Settings' },
] as const;

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-[var(--line)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm ${
              active
                ? 'border-[var(--accent)] font-medium text-[var(--accent)]'
                : 'border-transparent text-[var(--ink-600)] hover:text-[var(--ink-900)]'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
