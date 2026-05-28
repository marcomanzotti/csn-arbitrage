import { NextResponse } from 'next/server';

// Riksbank SWEA series IDs for Swedish government bonds
const SERIES = {
  '2y': 'SEGVB2YC',
  '5y': 'SEGVB5YC',
  '10y': 'SEGVB10YC',
};

const FALLBACKS = { '2y': 2.8, '5y': 3.0, '10y': 3.2 };

async function fetchLatest(seriesId: string): Promise<number | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Try observations endpoint with a recent date window
    const url = `https://api.riksbank.se/swea/v1/observations/${seriesId}?from=${sevenDaysAgo()}&to=${today}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();

    // SWEA returns an array of observations; pick the most recent
    const observations: Array<{ date: string; value: string }> =
      Array.isArray(data) ? data : data?.observations ?? [];
    if (!observations.length) return null;

    const latest = observations[observations.length - 1];
    const rate = parseFloat(latest.value);
    return isNaN(rate) ? null : rate;
  } catch {
    return null;
  }
}

function sevenDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

export const revalidate = 86400; // 24 hours — daily update

export async function GET() {
  const [r2y, r5y, r10y] = await Promise.all([
    fetchLatest(SERIES['2y']),
    fetchLatest(SERIES['5y']),
    fetchLatest(SERIES['10y']),
  ]);

  const source = r2y !== null ? 'riksbank' : 'fallback';

  return NextResponse.json({
    tenors: {
      '2y': { rate: r2y ?? FALLBACKS['2y'], seriesId: SERIES['2y'] },
      '5y': { rate: r5y ?? FALLBACKS['5y'], seriesId: SERIES['5y'] },
      '10y': { rate: r10y ?? FALLBACKS['10y'], seriesId: SERIES['10y'] },
    },
    source,
    updatedAt: new Date().toISOString(),
  });
}
