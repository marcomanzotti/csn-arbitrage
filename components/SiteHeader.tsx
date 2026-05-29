'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { Lang } from '@/lib/translations';

export default function SiteHeader() {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-playfair text-xl font-bold tracking-tight text-gray-900">
          CSN Arbitrage
        </Link>

        <div className="flex items-center gap-6">
          {/* Language toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 gap-0.5">
            {(['en', 'sv'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-all ${
                  lang === l
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <nav className="flex gap-6 text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              {t.navTool}
            </Link>
            <Link href="/about" className="hover:text-gray-900 transition-colors">
              {t.navAbout}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
