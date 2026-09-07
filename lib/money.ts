export function formatNaira(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const body = Math.abs(rounded).toLocaleString('en-NG');
  return `${sign}₦${body}`;
}

export function formatNairaCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}₦${trimZero(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}₦${trimZero(abs / 1_000)}k`;
  return `${sign}₦${Math.round(abs)}`;
}

function trimZero(n: number): string {
  const s = n.toFixed(1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
