'use client';

import { useLanguage } from '@/components/LanguageProvider';

export default function HomeHero() {
  const { lang, t } = useLanguage();

  return (
    <div className="mb-10">
      <h1 className="font-playfair text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
        {t.heroTitle1}
        <br className="hidden sm:block" />
        {' '}{t.heroTitle2}
      </h1>

      {lang === 'en' ? (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
          CSN offers a grant of{' '}
          <span className="font-semibold text-gray-900">SEK 4,120</span> and a loan of{' '}
          <span className="font-semibold text-gray-900">SEK 9,472</span> per four weeks
          at full-time study (2026). The loan accrues interest at{' '}
          <span className="font-semibold text-gray-900">2.135% per year</span>, which is
          below what Swedish government bonds currently yield. If you invest the loan in bonds
          and let them mature, you can repay in full on the first due date and keep the
          grant as profit.
        </p>
      ) : (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
          CSN erbjuder ett bidrag på{' '}
          <span className="font-semibold text-gray-900">4 120 kr</span> och ett lån på{' '}
          <span className="font-semibold text-gray-900">9 472 kr</span> per fyra veckor vid
          heltidsstudier (2026). Lånet löper med en ränta på{' '}
          <span className="font-semibold text-gray-900">2,135% per år</span>, vilket är lägre
          än vad svenska statsobligationer för närvarande ger. Om du investerar lånet i
          obligationer och låter dem förfalla kan du betala tillbaka hela beloppet på
          förfallodagen och behålla bidraget som vinst.
        </p>
      )}

      <p className="mt-3 text-sm text-gray-400">{t.heroSubtitle}</p>
    </div>
  );
}
