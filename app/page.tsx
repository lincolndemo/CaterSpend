import type { Metadata } from 'next';
import { CtaBand } from '@/components/landing/CtaBand';
import { Features } from '@/components/landing/Features';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';

const TITLE = 'CaterSpend — know exactly where your catering money goes';
const DESCRIPTION =
  'Track expenses, income and jobs in one simple dashboard built for caterers and food businesses.';

/**
 * This page's job is to be shared, and in this market that means being pasted
 * into WhatsApp, which builds its preview card from Open Graph tags. Without
 * them the link renders as a bare URL.
 *
 * No `openGraph.images` and no `openGraph.url`: there is no image asset in the
 * repo (adding one would be a binary asset outside this change) and no
 * `metadataBase`/canonical origin is configured, so an absolute URL cannot be
 * emitted honestly. Title, description and type alone already turn a bare link
 * into a titled card. An OG image and a `metadataBase` are the natural follow-up
 * once a deployment domain and artwork exist.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'CaterSpend',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
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
