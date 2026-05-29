import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';

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

export const metadata: Metadata = {
  title: 'CSN Arbitrage',
  description:
    'Model whether investing your CSN loan in SEK bonds lets you repay immediately and keep the grant as profit.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#f8f8f6] text-gray-900 antialiased">
        <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <Link href="/" className="group flex items-center gap-2.5">
              <span
                className="font-playfair text-xl font-bold tracking-tight text-gray-900"
              >
                CSN Arbitrage
              </span>
            </Link>
            <nav className="flex gap-7 text-sm font-medium text-gray-500">
              <Link href="/" className="hover:text-gray-900 transition-colors">Tool</Link>
              <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
