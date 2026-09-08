import { describe, it, expect } from 'vitest';
import { safeNextPath } from './redirects';

describe('safeNextPath', () => {
  it('keeps a same-origin relative path', () => {
    expect(safeNextPath('/expenses')).toBe('/expenses');
    expect(safeNextPath('/jobs?month=2026-09')).toBe('/jobs?month=2026-09');
  });

  it('falls back to the dashboard when next is missing or empty', () => {
    expect(safeNextPath(null)).toBe('/dashboard');
    expect(safeNextPath(undefined)).toBe('/dashboard');
    expect(safeNextPath('')).toBe('/dashboard');
  });

  it('rejects the userinfo trick that puts an attacker host after an @', () => {
    // `${origin}@evil.com` parses as userinfo `origin` against host evil.com.
    expect(safeNextPath('@evil.com')).toBe('/dashboard');
    expect(safeNextPath('evil.com')).toBe('/dashboard');
  });

  it('rejects protocol-relative and backslash-normalised forms', () => {
    expect(safeNextPath('//evil.com')).toBe('/dashboard');
    expect(safeNextPath('/\\evil.com')).toBe('/dashboard');
    expect(safeNextPath('/\\/evil.com')).toBe('/dashboard');
  });

  it('rejects an absolute URL', () => {
    expect(safeNextPath('https://evil.com')).toBe('/dashboard');
    expect(safeNextPath('javascript:alert(1)')).toBe('/dashboard');
  });

  it('rejects a path carrying a control character', () => {
    expect(safeNextPath(`/${String.fromCharCode(9)}/evil.com`)).toBe('/dashboard');
    expect(safeNextPath(`/dashboard${String.fromCharCode(10)}Location: https://evil.com`)).toBe(
      '/dashboard',
    );
  });
});
