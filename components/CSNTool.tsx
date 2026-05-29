'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  calculateDisbursements,
  buildChartData,
  calculateTax,
  formatSEK,
  formatCurrency,
  formatMonth,
  addMonths,
  CSN_2026,
  INTENSITY_OPTIONS,
  CURRENCIES,
  FALLBACK_RATES,
  BondRates,
  TaxMode,
  Currency,
} from '@/lib/csn';
import { findBondBeforeRepayment } from '@/lib/bonds';
import { useLanguage } from '@/components/LanguageProvider';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const BLUE = '#006AA7';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
      {children}
    </p>
  );
}

function IntensityButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-[#006AA7] text-white shadow-sm'
          : 'border border-gray-200 bg-white text-gray-600 hover:border-[#006AA7]/40 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

// ── URL param helpers ──────────────────────────────────────────────────────────

function readParams() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search);
}

function getNum(p: URLSearchParams, key: string, fallback: number, min: number, max: number): number {
  const v = Number(p.get(key));
  return isNaN(v) || v < min || v > max ? fallback : v;
}

// ── Sensitivity helper ─────────────────────────────────────────────────────────

function shiftRates(rates: BondRates, delta: number): BondRates {
  return {
    ...rates,
    '2y': { ...rates['2y'], rate: Math.max(0, rates['2y'].rate + delta) },
    '5y': { ...rates['5y'], rate: Math.max(0, rates['5y'].rate + delta) },
    '10y': { ...rates['10y'], rate: Math.max(0, rates['10y'].rate + delta) },
  };
}

// ── CSV export ─────────────────────────────────────────────────────────────────

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── ComparePanel ───────────────────────────────────────────────────────────────

