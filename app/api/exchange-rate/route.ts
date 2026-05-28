import { NextResponse } from 'next/server';

// Frankfurter uses ECB data, free, no key required, updates daily
const URL = 'https://api.frankfurter.app/latest?from=SEK&to=EUR,USD,GBP,DKK,NOK';

export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    const res = await fetch(URL, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();

    return NextResponse.json({
      rates: data.rates as Record<string, number>,
      date: data.date,
      source: 'ecb',
    });
  } catch {
    // Approximate fallback rates (SEK base)
    return NextResponse.json({
      rates: { EUR: 0.087, USD: 0.095, GBP: 0.075, DKK: 0.651, NOK: 1.04 },
      date: new Date().toISOString().split('T')[0],
      source: 'fallback',
    });
  }
}
