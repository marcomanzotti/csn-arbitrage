import { NextResponse } from 'next/server';

// Riksbank SWEA API — Swedish government bond 2Y yield
const RIKSBANK_URL =
  'https://api.riksbank.se/swea/v1/observations/SEGVB2YC/latest';

export const revalidate = 3600; // cache 1 hour

export async function GET() {
  try {
    const res = await fetch(RIKSBANK_URL, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Riksbank status ${res.status}`);

    const data = await res.json();

    // The SWEA API returns { observations: [{ date, value }] } or similar
    const value =
      data?.observations?.[0]?.value ??
      data?.value ??
      data?.data?.[0]?.value;

    if (value == null) throw new Error('No rate in response');

    const rate = parseFloat(String(value));
    if (isNaN(rate)) throw new Error('Rate is not a number');

    return NextResponse.json({ rate, source: 'api', updatedAt: new Date().toISOString() });
  } catch {
    // Fallback: 3.5% — reasonable proxy for SEK government bonds in 2026
    return NextResponse.json({
      rate: 3.5,
      source: 'fallback',
      updatedAt: new Date().toISOString(),
    });
  }
}
