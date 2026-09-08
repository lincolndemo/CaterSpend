const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * The one business this app serves works in Nigeria, and Vercel runs UTC.
 *
 * Pinning the calendar to Africa/Lagos rather than reading whatever timezone the runtime happens
 * to sit in is what makes the server and the browser agree. Without it, between 00:00 and 01:00
 * WAT the browser says the 6th while the server still says the 5th: the date input on a form built
 * for fast repeated entry defaults to yesterday, which across a month boundary files the record in
 * the wrong month and moves it out of the dashboard's "this month" figure — and React logs a
 * hydration mismatch for that hour, because the client re-renders a `defaultValue` the server
 * computed differently.
 */
const APP_TIME_ZONE = 'Africa/Lagos';

const ISO_PARTS = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayISO(): string {
  // formatToParts rather than format: it gives the same answer under any ICU build, where the
  // assembled `en-CA` string is a locale-data detail we would be trusting to stay YYYY-MM-DD.
  const parts = ISO_PARTS.formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function parseDateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateShort(iso: string): string {
  const d = parseDateLocal(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthLabel(key: string): string {
  const month = Number(key.slice(5, 7));
  return MONTHS[month - 1];
}

export function lastNMonthKeys(n: number, from?: string): string[] {
  // `todayISO()` and not `new Date()`: the default has the same UTC-versus-WAT skew todayISO was
  // pinned to remove, and a dashboard window that rolls over an hour late is the same bug wearing
  // a different hat. Every caller passes `from` today; this keeps the unused path honest.
  const base = parseDateLocal(from ?? todayISO());
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }
  return keys;
}

export function isSameMonth(iso: string, key: string): boolean {
  return monthKey(iso) === key;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatMonthOptions(dates: string[]): { key: string; label: string }[] {
  const keys = [...new Set(dates.map(monthKey))].sort().reverse();
  return keys.map((key) => ({ key, label: `${monthLabel(key)} ${key.slice(0, 4)}` }));
}
