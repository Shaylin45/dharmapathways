import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Dharma Pathways — Honest tools for South African education decisions',
  description:
    'Free tools to help South African missing-middle families weigh the true cost, real risk, and best fit of every post-school path — from TVET to university.',
  openGraph: {
    title: 'Dharma Pathways',
    description: 'Honest, independent education guidance for South African families.',
    url: 'https://www.dharmapathways.org.za/',
    siteName: 'Dharma Pathways',
    locale: 'en_ZA',
    type: 'website',
    images: ['https://www.dharmapathways.org.za/dharama-pathways-logo-notext.PNG'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dharma Pathways',
    description: 'Honest, independent education guidance for South African families.',
    images: ['https://www.dharmapathways.org.za/dharama-pathways-logo-notext.PNG'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />

        {/* Replace REPLACE_WITH_YOUR_TOKEN once Cloudflare Web Analytics is enabled. */}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon='{"token": "REPLACE_WITH_YOUR_TOKEN"}'
        />
        <Script src="/dharma-tools.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
