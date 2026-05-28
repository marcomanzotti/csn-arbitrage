import Link from 'next/link';

export default function About() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">About</h1>
      <p className="mb-10 text-base text-gray-500">The person behind the tool</p>

      {/* Bio */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Marco Manzotti</h2>
        <p className="text-base leading-relaxed text-gray-700">
          I&apos;m a Social Scientific Data Analysis student at{' '}
          <span className="font-medium">Lund University</span>, Sweden. I moved to Sweden to pursue
          a master&apos;s degree and, like most international students here, had to decide whether to
          take CSN — Sweden&apos;s generous student loan system.
        </p>
      </section>

      {/* Why */}
      <section className="mb-10 rounded-2xl border border-[#006AA7]/20 bg-[#006AA7]/5 p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Why this tool exists</h2>
        <p className="text-base leading-relaxed text-gray-700">
          I was trying to decide whether to take the CSN loan. The interest rate is low — 2.135% —
          and Swedish government bonds have historically yielded more. The math suggested you could
          invest the loan, let it grow, and repay immediately when repayment begins, pocketing the
          grant as a pure gain.
        </p>
        <p className="mt-3 text-base leading-relaxed text-gray-700">
          I couldn&apos;t find a tool that modeled this cleanly — accounting for each monthly
          disbursement, compounding interest, tax differences by account type, and the 6-month
          repayment delay. So I built one.
        </p>
      </section>

      {/* Links */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Find me</h2>
        <div className="flex flex-col gap-3">
          <a
            href="https://github.com/marcomanzotti"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-base font-medium text-[#006AA7] hover:underline"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            github.com/marcomanzotti
          </a>
          <a
            href="https://www.linkedin.com/in/marco-manzotti/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-base font-medium text-[#006AA7] hover:underline"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            linkedin.com/in/marco-manzotti
          </a>
          <a
            href="mailto:marcomanzotti18@gmail.com"
            className="flex items-center gap-3 text-base font-medium text-[#006AA7] hover:underline"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            marcomanzotti18@gmail.com
          </a>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm leading-relaxed text-gray-500">
          <span className="font-medium text-gray-700">Disclaimer:</span> This tool is for
          informational purposes only and does not constitute financial advice. CSN rates, bond
          yields, and tax rules change — always verify with official sources (
          <a href="https://www.csn.se" target="_blank" rel="noopener noreferrer" className="underline">
            csn.se
          </a>
          ,{' '}
          <a href="https://www.riksbank.se" target="_blank" rel="noopener noreferrer" className="underline">
            riksbank.se
          </a>
          ,{' '}
          <a href="https://www.skatteverket.se" target="_blank" rel="noopener noreferrer" className="underline">
            skatteverket.se
          </a>
          ) before making any financial decisions.
        </p>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm font-medium text-[#006AA7] hover:underline">
          ← Back to the tool
        </Link>
      </div>
    </div>
  );
}