function ComparePanel({
  t, bondRates, overrideYield, currency, exchangeRates,
  taxMode, schablonRate, customTaxRate, avgHoldingYears,
  aMonths, aStartYear, aStartMonth, aIntensity, aInvestPct, aTaxMode, aGrandTotal,
  bMonths, setBMonths, bStartYear, setBStartYear, bStartMonth, setBStartMonth,
  bIntensity, setBIntensity, bInvestPct, setBInvestPct, bTaxMode, setBTaxMode,
  intensityLabel, yearOptions, fmt,
}: {
  t: import('@/lib/translations').Trans;
  bondRates: BondRates; overrideYield?: number;
  currency: Currency; exchangeRates: Record<string, number>;
  taxMode: TaxMode; schablonRate: number; customTaxRate: number; avgHoldingYears: number;
  aMonths: number; aStartYear: number; aStartMonth: number; aIntensity: number; aInvestPct: number; aTaxMode: TaxMode; aGrandTotal: number;
  bMonths: number; setBMonths: (v: number) => void;
  bStartYear: number; setBStartYear: (v: number) => void;
  bStartMonth: number; setBStartMonth: (v: number) => void;
  bIntensity: number; setBIntensity: (v: number) => void;
  bInvestPct: number; setBInvestPct: (v: number) => void;
  bTaxMode: TaxMode; setBTaxMode: (v: TaxMode) => void;
  intensityLabel: (v: number) => string;
  yearOptions: number[];
  fmt: (sek: number) => string;
}) {
  const bStartDate = new Date(bStartYear, bStartMonth, 1);
  const { disbursements: bDisb, summary: bSum } = calculateDisbursements(
    bStartDate, bMonths, bIntensity, bondRates, overrideYield, findBondBeforeRepayment, bInvestPct / 100
  );
  const bAvgHolding = bDisb.length > 0
    ? bDisb.reduce((s, d) => s + d.daysToRepayment, 0) / bDisb.length / 365
    : 0;
  const bTax = calculateTax(bSum.totalBondValue, bSum.totalInvested, bAvgHolding, bTaxMode, schablonRate, customTaxRate);
  const bNet = bSum.totalBondValue - bTax.taxPaid - bSum.totalLoanAtRepayment;
  const bGrandTotal = bSum.totalGrant + bNet;

  const diff = bGrandTotal - aGrandTotal;

  const rows: { label: string; a: string; b: string }[] = [
    { label: t.monthsLabel, a: `${aMonths} ${aMonths === 1 ? t.monthSingular : t.monthPlural}`, b: `${bMonths} ${bMonths === 1 ? t.monthSingular : t.monthPlural}` },
    { label: t.intensityLabel, a: intensityLabel(aIntensity), b: intensityLabel(bIntensity) },
    { label: t.investLabel, a: `${aInvestPct}%`, b: `${bInvestPct}%` },
    { label: t.sectionTax, a: aTaxMode.toUpperCase(), b: bTaxMode.toUpperCase() },
    { label: t.totalGrant, a: fmt(aGrandTotal - (aGrandTotal - aGrandTotal)), b: fmt(bSum.totalGrant) },
    { label: t.bondProfitAfterTax, a: fmt(aGrandTotal - 0), b: fmt(bNet) },
    { label: t.compareGrandTotal, a: fmt(aGrandTotal), b: fmt(bGrandTotal) },
  ];

  return (
    <div className="mt-5 space-y-5">
      {/* Scenario B controls */}
      <Card className="p-6">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#006AA7]">
          {t.scenarioB}
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t.monthsLabel}</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min={1} max={48} value={bMonths}
                onChange={(e) => setBMonths(Number(e.target.value))}
                className="flex-1 accent-[#006AA7]"
              />
              <span className="w-10 text-right text-sm font-bold" style={{ color: BLUE }}>{bMonths}</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t.startMonthLabel}</label>
            <select
              value={bStartMonth}
              onChange={(e) => setBStartMonth(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            >
              {t.monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t.yearLabel}</label>
            <select
              value={bStartYear}
              onChange={(e) => setBStartYear(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            >
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t.intensityLabel}</label>
            <div className="flex gap-1.5 flex-wrap">
              {INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBIntensity(opt.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    bIntensity === opt.value
                      ? 'bg-[#006AA7] text-white'
                      : 'border border-gray-200 text-gray-600 hover:border-[#006AA7]/40'
                  }`}
                >
                  {intensityLabel(opt.value)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t.investLabel}</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min={0} max={100} value={bInvestPct}
                onChange={(e) => setBInvestPct(Number(e.target.value))}
                className="flex-1 accent-[#006AA7]"
              />
              <span className="w-10 text-right text-sm font-bold" style={{ color: BLUE }}>{bInvestPct}%</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t.sectionTax}</label>
            <div className="flex gap-1.5">
              {(['isk', 'depot', 'custom'] as TaxMode[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setBTaxMode(k)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    bTaxMode === k
                      ? 'bg-[#006AA7] text-white'
                      : 'border border-gray-200 text-gray-600 hover:border-[#006AA7]/40'
                  }`}
                >
                  {k === 'isk' ? t.taxISK : k === 'depot' ? t.taxDepot : t.taxCustom}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Side-by-side results */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: t.scenarioA, grand: aGrandTotal, isB: false },
          { label: t.scenarioB, grand: bGrandTotal, isB: true },
        ].map(({ label, grand }) => (
          <Card key={label} className={`p-5 ${grand >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
            <p className={`text-3xl font-bold tracking-tight ${grand >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {grand >= 0 ? '+' : ''}{fmt(grand)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{t.compareGrandTotal}</p>
          </Card>
        ))}
      </div>

      {/* Winner banner */}
      <div className={`rounded-2xl border p-4 text-center ${diff === 0 ? 'border-gray-200 bg-gray-50' : diff > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
        <p className={`text-sm font-semibold ${diff === 0 ? 'text-gray-600' : diff > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
          {diff === 0
            ? '='
            : diff > 0
              ? `${t.scenarioB}: ${t.compareBetterBy(fmt(Math.abs(diff)))}`
              : `${t.scenarioA}: ${t.compareBetterBy(fmt(Math.abs(diff)))}`}
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CSNTool() {
  const { t } = useLanguage();
  const now = new Date();

  // ── State ──────────────────────────────────────────────────────────────────
  const [months, setMonths] = useState(9);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(now.getMonth());
  const [intensity, setIntensity] = useState(1.0);
  const [investPct, setInvestPct] = useState(100);

  const [bondRates, setBondRates] = useState<BondRates>(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);

  const [overriding, setOverriding] = useState(false);
  const [overrideInput, setOverrideInput] = useState('');

  const [currency, setCurrency] = useState<Currency>('SEK');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [fxDate, setFxDate] = useState('');
  const [fxSource, setFxSource] = useState('');

  const [taxMode, setTaxMode] = useState<TaxMode>('isk');
  const [schablonRate, setSchablonRate] = useState(0.015);
  const [customTaxRate, setCustomTaxRate] = useState(0.30);

  const [showDetail, setShowDetail] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Scenario B (compare) ───────────────────────────────────────────────────
  const [showCompare, setShowCompare] = useState(false);
  const [bMonths, setBMonths] = useState(9);
  const [bStartYear, setBStartYear] = useState(now.getFullYear());
  const [bStartMonth, setBStartMonth] = useState(now.getMonth());
  const [bIntensity, setBIntensity] = useState(1.0);
  const [bInvestPct, setBInvestPct] = useState(100);
  const [bTaxMode, setBTaxMode] = useState<TaxMode>('isk');

  // ── Read URL params on mount ───────────────────────────────────────────────
  useEffect(() => {
    const p = readParams();
    if (!p) return;
    if (p.has('m'))   setMonths(getNum(p, 'm', 9, 1, 48));
    if (p.has('sy'))  setStartYear(getNum(p, 'sy', now.getFullYear(), 2024, 2035));
    if (p.has('sm'))  setStartMonth(getNum(p, 'sm', now.getMonth(), 0, 11));
    if (p.has('i')) {
      const v = Number(p.get('i'));
      if ([1, 0.75, 0.5, 0.25].includes(v)) setIntensity(v);
    }
    if (p.has('ip'))  setInvestPct(getNum(p, 'ip', 100, 0, 100));
    if (p.has('tm') && ['isk', 'depot', 'custom'].includes(p.get('tm')!))
      setTaxMode(p.get('tm') as TaxMode);
    if (p.has('sr'))  setSchablonRate(getNum(p, 'sr', 1.5, 0, 20) / 100);
    if (p.has('cr'))  setCustomTaxRate(getNum(p, 'cr', 30, 0, 100) / 100);
    if (p.has('cur') && CURRENCIES.includes(p.get('cur') as Currency))
      setCurrency(p.get('cur') as Currency);
    if (p.get('ov') === '1') setOverriding(true);
    if (p.has('ovr')) setOverrideInput(p.get('ovr')!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update URL on state change ─────────────────────────────────────────────
  const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (urlTimer.current) clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(() => {
      const p = new URLSearchParams();
      p.set('m', months.toString());
      p.set('sy', startYear.toString());
      p.set('sm', startMonth.toString());
      p.set('i', intensity.toString());
      p.set('ip', investPct.toString());
      p.set('tm', taxMode);
      p.set('sr', (schablonRate * 100).toFixed(2));
      p.set('cr', (customTaxRate * 100).toFixed(1));
      p.set('cur', currency);
      p.set('ov', overriding ? '1' : '0');
      if (overrideInput) p.set('ovr', overrideInput);
      // preserve lang param if set
      const existing = new URLSearchParams(window.location.search);
      if (existing.has('lang')) p.set('lang', existing.get('lang')!);
      history.replaceState(null, '', `?${p.toString()}`);
    }, 400);
  }, [months, startYear, startMonth, intensity, investPct, taxMode, schablonRate, customTaxRate, currency, overriding, overrideInput]);

  // ── Fetch rates ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/bond-rate')
      .then((r) => r.json())
      .then((data) => {
        setBondRates({
          '2y': data.tenors['2y'],
          '5y': data.tenors['5y'],
          '10y': data.tenors['10y'],
          source: data.source,
          updatedAt: data.updatedAt,
        });
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then((r) => r.json())
      .then((data) => {
        setExchangeRates(data.rates);
        setFxDate(data.date);
        setFxSource(data.source);
      })
      .catch(() => {});
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const startDate = useMemo(() => new Date(startYear, startMonth, 1), [startYear, startMonth]);

  const overrideYield = useMemo(() => {
    if (!overriding || !overrideInput) return undefined;
    const parsed = parseFloat(overrideInput);
    return isNaN(parsed) ? undefined : parsed / 100;
  }, [overriding, overrideInput]);

  const { disbursements, summary } = useMemo(
    () => calculateDisbursements(startDate, months, intensity, bondRates, overrideYield, findBondBeforeRepayment, investPct / 100),
    [startDate, months, intensity, bondRates, overrideYield, investPct]
  );

  const chartData = useMemo(
    () => buildChartData(disbursements, summary.repaymentDate, bondRates, overrideYield),
    [disbursements, summary.repaymentDate, bondRates, overrideYield]
  );

  const repaymentMonthLabel = formatMonth(summary.repaymentDate);

  const avgHoldingYears = disbursements.length > 0
    ? disbursements.reduce((s, d) => s + d.daysToRepayment, 0) / disbursements.length / 365
    : 0;

  const taxResult = useMemo(
    () => calculateTax(summary.totalBondValue, summary.totalInvested, avgHoldingYears, taxMode, schablonRate, customTaxRate),
    [summary, avgHoldingYears, taxMode, schablonRate, customTaxRate]
  );

  const netAfterTax = summary.totalBondValue - taxResult.taxPaid - summary.totalLoanAtRepayment;
  const canRepayAfterTax = netAfterTax >= 0;
  const grandTotal = summary.totalGrant + netAfterTax;

  // ── Sensitivity analysis ───────────────────────────────────────────────────
  const sensitivityScenarios = useMemo(() => {
    return [0, -0.5, -1.0, -1.5].map((delta) => {
      const rates = delta === 0 ? bondRates : shiftRates(bondRates, delta);
      const { summary: s } = calculateDisbursements(
        startDate, months, intensity, rates, overrideYield, findBondBeforeRepayment, investPct / 100
      );
      const tax = calculateTax(s.totalBondValue, s.totalInvested, avgHoldingYears, taxMode, schablonRate, customTaxRate);
      const net = s.totalBondValue - tax.taxPaid - s.totalLoanAtRepayment;
      return { delta, net, profitable: net >= 0 };
    });
  }, [startDate, months, intensity, bondRates, overrideYield, investPct, avgHoldingYears, taxMode, schablonRate, customTaxRate]);

  function fmt(sek: number) {
    return formatCurrency(sek, currency, exchangeRates);
  }

  const yearOptions = Array.from({ length: 10 }, (_, i) => now.getFullYear() + i);
  const activeRates = disbursements.length > 0 ? [...new Set(disbursements.map((d) => d.tenor))] : [];

  // ── Copy link ──────────────────────────────────────────────────────────────
  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // ── CSV export ─────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const header = [
      t.colMonth, t.colBond, t.colMaturity, t.colTenorYield,
      t.colGrant, t.colInvested, t.colBondValue, t.colLoanOwed, t.colNetPreTax,
    ].join(',');

    const rows = disbursements.map((d) => {
      const net = d.bondValue - d.loanAtRepayment;
      const b = d.matchedBond;
      return [
        d.label,
        b ? b.isin : '',
        b ? b.maturity.toISOString().slice(0, 10) : '',
        `${(d.bondYield * 100).toFixed(2)}%`,
        d.grant.toFixed(0),
        d.investedAmount.toFixed(0),
        d.bondValue.toFixed(0),
        d.loanAtRepayment.toFixed(0),
        net.toFixed(0),
      ].join(',');
    });

    const summary_row = [
      t.totalLabel, '', '', '',
      summary.totalGrant.toFixed(0),
      summary.totalInvested.toFixed(0),
      summary.totalBondValue.toFixed(0),
      summary.totalLoanAtRepayment.toFixed(0),
      summary.netGainPreTax.toFixed(0),
    ].join(',');

    downloadCSV([header, ...rows, summary_row].join('\n'), 'csn-arbitrage.csv');
  }, [disbursements, summary, t]);

  // ── PDF export (print) ─────────────────────────────────────────────────────
  const exportPDF = useCallback(() => {
    window.print();
  }, []);

  // ── Intensity label helper ─────────────────────────────────────────────────
  function intensityLabel(value: number) {
    if (value === 1.0) return t.intensityFull;
    return `${value * 100}%`;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Top action bar: share + export ── */}
      <div className="flex items-center gap-3 flex-wrap justify-end">
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-[#006AA7]/40 hover:text-gray-900"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? t.linkCopied : t.copyLink}
        </button>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-[#006AA7]/40 hover:text-gray-900"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t.exportCSV}
        </button>
        <button
          onClick={exportPDF}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-[#006AA7]/40 hover:text-gray-900"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t.exportPDF}
        </button>
      </div>

      {/* ── Bond rates banner ── */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel>{t.sectionBonds}</SectionLabel>
              <div className="flex flex-wrap gap-6">
                {(['2y', '5y', '10y'] as const).map((tenor) => (
                  <div key={tenor}>
                    <span className="text-xs text-gray-400">{t.tenorLabels[tenor]}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-900">
                        {ratesLoading ? '—' : bondRates[tenor].rate.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>
                {bondRates.source === 'riksbank' ? t.liveFromRiksbank : t.estimatedRiksbank}
              </p>
              {bondRates.updatedAt && (
                <p className="mt-0.5">
                  {t.updatedOn}{' '}
                  {new Date(bondRates.updatedAt).toLocaleDateString('en-SE', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 select-none">
            <input
              type="checkbox"
              checked={overriding}
              onChange={(e) => setOverriding(e.target.checked)}
              className="rounded accent-[#006AA7]"
            />
            {t.customYieldToggle}
          </label>
          {overriding && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="30"
                placeholder="e.g. 4.00"
                value={overrideInput}
                onChange={(e) => setOverrideInput(e.target.value)}
                className="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
              />
              <span className="text-sm text-gray-400">{t.customYieldSuffix}</span>
            </div>
          )}
        </div>
      </Card>

      {/* ── Inputs ── */}
      <Card className="p-6">
        <SectionLabel>{t.sectionSetup}</SectionLabel>

        <div className="mb-7">
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm text-gray-600">{t.monthsLabel}</label>
            <span className="text-3xl font-bold" style={{ color: BLUE }}>
              {months}
              <span className="ml-1 text-base font-medium text-gray-400">
                {months === 1 ? t.monthSingular : t.monthPlural}
              </span>
            </span>
          </div>
          <input
            type="range" min={1} max={48} value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-[#006AA7]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{t.rangeMin}</span>
            <span>{t.rangeMax}</span>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-gray-600">{t.startMonthLabel}</label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            >
              {t.monthNames.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-600">{t.yearLabel}</label>
            <select
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-7">
          <label className="mb-2 block text-sm text-gray-600">{t.intensityLabel}</label>
          <div className="flex gap-2 flex-wrap">
            {INTENSITY_OPTIONS.map((opt) => (
              <IntensityButton
                key={opt.value}
                label={intensityLabel(opt.value)}
                active={intensity === opt.value}
                onClick={() => setIntensity(opt.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm text-gray-600">{t.investLabel}</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min={0} max={100} step={1}
                value={investPct}
                onChange={(e) => {
                  const v = Math.min(100, Math.max(0, Number(e.target.value)));
                  setInvestPct(isNaN(v) ? 0 : v);
                }}
                className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-right text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
                style={{ color: BLUE }}
              />
              <span className="text-base font-medium text-gray-400">%</span>
            </div>
          </div>
          <input
            type="range" min={0} max={100}
            value={investPct}
            onChange={(e) => setInvestPct(Number(e.target.value))}
            className="w-full accent-[#006AA7]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{t.investMin}</span>
            <span>{t.investMax}</span>
          </div>
          {investPct < 100 && (
            <p className="mt-2 text-xs text-gray-400">{t.investHint(investPct)}</p>
          )}
        </div>
      </Card>

      {/* ── Repayment date + tenor info ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#006AA7]/15 bg-[#006AA7]/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#006AA7]/70 mb-1">
            {t.earliestRepayment}
          </p>
          <p className="text-lg font-bold text-[#006AA7]">{repaymentMonthLabel}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t.repaymentNote(formatMonth(addMonths(startDate, months - 1)))}
          </p>
        </div>
        {activeRates.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              {t.bondsAutoMatched}
            </p>
            {activeRates.map((tenor) => {
              const count = disbursements.filter((d) => d.tenor === tenor).length;
              const rate = overrideYield
                ? (overrideYield * 100).toFixed(2)
                : bondRates[tenor].rate.toFixed(2);
              return (
                <p key={tenor} className="text-sm text-gray-700">
                  <span className="font-medium">{t.tenorLabels[tenor]}</span>{' '}
                  {t.atRate}{' '}
                  <span className="font-bold text-gray-900">{rate}%</span>
                  <span className="text-gray-400"> ({t.paymentCount(count)})</span>
                </p>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Currency selector ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t.displayCurrency}
        </span>
        <div className="flex rounded-xl border border-gray-200 bg-white p-1 gap-0.5">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                currency === c ? 'bg-[#006AA7] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {currency !== 'SEK' && exchangeRates[currency] && (
          <span className="text-xs text-gray-400">
            1 SEK = {exchangeRates[currency].toFixed(4)} {currency}
            {fxDate && ` · ${fxSource === 'ecb' ? 'ECB' : 'est.'} ${fxDate}`}
          </span>
        )}
      </div>

      {/* ── Summary cards ── */}
      <section>
        <SectionLabel>{t.sectionResults}</SectionLabel>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs text-gray-400 mb-1">{t.totalGrant}</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(summary.totalGrant)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.paymentsCount(months)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-400 mb-1">{t.loanPlusInterest}</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(summary.totalLoanAtRepayment)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.principal} {fmt(summary.totalLoan)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-400 mb-1">{t.bondPortfolioValue}</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(summary.totalBondValue)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.beforeTax}</p>
          </Card>
          <Card className={`p-5 ${summary.canRepayImmediately ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <p className="text-xs text-gray-500 mb-1">
              {summary.canRepayImmediately ? t.surplusPreTax : t.shortfallPreTax}
            </p>
            <p className={`text-2xl font-bold ${summary.canRepayImmediately ? 'text-emerald-700' : 'text-red-700'}`}>
              {summary.canRepayImmediately ? '+' : ''}{fmt(summary.netGainPreTax)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {summary.canRepayImmediately ? t.repayAndKeep : t.bondsFallShort}
            </p>
          </Card>
        </div>
      </section>

      {/* ── Chart ── */}
      <Card className="p-6">
        <SectionLabel>{t.sectionChart}</SectionLabel>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bondGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BLUE} stopOpacity={0.12} />
                <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={Math.floor(chartData.length / 5)} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={42} />
            <Tooltip
              formatter={(value, name) => [
                fmt(Number(value)),
                name === 'bondPortfolio' ? t.chartBondPortfolio : t.chartLoanBalance,
              ]}
              contentStyle={{ border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px' }}
            />
            <Legend
              formatter={(value) => value === 'bondPortfolio' ? t.chartBondPortfolio : t.chartLoanBalance}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <ReferenceLine
              x={repaymentMonthLabel}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              label={{ value: t.chartRepayment, position: 'insideTopRight', fontSize: 10, fill: '#6b7280' }}
            />
            <Area type="monotone" dataKey="bondPortfolio" stroke={BLUE} strokeWidth={2} fill="url(#bondGrad)" dot={false} />
            <Area type="monotone" dataKey="loanBalance" stroke="#ef4444" strokeWidth={2} fill="url(#loanGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Tax section ── */}
      <Card className="p-6">
        <SectionLabel>{t.sectionTax}</SectionLabel>

        <div className="mb-5 flex rounded-xl border border-gray-100 p-1 w-fit gap-0.5">
          {([
            { key: 'isk', label: t.taxISK },
            { key: 'depot', label: t.taxDepot },
            { key: 'custom', label: t.taxCustom },
          ] as { key: TaxMode; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTaxMode(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                taxMode === key ? 'bg-[#006AA7] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {taxMode === 'isk' && (
          <div className="space-y-2 mb-5">
            <p className="text-sm text-gray-600">{t.iskDescription}</p>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">{t.schablonLabel}</label>
              <input
                type="number" step="0.01"
                value={(schablonRate * 100).toFixed(2)}
                onChange={(e) => setSchablonRate(parseFloat(e.target.value) / 100)}
                className="w-24 rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
              />
              <span className="text-sm text-gray-400">{t.perYear}</span>
            </div>
          </div>
        )}

        {taxMode === 'depot' && (
          <p className="text-sm text-gray-600 mb-5">{t.depotDescription}</p>
        )}

        {taxMode === 'custom' && (
          <div className="flex items-center gap-3 mb-5">
            <label className="text-sm text-gray-600">{t.customRateLabel}</label>
            <input
              type="number" step="0.1" min="0" max="100"
              value={(customTaxRate * 100).toFixed(1)}
              onChange={(e) => setCustomTaxRate(parseFloat(e.target.value) / 100)}
              className="w-24 rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            />
            <span className="text-sm text-gray-400">%</span>
          </div>
        )}

        <div className={`rounded-2xl border p-5 ${canRepayAfterTax ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                {t.netAfterTaxLabel}
              </p>
              <p className={`text-4xl font-bold tracking-tight ${canRepayAfterTax ? 'text-emerald-700' : 'text-red-700'}`}>
                {canRepayAfterTax ? '+' : ''}{fmt(netAfterTax)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {canRepayAfterTax ? t.canRepayText : t.shortfallText(fmt(-netAfterTax))}
              </p>
            </div>
            <span className={`text-4xl ${canRepayAfterTax ? 'text-emerald-500' : 'text-red-400'}`}>
              {canRepayAfterTax ? '✓' : '✗'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-200/60 pt-4">
            <div>
              <p className="text-xs text-gray-500">{t.taxPaid}</p>
              <p className="font-semibold text-gray-800">{fmt(taxResult.taxPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t.bondProceeds}</p>
              <p className="font-semibold text-gray-800">{fmt(summary.totalBondValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t.loanPlusInterestShort}</p>
              <p className="font-semibold text-gray-800">{fmt(summary.totalLoanAtRepayment)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Grand total box ── */}
      <Card className={`p-6 ${grandTotal >= 0 ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white' : 'border-red-200 bg-gradient-to-br from-red-50 to-white'}`}>
        <SectionLabel>{t.sectionGrandTotal}</SectionLabel>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={`text-5xl font-bold tracking-tight ${grandTotal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {grandTotal >= 0 ? '+' : ''}{fmt(grandTotal)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {grandTotal >= 0 ? t.grandTotalPositive : t.grandTotalNegative}
            </p>
          </div>
          <span className={`text-5xl shrink-0 ${grandTotal >= 0 ? 'text-emerald-400' : 'text-red-300'}`}>
            {grandTotal >= 0 ? '✓' : '✗'}
          </span>
        </div>
        <div className={`mt-5 grid gap-3 border-t border-gray-200/50 pt-5 ${investPct < 100 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <div>
            <p className="text-xs text-gray-400 mb-1">{t.grantReceived}</p>
            <p className="text-lg font-bold text-gray-800">+{fmt(summary.totalGrant)}</p>
            <p className="text-xs text-gray-400">{t.neverRepaid}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">{t.bondProfitAfterTax}</p>
            <p className={`text-lg font-bold ${netAfterTax >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {netAfterTax >= 0 ? '+' : ''}{fmt(netAfterTax)}
            </p>
            <p className="text-xs text-gray-400">{t.bondsMinusRepayment}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">{t.taxPaid}</p>
            <p className="text-lg font-bold text-gray-600">{fmt(taxResult.taxPaid)}</p>
            <p className="text-xs text-gray-400">
              {taxMode === 'isk' ? t.iskTaxLabel : taxMode === 'depot' ? t.depotTaxLabel : t.taxCustom}
            </p>
          </div>
          {investPct < 100 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">{t.loanSpentOnLiving}</p>
              <p className="text-lg font-bold text-gray-500">{fmt(summary.totalSpent)}</p>
              <p className="text-xs text-gray-400">{t.notAvailableAtRepayment}</p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Sensitivity analysis ── */}
      <Card className="p-6">
        <SectionLabel>{t.sectionSensitivity}</SectionLabel>
        <p className="text-sm text-gray-500 mb-5">{t.sensitivityDesc}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sensitivityScenarios.map(({ delta, net, profitable }) => (
            <div
              key={delta}
              className={`rounded-xl border p-4 ${profitable ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                {delta === 0 ? t.scenarioCurrent : t.scenarioDrop(Math.abs(delta).toFixed(1))}
              </p>
              <p className={`text-xl font-bold ${profitable ? 'text-emerald-700' : 'text-red-600'}`}>
                {net >= 0 ? '+' : ''}{fmt(net)}
              </p>
              <p className="text-xs mt-1 text-gray-500">{t.scenarioNetProfit}</p>
              <p className={`text-xs font-medium mt-0.5 ${profitable ? 'text-emerald-600' : 'text-red-500'}`}>
                {profitable ? t.scenarioProfitable : t.scenarioNotProfitable}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Compare two scenarios ── */}
      <section>
        <button
          onClick={() => setShowCompare((v) => !v)}
          className="text-sm font-medium text-[#006AA7] hover:underline flex items-center gap-1.5"
        >
          <span className="text-xs">{showCompare ? '▲' : '▼'}</span>
          {showCompare ? t.compareHide : t.compareToggle}
        </button>

        {showCompare && <ComparePanel
          t={t}
          bondRates={bondRates}
          overrideYield={overrideYield}
          currency={currency}
          exchangeRates={exchangeRates}
          taxMode={taxMode}
          schablonRate={schablonRate}
          customTaxRate={customTaxRate}
          avgHoldingYears={avgHoldingYears}
          aMonths={months} aStartYear={startYear} aStartMonth={startMonth}
          aIntensity={intensity} aInvestPct={investPct} aTaxMode={taxMode}
          aGrandTotal={grandTotal}
          bMonths={bMonths} setBMonths={setBMonths}
          bStartYear={bStartYear} setBStartYear={setBStartYear}
          bStartMonth={bStartMonth} setBStartMonth={setBStartMonth}
          bIntensity={bIntensity} setBIntensity={setBIntensity}
          bInvestPct={bInvestPct} setBInvestPct={setBInvestPct}
          bTaxMode={bTaxMode} setBTaxMode={setBTaxMode}
          intensityLabel={intensityLabel}
          yearOptions={yearOptions}
          fmt={fmt}
        />}
      </section>

      {/* ── Detail table ── */}
      <section>
        <button
          onClick={() => setShowDetail((v) => !v)}
          className="text-sm font-medium text-[#006AA7] hover:underline flex items-center gap-1.5"
        >
          <span className="text-xs">{showDetail ? '▲' : '▼'}</span>
          {showDetail ? t.hideBreakdown : t.showBreakdown}
        </button>

        {showDetail && (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3 text-left">{t.colMonth}</th>
                  <th className="px-5 py-3 text-left">{t.colBond}</th>
                  <th className="px-5 py-3 text-left">{t.colMaturity}</th>
                  <th className="px-5 py-3 text-left">{t.colTenorYield}</th>
                  <th className="px-5 py-3 text-right">{t.colGrant}</th>
                  <th className="px-5 py-3 text-right">{t.colInvested}</th>
                  <th className="px-5 py-3 text-right">{t.colBondValue}</th>
                  <th className="px-5 py-3 text-right">{t.colLoanOwed}</th>
                  <th className="px-5 py-3 text-right">{t.colNetPreTax}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {disbursements.map((d) => {
                  const net = d.bondValue - d.loanAtRepayment;
                  const b = d.matchedBond;
                  const mismatch = b && b.daysOff < -14;
                  return (
                    <tr key={d.monthIndex} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">{d.label}</td>
                      <td className="px-5 py-3">
                        {b ? (
                          <div>
                            <p className="font-mono text-xs text-gray-700 font-semibold">{b.isin}</p>
                            <p className="text-xs text-gray-500">{b.name}</p>
                            {mismatch && (
                              <p className="text-[11px] text-amber-600 mt-0.5">
                                {t.maturesBeforeRepayment(Math.abs(b.daysOff))}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">{t.noMatch}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {b ? b.maturity.toLocaleDateString('en-SE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-xs text-gray-500">{t.tenorLabels[d.tenor]}</span>
                        <span className="ml-1 text-xs font-semibold text-gray-800">{(d.bondYield * 100).toFixed(2)}%</span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">{fmt(d.grant)}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{fmt(d.investedAmount)}</td>
                      <td className="px-5 py-3 text-right text-gray-700">{fmt(d.bondValue)}</td>
                      <td className="px-5 py-3 text-right text-gray-700">{fmt(d.loanAtRepayment)}</td>
                      <td className={`px-5 py-3 text-right font-semibold whitespace-nowrap ${net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {net >= 0 ? '+' : ''}{fmt(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-semibold text-sm">
                <tr>
                  <td className="px-5 py-3 text-gray-900" colSpan={4}>{t.totalLabel}</td>
                  <td className="px-5 py-3 text-right text-gray-800">{fmt(summary.totalGrant)}</td>
                  <td className="px-5 py-3 text-right text-gray-800">{fmt(summary.totalInvested)}</td>
                  <td className="px-5 py-3 text-right text-gray-800">{fmt(summary.totalBondValue)}</td>
                  <td className="px-5 py-3 text-right text-gray-800">{fmt(summary.totalLoanAtRepayment)}</td>
                  <td className={`px-5 py-3 text-right ${summary.netGainPreTax >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {summary.netGainPreTax >= 0 ? '+' : ''}{fmt(summary.netGainPreTax)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <p className="px-5 py-3 text-[11px] text-gray-400 border-t border-gray-100">
              {t.tableFootnote}
            </p>
          </div>
        )}
      </section>

      {/* ── Footer note ── */}
      <p className="text-xs text-gray-400 leading-relaxed">
        {t.footerNote(
          bondRates.source === 'riksbank' ? 'live' : 'estimated',
          fxDate,
        )}
      </p>
    </div>
  );
}
