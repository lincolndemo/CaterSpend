import { describe, it, expect } from 'vitest';
import { formatNaira, formatNairaCompact, parseAmount } from './money';

describe('formatNaira', () => {
  it('formats whole naira with separators', () => {
    expect(formatNaira(250000)).toBe('₦250,000');
  });
  it('rounds to whole naira', () => {
    expect(formatNaira(1234.56)).toBe('₦1,235');
  });
  it('formats zero', () => {
    expect(formatNaira(0)).toBe('₦0');
  });
  it('formats negatives with the sign before the symbol', () => {
    expect(formatNaira(-5000)).toBe('-₦5,000');
  });
});

describe('formatNairaCompact', () => {
  it('uses M above a million', () => {
    expect(formatNairaCompact(1200000)).toBe('₦1.2M');
  });
  it('uses k above a thousand', () => {
    expect(formatNairaCompact(650000)).toBe('₦650k');
  });
  it('leaves small values alone', () => {
    expect(formatNairaCompact(900)).toBe('₦900');
  });
});

describe('parseAmount', () => {
  it('strips commas', () => {
    expect(parseAmount('1,200,000')).toBe(1200000);
  });
  it('accepts decimals', () => {
    expect(parseAmount('1500.50')).toBe(1500.5);
  });
  it('rejects blanks', () => {
    expect(parseAmount('   ')).toBeNull();
  });
  it('rejects nonsense', () => {
    expect(parseAmount('abc')).toBeNull();
  });
});
