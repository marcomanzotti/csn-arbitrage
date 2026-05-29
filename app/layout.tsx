import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import SiteHeader from '@/components/SiteHeader';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const BASE_URL = 'https://csn-arbitrage.vercel.app';
const DESCRIPTION =
  'Model whether investing your CSN loan in Swedish government bonds lets you repay in full on day one and keep the grant as profit. Live Riksbank rates, real bond ISINs, Swedish tax support.';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'CSN Arbitrage',
    template: '%s | CSN Arbitrage',
  },
  description: DESCRIPTION,
  openGraph: {
    title: 'CSN Arbitrage',
    description: DESCRIPTION,
    url: BASE_URL,
    siteName: 'CSN Arbitrage',
    locale: 'en_SE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSN Arbitrage',
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'A532YvsWrIXSj_UIrXQ9bGCVVoRhr9kBp1vnDh5tpWw',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#f8f8f6] text-gray-900 antialiased">
        <LanguageProvider>
          <SiteHeader />
          <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
