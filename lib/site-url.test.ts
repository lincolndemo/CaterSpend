import { describe, it, expect, afterEach, vi } from 'vitest';
import { resolveSiteOrigin } from './site-url';

function headers(entries: Record<string, string>) {
  const lower = new Map(Object.entries(entries).map(([k, v]) => [k.toLowerCase(), v]));
  return { get: (name: string) => lower.get(name.toLowerCase()) ?? null };
}

describe('resolveSiteOrigin', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers an explicit NEXT_PUBLIC_SITE_URL over the request headers', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://caterspend.example.com');
    expect(resolveSiteOrigin(headers({ 'x-forwarded-host': 'wrong.example.net' }))).toBe(
      'https://caterspend.example.com',
    );
  });

  it('normalises a configured value with a trailing slash or no scheme', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://caterspend.example.com/');
    expect(resolveSiteOrigin(headers({}))).toBe('https://caterspend.example.com');

    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'caterspend.example.com');
    expect(resolveSiteOrigin(headers({}))).toBe('https://caterspend.example.com');
  });

  it('ignores a configured value that is blank', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '   ');
    expect(resolveSiteOrigin(headers({ host: 'cater-spend.vercel.app' }))).toBe(
      'https://cater-spend.vercel.app',
    );
  });

  it('builds the origin from the forwarded headers Vercel sets', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(
      resolveSiteOrigin(
        headers({ 'x-forwarded-proto': 'https', 'x-forwarded-host': 'cater-spend.vercel.app' }),
      ),
    ).toBe('https://cater-spend.vercel.app');
  });

  it('takes the client-facing entry when a header carries a proxy chain', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(
      resolveSiteOrigin(
        headers({ 'x-forwarded-proto': 'https,http', 'x-forwarded-host': 'public.example.com, internal' }),
      ),
    ).toBe('https://public.example.com');
  });

  it('prefers the forwarded host over the proxy-facing host header', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(
      resolveSiteOrigin(headers({ 'x-forwarded-host': 'public.example.com', host: 'internal:3000' })),
    ).toBe('https://public.example.com');
  });

  it('assumes https for a remote host with no forwarded protocol', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(resolveSiteOrigin(headers({ host: 'cater-spend.vercel.app' }))).toBe(
      'https://cater-spend.vercel.app',
    );
  });

  it('assumes http for a local host with no forwarded protocol', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(resolveSiteOrigin(headers({ host: 'localhost:3000' }))).toBe('http://localhost:3000');
    expect(resolveSiteOrigin(headers({ host: '127.0.0.1:3000' }))).toBe('http://127.0.0.1:3000');
  });

  it('falls back to the local dev origin when there is no host header at all', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(resolveSiteOrigin(headers({}))).toBe('http://localhost:3000');
  });
});
