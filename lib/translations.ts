export type Lang = 'en' | 'sv';

export const T = {
  en: {
    // Header
    navTool: 'Tool',
    navAbout: 'About',

    // Page hero
    heroTitle1: 'Should you take',
    heroTitle2: 'the CSN loan?',
    heroSubtitle: 'All figures update live. Bond rates are fetched daily from Riksbank.',

    // Bond banner
    sectionBonds: 'Swedish government bonds · Riksbank',
    liveFromRiksbank: 'Live from Riksbank',
    estimatedRiksbank: 'Estimated (Riksbank unavailable)',
    updatedOn: 'Updated',
    customYieldToggle: 'Use a custom yield instead',
    customYieldSuffix: '% per annum, applied to all tenors',
    tenorLabels: { '2y': '2-year', '5y': '5-year', '10y': '10-year' } as Record<string, string>,

    // Inputs
    sectionSetup: 'Your CSN setup',
    monthsLabel: 'Months receiving CSN',
    monthSingular: 'month',
    monthPlural: 'months',
    rangeMin: '1',
    rangeMax: '48 months',
    startMonthLabel: 'Start month',
    yearLabel: 'Year',
    intensityLabel: 'Study intensity',
    intensityFull: 'Full-time (100%)',
    investLabel: 'Loan portion to invest in bonds',
    investMin: '0% (hold as cash)',
    investMax: '100% (invest all)',
    investHint: (pct: number) =>
      `${pct}% invested in bonds · ${100 - pct}% spent on living expenses`,

    // Repayment info
    earliestRepayment: 'Earliest repayment',
    repaymentNote: (lastMonth: string) => `6 months after last payment (${lastMonth})`,
    bondsAutoMatched: 'Bond tenors auto-matched',
    paymentCount: (n: number) => `${n} payment${n !== 1 ? 's' : ''}`,
    atRate: 'at',

    // Currency
    displayCurrency: 'Display currency',

    // Summary cards
    sectionResults: 'Results at repayment date',
    totalGrant: 'Total grant received',
    paymentsCount: (n: number) => `${n} payments`,
    loanPlusInterest: 'Loan + interest owed',
    principal: 'Principal',
    bondPortfolioValue: 'Bond portfolio value',
    beforeTax: 'Before tax',
    surplusPreTax: 'Surplus pre-tax',
    shortfallPreTax: 'Shortfall pre-tax',
    repayAndKeep: 'Repay in full, keep the gain',
    bondsFallShort: 'Bonds fall short',

    // Chart
    sectionChart: 'Portfolio vs loan balance over time',
    chartBondPortfolio: 'Bond portfolio',
    chartLoanBalance: 'Loan balance',
    chartRepayment: 'Repayment',

    // Tax
    sectionTax: 'Tax assumptions',
    taxISK: 'ISK',
    taxDepot: 'Regular depot',
    taxCustom: 'Custom rate',
    schablonLabel: 'Schablonränta',
    perYear: '% per year',
    customRateLabel: 'Effective tax rate on gains',
    iskDescription:
      'ISK (Investeringssparkonto) uses schablonbeskattning: a flat annual tax on the portfolio value, not on realized gains. No capital gains tax when bonds mature.',
    depotDescription:
      'Regular depot (Värdepapperskonto) uses kapitalinkomstskatt: 30% on realized gains when bonds mature, applied to the profit above your invested principal.',
    netAfterTaxLabel: 'Net result after tax',
    canRepayText:
      'You can repay the full loan on day one and keep this on top of your grant.',
    shortfallText: (amt: string) =>
      `Bond proceeds fall ${amt} short after tax and interest.`,
    taxPaid: 'Tax paid',
    bondProceeds: 'Bond proceeds',
    loanPlusInterestShort: 'Loan + interest',

    // Grand total
    sectionGrandTotal: 'Total money in your pocket',
    grandTotalPositive: 'Total net gain: grant received plus bond profit after tax.',
    grandTotalNegative:
      'The strategy results in a net loss at these rates and settings.',
    grantReceived: 'Grant received',
    neverRepaid: 'Never repaid',
    bondProfitAfterTax: 'Bond profit after tax',
    bondsMinusRepayment: 'Bonds minus loan repayment',
    loanSpentOnLiving: 'Loan spent on living',
    notAvailableAtRepayment: 'Not available at repayment',
    iskTaxLabel: 'ISK schablonsskatt',
    depotTaxLabel: '30% kapitalinkomst',

    // Sensitivity
    sectionSensitivity: 'Sensitivity: what if yields drop?',
    sensitivityDesc:
      'Net bond profit after tax if Riksbank rates were lower than today.',
    scenarioCurrent: 'Current rates',
    scenarioDrop: (pct: string) => `Rates ${pct}% lower`,
    scenarioNetProfit: 'Net profit after tax',
    scenarioProfitable: 'Profitable',
    scenarioNotProfitable: 'Not profitable',

    // Detail table
    showBreakdown: 'Show full breakdown by disbursement',
    hideBreakdown: 'Hide full breakdown by disbursement',
    colMonth: 'Month',
    colBond: 'Suggested bond',
    colMaturity: 'Maturity',
    colTenorYield: 'Tenor / yield',
    colGrant: 'Grant',
    colInvested: 'Amount invested',
    colBondValue: 'Bond value at repayment',
    colLoanOwed: 'Loan owed',
    colNetPreTax: 'Net pre-tax',
    noMatch: 'No match',
    maturesBeforeRepayment: (days: number) => `⚠ Matures ${days}d before repayment`,
    totalLabel: 'Total',
    tableFootnote:
      'Each payment is matched to the bond with the latest maturity that still falls before your repayment date. Yields are interpolated from the Riksbank curve for each holding period. Bond ISINs are sourced from Riksgälden records. Treasury bill ISINs roll quarterly: verify the active ISIN at riksgalden.se. A ⚠ flag appears when the matched bond matures more than 14 days before your repayment date.',

    // Compare
    compareToggle: 'Compare with a second scenario',
    compareHide: 'Hide comparison',
    scenarioA: 'Scenario A',
    scenarioB: 'Scenario B',
    compareLabel: (field: string) => field,
    compareGrandTotal: 'Total in your pocket',
    compareBetterBy: (amt: string) => `Better by ${amt}`,
    compareWorsBy: (amt: string) => `Worse by ${amt}`,

    // Export
    exportCSV: 'Export CSV',
    exportPDF: 'Export PDF',

    // Share
    copyLink: 'Copy link',
    linkCopied: 'Copied!',

    // Footer
    footerNote: (source: string, date: string) =>
      `CSN 2026: SEK 4,120 grant and SEK 9,472 loan per 4-week period (full-time). Loan interest 2.135% per annum. Bond rates from Riksbank (${source}). Exchange rates from ECB via Frankfurter${date ? ` (${date})` : ''}. For informational purposes only. Not financial advice.`,

    // Month names
    monthNames: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },

  sv: {
    // Header
    navTool: 'Verktyg',
    navAbout: 'Om',

    // Page hero
    heroTitle1: 'Bör du ta',
    heroTitle2: 'CSN-lånet?',
    heroSubtitle:
      'Alla siffror uppdateras i realtid. Obligationsräntor hämtas dagligen från Riksbanken.',

    // Bond banner
    sectionBonds: 'Svenska statsobligationer · Riksbanken',
    liveFromRiksbank: 'Direkt från Riksbanken',
    estimatedRiksbank: 'Uppskattad (Riksbanken otillgänglig)',
    updatedOn: 'Uppdaterad',
    customYieldToggle: 'Använd en anpassad avkastning istället',
    customYieldSuffix: '% per år, tillämpas på alla löptider',
    tenorLabels: { '2y': '2-årig', '5y': '5-årig', '10y': '10-årig' } as Record<string, string>,

    // Inputs
    sectionSetup: 'Din CSN-setup',
    monthsLabel: 'Månader med CSN',
    monthSingular: 'månad',
    monthPlural: 'månader',
    rangeMin: '1',
    rangeMax: '48 månader',
    startMonthLabel: 'Startmånad',
    yearLabel: 'År',
    intensityLabel: 'Studietakt',
    intensityFull: 'Heltid (100%)',
    investLabel: 'Andel av lånet att investera i obligationer',
    investMin: '0% (behåll som kontanter)',
    investMax: '100% (investera allt)',
    investHint: (pct: number) =>
      `${pct}% investerat i obligationer · ${100 - pct}% används till levnadskostnader`,

    // Repayment info
    earliestRepayment: 'Tidigaste återbetalning',
    repaymentNote: (lastMonth: string) =>
      `6 månader efter sista utbetalning (${lastMonth})`,
    bondsAutoMatched: 'Obligationstenorer automatchade',
    paymentCount: (n: number) => `${n} utbetalning${n !== 1 ? 'ar' : ''}`,
    atRate: 'till',

    // Currency
    displayCurrency: 'Visningsvaluta',

    // Summary cards
    sectionResults: 'Resultat vid återbetalningsdatum',
    totalGrant: 'Totalt bidrag',
    paymentsCount: (n: number) => `${n} utbetalningar`,
    loanPlusInterest: 'Lån + ränta att betala',
    principal: 'Kapitalbelopp',
    bondPortfolioValue: 'Obligationsportföljens värde',
    beforeTax: 'Före skatt',
    surplusPreTax: 'Överskott före skatt',
    shortfallPreTax: 'Underskott före skatt',
    repayAndKeep: 'Betala tillbaka allt, behåll vinsten',
    bondsFallShort: 'Obligationerna täcker inte',

    // Chart
    sectionChart: 'Portfölj vs lånebalans över tid',
    chartBondPortfolio: 'Obligationsportfölj',
    chartLoanBalance: 'Lånebalans',
    chartRepayment: 'Återbetalning',

    // Tax
    sectionTax: 'Skatteantaganden',
    taxISK: 'ISK',
    taxDepot: 'Värdepapperskonto',
    taxCustom: 'Anpassad skattesats',
    schablonLabel: 'Schablonränta',
    perYear: '% per år',
    customRateLabel: 'Effektiv skattesats på vinster',
    iskDescription:
      'ISK (Investeringssparkonto) använder schablonbeskattning: en fast årlig skatt på portföljvärdet, inte på realiserade vinster. Ingen kapitalvinstskatt när obligationerna förfaller.',
    depotDescription:
      'Värdepapperskonto använder kapitalinkomstskatt: 30% på realiserade vinster när obligationerna förfaller, beräknat på vinsten utöver investerat kapital.',
    netAfterTaxLabel: 'Nettoresultat efter skatt',
    canRepayText:
      'Du kan betala tillbaka hela lånet dag ett och behålla detta utöver ditt bidrag.',
    shortfallText: (amt: string) =>
      `Obligationsintäkterna är ${amt} för lite efter skatt och ränta.`,
    taxPaid: 'Skatt betald',
    bondProceeds: 'Obligationsintäkter',
    loanPlusInterestShort: 'Lån + ränta',

    // Grand total
    sectionGrandTotal: 'Total vinst i fickan',
    grandTotalPositive: 'Total nettovinst: bidrag plus obligationsvinst efter skatt.',
    grandTotalNegative:
      'Strategin ger ett nettounderskott vid dessa räntenivåer och inställningar.',
    grantReceived: 'Bidrag mottaget',
    neverRepaid: 'Återbetalas aldrig',
    bondProfitAfterTax: 'Obligationsvinst efter skatt',
    bondsMinusRepayment: 'Obligationer minus återbetalning',
    loanSpentOnLiving: 'Lån spenderat på levnadskostnader',
    notAvailableAtRepayment: 'Inte tillgängligt vid återbetalning',
    iskTaxLabel: 'ISK-schablonsskatt',
    depotTaxLabel: '30% kapitalinkomst',

    // Sensitivity
    sectionSensitivity: 'Känslighetsanalys: vad händer om räntorna sjunker?',
    sensitivityDesc:
      'Nettovinst på obligationer efter skatt om Riksbankens räntor vore lägre än idag.',
    scenarioCurrent: 'Nuvarande räntor',
    scenarioDrop: (pct: string) => `Räntor ${pct}% lägre`,
    scenarioNetProfit: 'Nettovinst efter skatt',
    scenarioProfitable: 'Lönsamt',
    scenarioNotProfitable: 'Ej lönsamt',

    // Detail table
    showBreakdown: 'Visa fullständig uppdelning per utbetalning',
    hideBreakdown: 'Dölj fullständig uppdelning per utbetalning',
    colMonth: 'Månad',
    colBond: 'Föreslagen obligation',
    colMaturity: 'Förfallodag',
    colTenorYield: 'Löptid / avkastning',
    colGrant: 'Bidrag',
    colInvested: 'Investerat belopp',
    colBondValue: 'Obligationsvärde vid återbetalning',
    colLoanOwed: 'Utestående lån',
    colNetPreTax: 'Netto före skatt',
    noMatch: 'Ingen matchning',
    maturesBeforeRepayment: (days: number) =>
      `⚠ Förfaller ${days} dagar före återbetalning`,
    totalLabel: 'Totalt',
    tableFootnote:
      'Varje utbetalning matchas mot obligationen med det senaste förfallodatumet som infaller före ditt återbetalningsdatum. Avkastningen interpoleras från Riksbankens räntekurva för varje innehavsperiod. Obligations-ISIN hämtas från Riksgäldens register. Statsskuldväxlar rullas kvartalsvis: verifiera aktivt ISIN på riksgalden.se. En ⚠-flagga visas när den matchade obligationen förfaller mer än 14 dagar före ditt återbetalningsdatum.',

    // Compare
    compareToggle: 'Jämför med ett andra scenario',
    compareHide: 'Dölj jämförelse',
    scenarioA: 'Scenario A',
    scenarioB: 'Scenario B',
    compareLabel: (field: string) => field,
    compareGrandTotal: 'Total i fickan',
    compareBetterBy: (amt: string) => `Bättre med ${amt}`,
    compareWorsBy: (amt: string) => `Sämre med ${amt}`,

    // Export
    exportCSV: 'Exportera CSV',
    exportPDF: 'Exportera PDF',

    // Share
    copyLink: 'Kopiera länk',
    linkCopied: 'Kopierad!',

    // Footer
    footerNote: (source: string, date: string) =>
      `CSN 2026: 4 120 kr bidrag och 9 472 kr lån per 4-veckorsperiod (heltid). Låneränta 2,135% per år. Obligationsräntor från Riksbanken (${source}). Växelkurser från ECB via Frankfurter${date ? ` (${date})` : ''}. Endast i informationssyfte. Inte finansiell rådgivning.`,

    // Month names
    monthNames: [
      'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
      'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December',
    ],
  },
} as const;

export type Trans = typeof T.en;
