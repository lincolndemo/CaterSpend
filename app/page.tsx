import type { Metadata } from 'next';
import { CtaBand } from '@/components/landing/CtaBand';
import { Features } from '@/components/landing/Features';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';

export const metadata: Metadata = {
  title: 'CaterSpend — know exactly where your catering money goes',
  description:
    'Track expenses, income and jobs in one simple dashboard built for caterers and food businesses.',
};

/**
 * Public marketing landing page.
 *
 * Server Component with no client JavaScript of its own: everything here is
 * static markup, in-page anchors and `<Link>` navigation. It performs no
 * Supabase call and requires no session, so it renders for a signed-out visitor
 * and prerenders at build time without a live database. Signed-in visitors never
 * see it — the middleware sends them to /dashboard.
 */
export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-[var(--land-cream)] text-[var(--land-ink)]">
      <LandingHeader />

      <main>
        {/* The hero carries its own full-bleed background; see Hero.tsx. */}
        <Hero />
        <Features />
        <HowItWorks />
        <CtaBand />
      </main>

      <LandingFooter />
    </div>
  );
}
