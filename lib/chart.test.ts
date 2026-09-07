import { describe, it, expect } from 'vitest';
import { donutSegments } from './chart';

describe('donutSegments', () => {
  const circumference = 2 * Math.PI * 50;

  it('returns one full-circle segment for a single slice', () => {
    const [seg] = donutSegments([{ pct: 100 }], 50);
    expect(seg.dash).toBeCloseTo(circumference, 5);
    expect(seg.gap).toBeCloseTo(0, 5);
    expect(seg.offset).toBeCloseTo(0, 5);
  });

  it('offsets each segment by the sum of the ones before it', () => {
    const segs = donutSegments([{ pct: 25 }, { pct: 75 }], 50);
    expect(segs[0].dash).toBeCloseTo(circumference * 0.25, 5);
    expect(segs[1].offset).toBeCloseTo(-circumference * 0.25, 5);
    expect(segs[1].dash).toBeCloseTo(circumference * 0.75, 5);
  });

  it('returns nothing for no slices', () => {
    expect(donutSegments([], 50)).toEqual([]);
  });
});
