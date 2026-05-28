'use client';

import { useState, useMemo, useEffect } from 'react';
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
const TENOR_LABELS: Record<string, string> = {
  '2y': '2-year',
  '5y': '5-year',
  '10y': '10-year',
};

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

function IntensityButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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

export default function CSNTool() {
  const now = new Date();
  const [months, setMonths] = useState(9);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(now.getMonth());
  const [intensity, setIntensity] = useState(1.0);

  // Bond rates from Riksbank
  const [bondRates, setBondRates] = useState<BondRates>(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);

  // Optional override
  const [overriding, setOverriding] = useState(false);
  const [overrideInput, setOverrideInput] = useState('');

  // Currency
  const [currency, setCurrency] = useState<Currency>('SEK');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [fxDate, setFxDate] = useState('');
  const [fxSource, setFxSource] = useState('');

  // Tax
  const [taxMode, setTaxMode] = useState<TaxMode>('isk');
  const [schablonRate, setSchablonRate] = useState(0.015);
  const [customTaxRate, setCustomTaxRate] = useState(0.30);

  // UI state
  const [showDetail, setShowDetail] = useState(false);

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

  const startDate = useMemo(
    () => new Date(startYear, startMonth, 1),
    [startYear, startMonth]
  );

  const overrideYield = useMemo(() => {
    if (!overriding || !overrideInput) return undefined;
    const parsed = parseFloat(overrideInput);
    return isNaN(parsed) ? undefined : parsed / 100;
  }, [overriding, overrideInput]);

  const { disbursements, summary } = useMemo(
    () => calculateDisbursements(startDate, months, intensity, bondRates, overrideYield, findBondBeforeRepayment),
    [startDate, months, intensity, bondRates, overrideYield]
  );

  const chartData = useMemo(
    () => buildChartData(disbursements, summary.repaymentDate, bondRates, overrideYield),
    [disbursements, summary.repaymentDate, bondRates, overrideYield]
  );

  const repaymentMonthLabel = formatMonth(summary.repaymentDate);

  const avgHoldingYears =
    disbursements.length > 0
      ? disbursements.reduce((s, d) => s + d.daysToRepayment, 0) /
        disbursements.length /
        365
      : 0;

  const taxResult = useMemo(
    () =>
      calculateTax(
        summary.totalBondValue,
        summary.totalLoan,
        avgHoldingYears,
        taxMode,
        schablonRate,
        customTaxRate
      ),
    [summary, avgHoldingYears, taxMode, schablonRate, customTaxRate]
  );

  const netAfterTax = summary.totalBondValue - taxResult.taxPaid - summary.totalLoanAtRepayment;
  const canRepayAfterTax = netAfterTax >= 0;

  function fmt(sek: number) {
    return formatCurrency(sek, currency, exchangeRates);
  }

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const yearOptions = Array.from({ length: 10 }, (_, i) => now.getFullYear() + i);

  const activeRates = disbursements.length > 0
    ? [...new Set(disbursements.map((d) => d.tenor))]
    : [];

  return (
    <div className="space-y-8">

      {/* ── Bond rates banner ── */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel>Swedish government bonds · Riksbank</SectionLabel>
              <div className="flex flex-wrap gap-6">
                {(['2y', '5y', '10y'] as const).map((tenor) => (
                  <div key={tenor}>
                    <span className="text-xs text-gray-400">{TENOR_LABELS[tenor]}</span>
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
                {bondRates.source === 'riksbank'
                  ? 'Live from Riksbank'
                  : 'Estimated (Riksbank unavailable)'}
              </p>
              <p className="mt-0.5">Updates daily</p>
            </div>
          </div>
        </div>

        {/* Override toggle */}
        <div className="px-6 py-3 flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 select-none">
            <input
              type="checkbox"
              checked={overriding}
              onChange={(e) => setOverriding(e.target.checked)}
              className="rounded accent-[#006AA7]"
            />
            Use a custom yield instead
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
              <span className="text-sm text-gray-400">% per annum, applied to all tenors</span>
            </div>
          )}
        </div>
      </Card>

      {/* ── Inputs ── */}
      <Card className="p-6">
        <SectionLabel>Your CSN setup</SectionLabel>

        <div className="mb-7">
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm text-gray-600">Months receiving CSN</label>
            <span className="text-3xl font-bold" style={{ color: BLUE }}>
              {months}
              <span className="ml-1 text-base font-medium text-gray-400">
                month{months !== 1 ? 's' : ''}
              </span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={48}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-[#006AA7]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>48 months</span>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-gray-600">Start month</label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            >
              {monthNames.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-600">Year</label>
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

        <div>
          <label className="mb-2 block text-sm text-gray-600">Study intensity</label>
          <div className="flex gap-2 flex-wrap">
            {INTENSITY_OPTIONS.map((opt) => (
              <IntensityButton
                key={opt.value}
                label={opt.label}
                active={intensity === opt.value}
                onClick={() => setIntensity(opt.value)}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* ── Repayment date + tenor info ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#006AA7]/15 bg-[#006AA7]/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#006AA7]/70 mb-1">
            Earliest repayment
          </p>
          <p className="text-lg font-bold text-[#006AA7]">{repaymentMonthLabel}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            6 months after last payment ({formatMonth(addMonths(startDate, months - 1))})
          </p>
        </div>
        {activeRates.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Bond tenors auto-matched
            </p>
            {activeRates.map((t) => {
              const count = disbursements.filter((d) => d.tenor === t).length;
              const rate = overrideYield
                ? (overrideYield * 100).toFixed(2)
                : bondRates[t].rate.toFixed(2);
              return (
                <p key={t} className="text-sm text-gray-700">
                  <span className="font-medium">{TENOR_LABELS[t]}</span> at{' '}
                  <span className="font-bold text-gray-900">{rate}%</span>
                  <span className="text-gray-400"> ({count} payment{count !== 1 ? 's' : ''})</span>
                </p>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Currency selector ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Display currency
        </span>
        <div className="flex rounded-xl border border-gray-200 bg-white p-1 gap-0.5">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                currency === c
                  ? 'bg-[#006AA7] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
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
        <SectionLabel>Results at repayment date</SectionLabel>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs text-gray-400 mb-1">Total grant received</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(summary.totalGrant)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{months} payments</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-400 mb-1">Loan + interest owed</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(summary.totalLoanAtRepayment)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Principal {fmt(summary.totalLoan)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-400 mb-1">Bond portfolio value</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(summary.totalBondValue)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Before tax</p>
          </Card>
          <Card
            className={`p-5 ${
              summary.canRepayImmediately
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <p className="text-xs text-gray-500 mb-1">
              {summary.canRepayImmediately ? 'Surplus' : 'Shortfall'} pre-tax
            </p>
            <p
              className={`text-2xl font-bold ${
                summary.canRepayImmediately ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {summary.canRepayImmediately ? '+' : ''}
              {fmt(summary.netGainPreTax)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {summary.canRepayImmediately ? 'Repay in full, keep the gain' : 'Bonds fall short'}
            </p>
          </Card>
        </div>
      </section>

      {/* ── Chart ── */}
      <Card className="p-6">
        <SectionLabel>Portfolio vs loan balance over time</SectionLabel>
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
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval={Math.floor(chartData.length / 5)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              width={42}
            />
            <Tooltip
              formatter={(value, name) => [
                fmt(Number(value)),
                name === 'bondPortfolio' ? 'Bond portfolio' : 'Loan balance',
              ]}
              contentStyle={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '13px',
              }}
            />
            <Legend
              formatter={(value) =>
                value === 'bondPortfolio' ? 'Bond portfolio' : 'Loan balance'
              }
              wrapperStyle={{ fontSize: '12px' }}
            />
            <ReferenceLine
              x={repaymentMonthLabel}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              label={{
                value: 'Repayment',
                position: 'insideTopRight',
                fontSize: 10,
                fill: '#6b7280',
              }}
            />
            <Area
              type="monotone"
              dataKey="bondPortfolio"
              stroke={BLUE}
              strokeWidth={2}
              fill="url(#bondGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="loanBalance"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#loanGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Tax section ── */}
      <Card className="p-6">
        <SectionLabel>Tax assumptions</SectionLabel>

        <div className="mb-5 flex rounded-xl border border-gray-100 p-1 w-fit gap-0.5">
          {([
            { key: 'isk', label: 'ISK' },
            { key: 'depot', label: 'Regular depot' },
            { key: 'custom', label: 'Custom rate' },
          ] as { key: TaxMode; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTaxMode(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                taxMode === key
                  ? 'bg-[#006AA7] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {taxMode === 'isk' && (
          <div className="space-y-2 mb-5">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">ISK (Investeringssparkonto)</span> uses
              schablonbeskattning: a flat annual tax on the portfolio value, not on realized gains.
              No capital gains tax when bonds mature.
            </p>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Schablonränta</label>
              <input
                type="number"
                step="0.01"
                value={(schablonRate * 100).toFixed(2)}
                onChange={(e) => setSchablonRate(parseFloat(e.target.value) / 100)}
                className="w-24 rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
              />
              <span className="text-sm text-gray-400">% per year</span>
            </div>
          </div>
        )}

        {taxMode === 'depot' && (
          <p className="text-sm text-gray-600 mb-5">
            <span className="font-semibold text-gray-800">
              Regular depot (Värdepapperskonto)
            </span>{' '}
            uses kapitalinkomstskatt: 30% on realized gains when bonds mature, applied to the
            profit above your invested principal.
          </p>
        )}

        {taxMode === 'custom' && (
          <div className="flex items-center gap-3 mb-5">
            <label className="text-sm text-gray-600">Effective tax rate on gains</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={(customTaxRate * 100).toFixed(1)}
              onChange={(e) => setCustomTaxRate(parseFloat(e.target.value) / 100)}
              className="w-24 rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            />
            <span className="text-sm text-gray-400">%</span>
          </div>
        )}

        <div
          className={`rounded-2xl border p-5 ${
            canRepayAfterTax
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Net result after tax
              </p>
              <p
                className={`text-4xl font-bold tracking-tight ${
                  canRepayAfterTax ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {canRepayAfterTax ? '+' : ''}
                {fmt(netAfterTax)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {canRepayAfterTax
                  ? 'You can repay the full loan on day one and keep this on top of your grant.'
                  : `Bond proceeds fall ${fmt(-netAfterTax)} short after tax and interest.`}
              </p>
            </div>
            <span
              className={`text-4xl ${
                canRepayAfterTax ? 'text-emerald-500' : 'text-red-400'
              }`}
            >
              {canRepayAfterTax ? '✓' : '✗'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-200/60 pt-4">
            <div>
              <p className="text-xs text-gray-500">Tax paid</p>
              <p className="font-semibold text-gray-800">{fmt(taxResult.taxPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Bond proceeds</p>
              <p className="font-semibold text-gray-800">{fmt(summary.totalBondValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Loan + interest</p>
              <p className="font-semibold text-gray-800">{fmt(summary.totalLoanAtRepayment)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Detail table ── */}
      <section>
        <button
          onClick={() => setShowDetail((v) => !v)}
          className="text-sm font-medium text-[#006AA7] hover:underline flex items-center gap-1.5"
        >
          <span className="text-xs">{showDetail ? '▲' : '▼'}</span>
          {showDetail ? 'Hide' : 'Show'} full breakdown by disbursement
        </button>

        {showDetail && (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3 text-left">Month</th>
                  <th className="px-5 py-3 text-left">Suggested bond</th>
                  <th className="px-5 py-3 text-left">Maturity</th>
                  <th className="px-5 py-3 text-left">Tenor / yield</th>
                  <th className="px-5 py-3 text-right">Grant</th>
                  <th className="px-5 py-3 text-right">Loan invested</th>
                  <th className="px-5 py-3 text-right">Bond value at repayment</th>
                  <th className="px-5 py-3 text-right">Loan owed</th>
                  <th className="px-5 py-3 text-right">Net pre-tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {disbursements.map((d) => {
                  const net = d.bondValue - d.loanAtRepayment;
                  const b = d.matchedBond;
                  // daysOff is negative = matures before repayment (correct), flag if more than 14 days early
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
                                ⚠ Matures {Math.abs(b.daysOff)}d before repayment
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No match</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {b ? b.maturity.toLocaleDateString('en-SE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-xs text-gray-500">{TENOR_LABELS[d.tenor]}</span>
                        <span className="ml-1 text-xs font-semibold text-gray-800">{(d.bondYield * 100).toFixed(2)}%</span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">{fmt(d.grant)}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{fmt(d.loan)}</td>
                      <td className="px-5 py-3 text-right text-gray-700">{fmt(d.bondValue)}</td>
                      <td className="px-5 py-3 text-right text-gray-700">{fmt(d.loanAtRepayment)}</td>
                      <td
                        className={`px-5 py-3 text-right font-semibold whitespace-nowrap ${
                          net >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {net >= 0 ? '+' : ''}{fmt(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-semibold text-sm">
                <tr>
                  <td className="px-5 py-3 text-gray-900" colSpan={4}>Total</td>
                  <td className="px-5 py-3 text-right text-gray-800">{fmt(summary.totalGrant)}</td>
                  <td className="px-5 py-3 text-right text-gray-800">{fmt(summary.totalLoan)}</td>
                  <td className="px-5 py-3 text-right text-gray-800">{fmt(summary.totalBondValue)}</td>
                  <td className="px-5 py-3 text-right text-gray-800">{fmt(summary.totalLoanAtRepayment)}</td>
                  <td
                    className={`px-5 py-3 text-right ${
                      summary.netGainPreTax >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {summary.netGainPreTax >= 0 ? '+' : ''}
                    {fmt(summary.netGainPreTax)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <p className="px-5 py-3 text-[11px] text-gray-400 border-t border-gray-100">
              Each payment is matched to the bond with the latest maturity that still falls before your repayment date.
              Yields are interpolated from the Riksbank curve for each holding period.
              Bond ISINs are sourced from Riksgälden records. Treasury bill ISINs roll quarterly: verify the active ISIN at{' '}
              <a href="https://www.riksgalden.se" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">riksgalden.se</a>.
              A ⚠ flag appears when the matched bond matures more than 14 days before your repayment date.
            </p>
          </div>
        )}
      </section>

      {/* ── Footer note ── */}
      <p className="text-xs text-gray-400 leading-relaxed">
        CSN 2026: SEK 4,120 grant and SEK 9,472 loan per 4-week period (full-time). Loan interest
        2.135% per annum. Bond rates from Riksbank ({bondRates.source === 'riksbank' ? 'live' : 'estimated'}).
        Exchange rates from ECB via Frankfurter
        {fxDate ? ` (${fxDate})` : ''}. For informational purposes only. Not financial advice.
      </p>
    </div>
  );
}
