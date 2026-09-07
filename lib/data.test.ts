import { describe, it, expect } from 'vitest';
import { EXPORT_LIMIT, isTruncated, wroteNoRows } from './data';

function rows(n: number): unknown[] {
  return Array.from({ length: n }, (_, i) => i);
}

describe('isTruncated', () => {
  it('is false when every matching row arrived', () => {
    expect(isTruncated({ data: rows(42), count: 42 })).toBe(false);
  });

  it('is false for an empty table', () => {
    expect(isTruncated({ data: [], count: 0 })).toBe(false);
  });

  it('detects the server cutting the response below our ceiling', () => {
    // PostgREST's max-rows is 1000 on the local stack and on a default hosted project, so this is
    // the case that actually fires in production long before EXPORT_LIMIT is reached.
    expect(isTruncated({ data: rows(1000), count: 1200 })).toBe(true);
  });

  it('detects our own ceiling cutting the response', () => {
    expect(isTruncated({ data: rows(EXPORT_LIMIT), count: EXPORT_LIMIT + 1 })).toBe(true);
  });

  it('falls back to the length test when no count came back', () => {
    expect(isTruncated({ data: rows(EXPORT_LIMIT), count: null })).toBe(true);
    expect(isTruncated({ data: rows(EXPORT_LIMIT - 1), count: null })).toBe(false);
  });

  it('treats a failed read as untruncated so the error path owns it', () => {
    // loadWorkspace throws on `error` before it ever asks about truncation; this only pins down
    // that a null data array does not produce a spurious banner.
    expect(isTruncated({ data: null, count: null })).toBe(false);
  });

  it('warns when the count is unreadable, rather than assuming the data is whole', () => {
    // postgrest-js runs parseInt over the segment after the slash in Content-Range, so a response
    // whose total is `*` yields NaN. A count we cannot read is not proof the read was complete.
    expect(isTruncated({ data: rows(1000), count: NaN })).toBe(true);
    expect(isTruncated({ data: rows(3), count: NaN })).toBe(true);
  });
});

describe('wroteNoRows', () => {
  it('is true only for a definite zero', () => {
    expect(wroteNoRows(0)).toBe(true);
  });

  it('is false when rows were written', () => {
    expect(wroteNoRows(1)).toBe(false);
    expect(wroteNoRows(12)).toBe(false);
  });

  it('is false when the count is unreadable, so a successful save is not reported as failed', () => {
    // The mirror image of isTruncated's NaN case, and deliberately the opposite direction: on a
    // write, an ambiguous count most likely accompanies a write that landed.
    expect(wroteNoRows(NaN)).toBe(false);
    expect(wroteNoRows(null)).toBe(false);
    expect(wroteNoRows(undefined)).toBe(false);
  });
});
