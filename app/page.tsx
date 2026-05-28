import CSNTool from '@/components/CSNTool';

export default function Home() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="font-playfair text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
          Should you take<br className="hidden sm:block" /> the CSN loan?
        </h1>
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
        <p className="mt-3 text-sm text-gray-400">
          All figures update live. Bond rates are fetched daily from Riksbank.
        </p>
      </div>

      <CSNTool />
    </div>
  );
}
