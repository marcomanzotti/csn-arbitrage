import { NextResponse } from 'next/server';

const SERIES = {
  '2y': 'SEGVB2YC',
  '5y': 'SEGVB5YC',
  '10y': 'SEGVB10YC',
};

const FALLBACKS = { '2y': 2.185, '5y': 2.385, '10y': 2.659 };

function dateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 10); // look back 10 days to catch weekends/holidays
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

async function fetchLatest(seriesId: string): Promise<number | null> {
  try {
    const { from, to } = dateRange();
    const url = `https://api.riksbank.se/swea/v1/Observations/${seriesId}/${from}/${to}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data: Array<{ date: string; value: number }> = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[data.length - 1].value;
  } catch {
    return null;
  }
}

export const revalidate = 86400;

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
