import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  parseDateLocal,
  formatDateShort,
  monthKey,
  monthLabel,
  lastNMonthKeys,
  isSameMonth,
  todayISO,
  formatMonthOptions,
} from './dates';

describe('parseDateLocal', () => {
  it('keeps the calendar day regardless of timezone', () => {
    const d = parseDateLocal('2026-09-20');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8);
    expect(d.getDate()).toBe(20);
  });
});

describe('formatDateShort', () => {
  it('renders day, short month, year', () => {
    expect(formatDateShort('2026-09-20')).toBe('20 Sep 2026');
  });
  it('does not roll back across a month boundary', () => {
    expect(formatDateShort('2026-09-01')).toBe('1 Sep 2026');
  });
});

describe('monthKey', () => {
  it('returns year-month', () => {
    expect(monthKey('2026-09-20')).toBe('2026-09');
  });
});

describe('monthLabel', () => {
  it('returns the short month name', () => {
    expect(monthLabel('2026-09')).toBe('Sep');
  });
});

describe('lastNMonthKeys', () => {
  it('returns n ascending keys ending at the given month', () => {
    expect(lastNMonthKeys(6, '2026-09-05')).toEqual([
      '2026-04',
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
    ]);
  });
  it('crosses the year boundary', () => {
    expect(lastNMonthKeys(3, '2026-01-15')).toEqual(['2025-11', '2025-12', '2026-01']);
  });
  it('defaults to the Lagos calendar month, not the runtime one', () => {
    // 23:30 UTC on 31 August is already September in Lagos, so the window must end at 2026-09.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-31T23:30:00Z'));
    try {
      expect(lastNMonthKeys(2)).toEqual(['2026-08', '2026-09']);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('isSameMonth', () => {
  it('matches on year and month', () => {
    expect(isSameMonth('2026-09-30', '2026-09')).toBe(true);
    expect(isSameMonth('2026-10-01', '2026-09')).toBe(false);
  });
});

describe('todayISO', () => {
  const originalTZ = process.env.TZ;

  afterEach(() => {
    vi.useRealTimers();
    if (originalTZ === undefined) delete process.env.TZ;
    else process.env.TZ = originalTZ;
  });

  it('returns a YYYY-MM-DD string', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('reports the Lagos calendar day, not the runtime one', () => {
    // 23:30 UTC on the 5th is 00:30 WAT on the 6th. Vercel runs UTC; the business is in Nigeria.
    // Before the timezone was pinned, this hour is exactly when a form defaulted to yesterday.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-05T23:30:00Z'));

    for (const tz of ['UTC', 'America/New_York', 'Asia/Tokyo']) {
      process.env.TZ = tz;
      expect(todayISO()).toBe('2026-09-06');
    }
  });

  it('is unaffected by the process timezone at any hour', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));

    for (const tz of ['UTC', 'America/New_York', 'Asia/Tokyo']) {
      process.env.TZ = tz;
      expect(todayISO()).toBe('2026-01-15');
    }
  });
});

describe('formatMonthOptions', () => {
  it('returns unique months, newest first, with readable labels', () => {
    expect(formatMonthOptions(['2026-09-01', '2026-08-14', '2026-09-30'])).toEqual([
      { key: '2026-09', label: 'Sep 2026' },
      { key: '2026-08', label: 'Aug 2026' },
    ]);
  });
  it('returns an empty list for no dates', () => {
    expect(formatMonthOptions([])).toEqual([]);
  });
});
