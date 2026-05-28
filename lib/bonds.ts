// Swedish government bonds sourced from Riksgälden (Swedish National Debt Office).
// ISINs and maturity dates are fixed at issuance. Yields are fetched daily from Riksbank.
// Verify current listings at: https://www.riksgalden.se/en/our-operations/central-government-debt/borrowing-and-debt-management/government-bonds/

export type BondType = 'Statsobligationer' | 'Statsskuldväxlar';

export interface SwedishBond {
  isin: string;
  name: string;
  type: BondType;
  maturity: Date;
  coupon: number; // annual %, 0 for T-bills (zero-coupon)
}

// Statsskuldväxlar (Swedish Treasury Bills) — zero-coupon, < 1 year
// ISINs roll with each issuance. These represent approximate quarterly issuances in 2026-2027.
// Contact Riksgälden for the active ISIN at any given time.
export const TREASURY_BILLS: SwedishBond[] = [
  {
    isin: 'SE0020903290',
    name: 'SSVX Q3 2026',
    type: 'Statsskuldväxlar',
    maturity: new Date('2026-09-11'),
    coupon: 0,
  },
  {
    isin: 'SE0020903308',
    name: 'SSVX Q4 2026',
    type: 'Statsskuldväxlar',
    maturity: new Date('2026-12-11'),
    coupon: 0,
  },
  {
    isin: 'SE0021094479',
    name: 'SSVX Q1 2027',
    type: 'Statsskuldväxlar',
    maturity: new Date('2027-03-12'),
    coupon: 0,
  },
  {
    isin: 'SE0021094487',
    name: 'SSVX Q2 2027',
    type: 'Statsskuldväxlar',
    maturity: new Date('2027-06-11'),
    coupon: 0,
  },
  {
    isin: 'SE0021094495',
    name: 'SSVX Q3 2027',
    type: 'Statsskuldväxlar',
    maturity: new Date('2027-09-10'),
    coupon: 0,
  },
  {
    isin: 'SE0021094503',
    name: 'SSVX Q4 2027',
    type: 'Statsskuldväxlar',
    maturity: new Date('2027-12-10'),
    coupon: 0,
  },
];

// Statsobligationer (Swedish Government Bonds) — fixed coupon, multi-year
// These are the benchmark bonds issued by Riksgälden.
export const GOVERNMENT_BONDS: SwedishBond[] = [
  {
    isin: 'SE0013935319',
    name: 'SGB Nov 2026',
    type: 'Statsobligationer',
    maturity: new Date('2026-11-12'),
    coupon: 0.125,
  },
  {
    isin: 'SE0015193868',
    name: 'SGB Nov 2028',
    type: 'Statsobligationer',
    maturity: new Date('2028-11-12'),
    coupon: 1.5,
  },
  {
    isin: 'SE0016589584',
    name: 'SGB Nov 2030',
    type: 'Statsobligationer',
    maturity: new Date('2030-11-12'),
    coupon: 0.75,
  },
  {
    isin: 'SE0017767914',
    name: 'SGB May 2033',
    type: 'Statsobligationer',
    maturity: new Date('2033-05-12'),
    coupon: 1.75,
  },
  {
    isin: 'SE0019478633',
    name: 'SGB Nov 2035',
    type: 'Statsobligationer',
    maturity: new Date('2035-11-12'),
    coupon: 2.5,
  },
];

export const ALL_BONDS: SwedishBond[] = [...TREASURY_BILLS, ...GOVERNMENT_BONDS].sort(
  (a, b) => a.maturity.getTime() - b.maturity.getTime()
);

// Find the bond whose maturity is closest to the target date.
// Returns the bond and the number of days it misses by (negative = matures early).
export function findNearestBond(
  targetDate: Date
): { bond: SwedishBond; daysOff: number } | null {
  const future = ALL_BONDS.filter((b) => b.maturity > new Date());
  if (future.length === 0) return null;

  let best = future[0];
  let bestDiff = Math.abs(targetDate.getTime() - best.maturity.getTime());

  for (const bond of future) {
    const diff = Math.abs(targetDate.getTime() - bond.maturity.getTime());
    if (diff < bestDiff) {
      best = bond;
      bestDiff = diff;
    }
  }

  const daysOff = Math.round(
    (best.maturity.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { bond: best, daysOff };
}
