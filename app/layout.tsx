import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dharmapathways.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dharma Pathways',
    template: '%s | Dharma Pathways',
  },
  description:
    'Free tools to help South African missing-middle families weigh the true cost, real risk, and best fit of every post-school path — from TVET to university.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'South Africa education planning',
    'missing middle education',
    'university cost calculator',
    'TVET route comparison',
    'career fit checker',
    'Dharma Pathways',
  ],
  openGraph: {
    title: 'Dharma Pathways',
    description: 'Honest, independent education guidance for South African families.',
    url: siteUrl,
    siteName: 'Dharma Pathways',
    locale: 'en_ZA',
    type: 'website',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dharma Pathways',
    description: 'Honest, independent education guidance for South African families.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dharma Pathways',
    url: siteUrl,
    logo: '/logo.png',
    sameAs: ['https://www.dharmapathways.org.za/'],
  };

  return (
    <html lang="en-ZA">
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />

        <Script id="org-jsonld" nonce={nonce} type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(orgJsonLd)}
        </Script>
        <Script nonce={nonce} src="/dharma-tools.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
