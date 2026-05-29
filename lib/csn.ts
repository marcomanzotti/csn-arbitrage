export const CSN_2026 = {
  grantPer4Weeks: 4120,
  loanPer4Weeks: 9472,
  loanInterestRate: 0.02135,
  repaymentDelayMonths: 6,
} as const;

export const INTENSITY_OPTIONS = [
  { label: 'Full-time (100%)', value: 1.0 },
  { label: '75%', value: 0.75 },
  { label: '50%', value: 0.50 },
  { label: '25%', value: 0.25 },
] as const;

export type TaxMode = 'isk' | 'depot' | 'custom';
export type Tenor = '2y' | '5y' | '10y';

export interface TenorRate {
  rate: number; // percentage, e.g. 3.42
  seriesId: string;
}

export interface BondRates {
  '2y': TenorRate;
  '5y': TenorRate;
  '10y': TenorRate;
  source: 'riksbank' | 'fallback';
  updatedAt: string;
}

export const FALLBACK_RATES: BondRates = {
  '2y': { rate: 2.8, seriesId: 'SEGVB2YC' },
  '5y': { rate: 3.0, seriesId: 'SEGVB5YC' },
  '10y': { rate: 3.2, seriesId: 'SEGVB10YC' },
  source: 'fallback',
  updatedAt: new Date().toISOString(),
};

export const CURRENCIES = ['SEK', 'EUR', 'USD', 'GBP', 'DKK', 'NOK'] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface MatchedBond {
  isin: string;
  name: string;
  type: string;
  maturity: Date;
  coupon: number;
  daysOff: number; // positive = matures after target, negative = before
}

export interface Disbursement {
  monthIndex: number;
  date: Date;
  label: string;
  grant: number;
  loan: number;
  investedAmount: number; // loan * investPercent — goes into bonds
  spentAmount: number;    // loan * (1 - investPercent) — consumed as living expenses
  daysToRepayment: number;
  tenor: Tenor;
  bondYield: number; // decimal, e.g. 0.0342
  bondValue: number; // investedAmount grown at bondYield to repayment date
  loanAtRepayment: number;
  matchedBond: MatchedBond | null;
}

export interface TaxResult {
  netGain: number;
  taxPaid: number;
}

export interface CSNSummary {
  totalGrant: number;
  totalLoan: number;
  totalInvested: number;       // sum of investedAmount (what goes into bonds)
  totalSpent: number;          // sum of spentAmount (consumed as living expenses)
  totalBondValue: number;      // bond portion grown at yield — only asset available at repayment
  totalLoanAtRepayment: number;
  netGainPreTax: number;       // totalBondValue - totalLoanAtRepayment
  repaymentDate: Date;
  canRepayImmediately: boolean;
}

export function getMatchedTenor(daysToRepayment: number): Tenor {
  const years = daysToRepayment / 365;
  if (years <= 2) return '2y';
  if (years <= 5) return '5y';
  return '10y';
}

// Linear interpolation between Riksbank anchor points for a precise per-bond yield.
// Anchors: 0% at 0 years, 2Y rate, 5Y rate, 10Y rate (flat beyond 10Y).
export function interpolateYield(rates: BondRates, holdingDays: number): number {
  const years = holdingDays / 365;
  const r2 = rates['2y'].rate;
  const r5 = rates['5y'].rate;
  const r10 = rates['10y'].rate;

  let pct: number;
  if (years <= 0) {
    pct = r2;
  } else if (years <= 2) {
    // Interpolate from 0 to 2Y (assume overnight ≈ policy rate proxy = r2 - 0.5, floor at 0)
    const r0 = Math.max(0, r2 - 0.5);
    pct = r0 + (r2 - r0) * (years / 2);
  } else if (years <= 5) {
    pct = r2 + (r5 - r2) * ((years - 2) / 3);
  } else if (years <= 10) {
    pct = r5 + (r10 - r5) * ((years - 5) / 5);
  } else {
    pct = r10;
  }

  return pct / 100;
}

export function getRateForDays(rates: BondRates, days: number): number {
  return interpolateYield(rates, days);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-SE', { month: 'short', year: 'numeric' });
}

