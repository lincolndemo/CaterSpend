'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="size-9" />;

  const dark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="grid size-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--ink-600)]"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
