import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-playfair mb-10 text-4xl font-bold tracking-tight text-gray-900">
        About
      </h1>

      {/* Bio */}
      <section className="mb-10">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <Image
              src="/profile.png"
              alt="Marco Manzotti"
              width={80}
              height={80}
              className="rounded-full object-cover ring-2 ring-gray-100"
              priority
            />
          </div>
          <div>
            <h2 className="font-playfair text-2xl font-bold text-gray-900">Marco Manzotti</h2>
            <p className="mt-0.5 text-sm font-medium text-gray-500">
              Social Scientific Data Analysis · Lund University, Sweden
            </p>
          </div>
        </div>

        <p className="mt-6 text-base leading-relaxed text-gray-700">
          I moved to Sweden to pursue a master&apos;s degree at Lund University. Like most
          students here, I had to decide whether to take CSN. The grant is straightforward
          money you keep. The loan is more interesting: at 2.135% annual interest, it is
          priced below what Swedish government bonds currently yield, which raises an obvious
          question.
        </p>
      </section>

      {/* Why */}
      <section className="mb-10 rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
        <h2 className="font-playfair mb-4 text-xl font-bold text-gray-900">Why this tool exists</h2>
        <p className="text-base leading-relaxed text-gray-700">
          I was trying to understand whether it made sense to take the maximum CSN loan,
          invest it in SEK-denominated bonds, and repay everything the moment repayment began.
          If the bond yield exceeds the loan rate, the spread turns into profit, and the grant
          effectively becomes free money on top.
        </p>
        <p className="mt-4 text-base leading-relaxed text-gray-700">
          I could not find a tool that modeled this cleanly: one that tracked each monthly
          disbursement separately, matched it to the right bond tenor, accounted for Swedish
          tax rules, and showed the full picture at repayment date. So I built one.
        </p>
      </section>

      {/* Links */}
      <section className="mb-10">
        <h2 className="font-playfair mb-4 text-xl font-bold text-gray-900">Get in touch</h2>
        <div className="flex flex-col gap-4">
          <a
            href="https://github.com/marcomanzotti"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow group-hover:shadow-md">
              <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#006AA7] transition-colors">
                GitHub
              </p>
              <p className="text-sm text-gray-500">github.com/marcomanzotti</p>
            </div>
          </a>

          <a
            href="https://www.linkedin.com/in/marco-manzotti/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow group-hover:shadow-md">
              <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#006AA7] transition-colors">
                LinkedIn
              </p>
              <p className="text-sm text-gray-500">linkedin.com/in/marco-manzotti</p>
            </div>
          </a>

          <a
            href="mailto:marcomanzotti18@gmail.com"
            className="group flex items-center gap-4"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow group-hover:shadow-md">
              <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#006AA7] transition-colors">
                Email
              </p>
              <p className="text-sm text-gray-500">marcomanzotti18@gmail.com</p>
            </div>
          </a>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-gray-500">
          <span className="font-semibold text-gray-700">Disclaimer.</span> This tool is for
          informational purposes only and does not constitute financial advice. CSN rates, bond
          yields, and Swedish tax rules change over time. Always verify the numbers with official
          sources before making any financial decisions:{' '}
          <a href="https://www.csn.se" target="_blank" rel="noopener noreferrer" className="text-[#006AA7] hover:underline">
            csn.se
          </a>
          ,{' '}
          <a href="https://www.riksbank.se" target="_blank" rel="noopener noreferrer" className="text-[#006AA7] hover:underline">
            riksbank.se
          </a>
          {' '}and{' '}
          <a href="https://www.skatteverket.se" target="_blank" rel="noopener noreferrer" className="text-[#006AA7] hover:underline">
            skatteverket.se
          </a>
          .
        </p>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm font-medium text-[#006AA7] hover:underline">
          Back to the tool
        </Link>
      </div>
    </div>
  );
}
