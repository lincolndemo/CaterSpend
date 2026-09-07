export type DonutSegment = { dash: number; gap: number; offset: number };

export function donutSegments(slices: { pct: number }[], radius: number): DonutSegment[] {
  const circumference = 2 * Math.PI * radius;
  let consumed = 0;
  return slices.map((slice) => {
    const dash = (slice.pct / 100) * circumference;
    const segment: DonutSegment = { dash, gap: circumference - dash, offset: -consumed };
    consumed += dash;
    return segment;
  });
}
