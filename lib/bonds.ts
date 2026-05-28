// Swedish government bonds sourced from Riksgälden (Swedish National Debt Office).
// ISINs and maturity dates are fixed at issuance. Yields are interpolated daily from Riksbank.
// Verify current listings at: https://www.riksgalden.se/en/our-operations/central-government-debt/borrowing-and-debt-management/government-bonds/

export type BondType = 'Statsobligationer' | 'Statsskuldväxlar';

export interface SwedishBond {
  isin: string;
  name: string;
  type: BondType;
  maturity: Date;
  coupon: number; // annual %, 0 for T-bills (zero-coupon)
}

// Statsskuldväxlar (Swedish Treasury Bills) — zero-coupon, short-term
// ISINs roll with each quarterly issuance. These represent approximate issuances in 2026-2027.
// Verify the active ISIN for a given quarter at riksgalden.se.
export const TREASURY_BILLS: SwedishBond[] = [
  { isin: 'SE0020903290', name: 'SSVX Q3 2026', type: 'Statsskuldväxlar', maturity: new Date('2026-09-11'), coupon: 0 },
  { isin: 'SE0020903308', name: 'SSVX Q4 2026', type: 'Statsskuldväxlar', maturity: new Date('2026-12-11'), coupon: 0 },
  { isin: 'SE0021094479', name: 'SSVX Q1 2027', type: 'Statsskuldväxlar', maturity: new Date('2027-03-12'), coupon: 0 },
  { isin: 'SE0021094487', name: 'SSVX Q2 2027', type: 'Statsskuldväxlar', maturity: new Date('2027-06-11'), coupon: 0 },
  { isin: 'SE0021094495', name: 'SSVX Q3 2027', type: 'Statsskuldväxlar', maturity: new Date('2027-09-10'), coupon: 0 },
  { isin: 'SE0021094503', name: 'SSVX Q4 2027', type: 'Statsskuldväxlar', maturity: new Date('2027-12-10'), coupon: 0 },
];

// Statsobligationer (Swedish Government Bonds) — fixed coupon, multi-year
export const GOVERNMENT_BONDS: SwedishBond[] = [
  { isin: 'SE0013935319', name: 'SGB Nov 2026', type: 'Statsobligationer', maturity: new Date('2026-11-12'), coupon: 0.125 },
  { isin: 'SE0015193868', name: 'SGB Nov 2028', type: 'Statsobligationer', maturity: new Date('2028-11-12'), coupon: 1.5 },
  { isin: 'SE0016589584', name: 'SGB Nov 2030', type: 'Statsobligationer', maturity: new Date('2030-11-12'), coupon: 0.75 },
  { isin: 'SE0017767914', name: 'SGB May 2033', type: 'Statsobligationer', maturity: new Date('2033-05-12'), coupon: 1.75 },
  { isin: 'SE0019478633', name: 'SGB Nov 2035', type: 'Statsobligationer', maturity: new Date('2035-11-12'), coupon: 2.5 },
];

export const ALL_BONDS: SwedishBond[] = [...TREASURY_BILLS, ...GOVERNMENT_BONDS].sort(
  (a, b) => a.maturity.getTime() - b.maturity.getTime()
);

// Find the bond with the latest maturity that still falls ON OR BEFORE the repayment date.
// This ensures the bond matures before you need to repay — so you can actually use the proceeds.
// Falls back to the earliest available bond if none matures before the repayment date.
export function findBondBeforeRepayment(
  repaymentDate: Date
): { bond: SwedishBond; daysOff: number } | null {
  const today = new Date();
  const available = ALL_BONDS.filter((b) => b.maturity > today);
  if (available.length === 0) return null;

  // Bonds that mature on or before the repayment date
  const eligible = available.filter((b) => b.maturity <= repaymentDate);

  let best: SwedishBond;

  if (eligible.length > 0) {
    // Pick the one with the latest maturity (closest to repayment without going over)
    best = eligible.reduce((a, b) =>
      b.maturity.getTime() > a.maturity.getTime() ? b : a
    );
  } else {
    // No bond matures before repayment — use the earliest available as a fallback
    best = available[0];
  }

  const daysOff = Math.round(
    (best.maturity.getTime() - repaymentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { bond: best, daysOff };
}
