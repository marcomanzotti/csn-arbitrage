import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  return (
    <div className="max-w-3xl">

      {/* Hero */}
      <div className="mb-16 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
        <div className="flex-shrink-0">
          <div className="relative h-56 w-56 overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200">
            <Image
              src="/profile.png"
              alt="Marco Manzotti"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="font-playfair text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Marco<br />Manzotti
          </h1>
          <p className="mt-3 text-base font-medium text-gray-500">
            Social Scientific Data Analysis
          </p>
          <p className="text-sm text-gray-400">Lund University, Sweden</p>

          <div className="mt-6 flex gap-3">
            <a
              href="https://github.com/marcomanzotti"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-shadow hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/marco-manzotti/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-shadow hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
            <a
              href="mailto:marcomanzotti18@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-shadow hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-12 border-t border-gray-200" />

      {/* Bio */}
      <section className="mb-12">
        <h2 className="font-playfair mb-5 text-2xl font-bold text-gray-900">Background</h2>
        <p className="text-base leading-8 text-gray-700">
          I moved to Sweden to pursue a master&apos;s degree in Social Scientific Data Analysis at
          Lund University. Lund is one of Scandinavia&apos;s oldest universities, and the programme
          sits at the intersection of social science and applied statistics — exactly where I wanted
          to be.
        </p>
        <p className="mt-5 text-base leading-8 text-gray-700">
          Coming from Italy, one of the first things I had to navigate was the Swedish student
          finance system. CSN is remarkably generous by European standards: a non-repayable grant
          combined with a low-interest loan, available to international students enrolled in
          qualifying programmes.
        </p>
      </section>

      {/* Why this tool */}
      <section className="mb-12">
        <h2 className="font-playfair mb-5 text-2xl font-bold text-gray-900">Why this tool exists</h2>
        <p className="text-base leading-8 text-gray-700">
          I was trying to decide whether to take the maximum CSN loan. The interest rate is 2.135%
          per year, which is low by any standard. Swedish government bonds currently yield more than
          that — which raised an obvious question: what if you invested the loan in bonds, let them
          compound, and repaid everything in full the moment repayment began?
        </p>
        <p className="mt-5 text-base leading-8 text-gray-700">
          The spread between the loan rate and the bond yield becomes pure profit. The grant, which
          you never repay, would sit on top of that. I wanted to model this precisely — tracking each
          monthly disbursement separately, matching each one to the right bond maturity, and accounting
          for Swedish tax rules under both ISK and regular depot accounts.
        </p>
        <p className="mt-5 text-base leading-8 text-gray-700">
          I could not find a tool that did this. So I built one.
        </p>
      </section>

      {/* Divider */}
      <div className="mb-12 border-t border-gray-200" />

      {/* Disclaimer */}
      <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Disclaimer</h3>
        <p className="text-sm leading-relaxed text-gray-500">
          This tool is for informational purposes only and does not constitute financial advice.
          CSN rates, bond yields, and Swedish tax rules change over time. Always verify the numbers
          with official sources before making any financial decisions:{' '}
          <a href="https://www.csn.se" target="_blank" rel="noopener noreferrer" className="text-[#006AA7] hover:underline">
            csn.se
          </a>
          ,{' '}
          <a href="https://www.riksbank.se" target="_blank" rel="noopener noreferrer" className="text-[#006AA7] hover:underline">
            riksbank.se
          </a>
          ,{' '}
          <a href="https://www.riksgalden.se" target="_blank" rel="noopener noreferrer" className="text-[#006AA7] hover:underline">
            riksgalden.se
          </a>
          {' '}and{' '}
          <a href="https://www.skatteverket.se" target="_blank" rel="noopener noreferrer" className="text-[#006AA7] hover:underline">
            skatteverket.se
          </a>
          .
        </p>
      </section>

      <div className="mt-10">
        <Link href="/" className="text-sm font-medium text-[#006AA7] hover:underline">
          Back to the tool
        </Link>
      </div>
    </div>
  );
}