export function formatSEK(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrency(
  amountSEK: number,
  currency: Currency,
  rates: Record<string, number>
): string {
  if (currency === 'SEK') return formatSEK(amountSEK);

  const rate = rates[currency];
  if (!rate) return formatSEK(amountSEK);

  const converted = amountSEK * rate;

  const locales: Record<string, string> = {
    EUR: 'de-DE',
    USD: 'en-US',
    GBP: 'en-GB',
    DKK: 'da-DK',
    NOK: 'nb-NO',
  };

  return new Intl.NumberFormat(locales[currency] ?? 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(converted);
}

export function calculateTax(
  bondValue: number,
  principal: number,
  holdingYears: number,
  mode: TaxMode,
  schablonRate: number,
  customRate: number
): TaxResult {
  const gain = bondValue - principal;

  if (mode === 'isk') {
    const taxPaid = principal * schablonRate * holdingYears;
    return { netGain: gain - taxPaid, taxPaid };
  }

  if (mode === 'depot') {
    const taxPaid = Math.max(0, gain) * 0.30;
    return { netGain: gain - taxPaid, taxPaid };
  }

  const taxPaid = Math.max(0, gain) * customRate;
  return { netGain: gain - taxPaid, taxPaid };
}

export function calculateDisbursements(
  startDate: Date,
  months: number,
  intensity: number,
  rates: BondRates,
  overrideYield?: number,
  findBond?: (target: Date) => { bond: { isin: string; name: string; type: string; maturity: Date; coupon: number }; daysOff: number } | null,
  investPercent: number = 1.0
): { disbursements: Disbursement[]; summary: CSNSummary } {
  const grant = CSN_2026.grantPer4Weeks * intensity;
  const loan = CSN_2026.loanPer4Weeks * intensity;

  const lastDisbursementDate = addMonths(startDate, months - 1);
  const repaymentDate = addMonths(lastDisbursementDate, CSN_2026.repaymentDelayMonths);

  const disbursements: Disbursement[] = [];

  for (let i = 0; i < months; i++) {
    const date = addMonths(startDate, i);
    const daysToRepayment = daysBetween(date, repaymentDate);
    const yearsToRepayment = daysToRepayment / 365;
    const tenor = getMatchedTenor(daysToRepayment);
    const bondYield = overrideYield ?? getRateForDays(rates, daysToRepayment);

    const investedAmount = loan * investPercent;
    const spentAmount = loan * (1 - investPercent);
    const bondValue = investedAmount * Math.pow(1 + bondYield, yearsToRepayment);
    const loanAtRepayment = loan * Math.pow(1 + CSN_2026.loanInterestRate, yearsToRepayment);

    const bondMatch = findBond ? findBond(repaymentDate) : null;
    const matchedBond: MatchedBond | null = bondMatch
      ? { ...bondMatch.bond, daysOff: bondMatch.daysOff }
      : null;

    disbursements.push({
      monthIndex: i,
      date,
      label: formatMonth(date),
      grant,
      loan,
      investedAmount,
      spentAmount,
      daysToRepayment,
      tenor,
      bondYield,
      bondValue,
      loanAtRepayment,
      matchedBond,
    });
  }

  const totalGrant = disbursements.reduce((s, d) => s + d.grant, 0);
  const totalLoan = disbursements.reduce((s, d) => s + d.loan, 0);
  const totalInvested = disbursements.reduce((s, d) => s + d.investedAmount, 0);
  const totalSpent = disbursements.reduce((s, d) => s + d.spentAmount, 0);
  const totalBondValue = disbursements.reduce((s, d) => s + d.bondValue, 0);
  const totalLoanAtRepayment = disbursements.reduce((s, d) => s + d.loanAtRepayment, 0);
  const netGainPreTax = totalBondValue - totalLoanAtRepayment;

  return {
    disbursements,
    summary: {
      totalGrant,
      totalLoan,
      totalInvested,
      totalSpent,
      totalBondValue,
      totalLoanAtRepayment,
      netGainPreTax,
      repaymentDate,
      canRepayImmediately: netGainPreTax >= 0,
    },
  };
}

export function buildChartData(
  disbursements: Disbursement[],
  repaymentDate: Date,
  rates: BondRates,
  overrideYield?: number
) {
  if (disbursements.length === 0) return [];

  const startDate = disbursements[0].date;
  const totalMonths = daysBetween(startDate, repaymentDate) / 30 + 6;
  const points = [];

  for (let m = 0; m <= Math.ceil(totalMonths); m++) {
    const date = addMonths(startDate, m);

    let loanBalance = 0;
    let bondPortfolio = 0;

    for (const d of disbursements) {
      if (d.date <= date) {
        const daysHeld = daysBetween(d.date, date);
        const yieldRate = overrideYield ?? getRateForDays(rates, d.daysToRepayment);
        loanBalance += d.loan * Math.pow(1 + CSN_2026.loanInterestRate, daysHeld / 365);
        bondPortfolio += d.investedAmount * Math.pow(1 + yieldRate, daysHeld / 365);
      }
    }

    points.push({
      month: formatMonth(date),
      loanBalance: Math.round(loanBalance),
      bondPortfolio: Math.round(bondPortfolio),
    });
  }

  return points;
}
