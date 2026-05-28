'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  calculateDisbursements,
  buildChartData,
  calculateTax,
  formatSEK,
  formatMonth,
  addMonths,
  CSN_2026,
  INTENSITY_OPTIONS,
  TaxMode,
} from '@/lib/csn';
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

const DEFAULT_BOND_YIELD = 0.035; // 3.5% fallback
const SWEDISH_BLUE = '#006AA7';

function SummaryCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: 'green' | 'red' | 'neutral';
}) {
  const border =
    highlight === 'green'
      ? 'border-green-200 bg-green-50'
      : highlight === 'red'
      ? 'border-red-200 bg-red-50'
      : 'border-gray-200 bg-white';

  return (
    <div className={`rounded-xl border p-5 ${border}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-sm text-gray-500">{sub}</p>}
    </div>
  );
}

export default function CSNTool() {
  const now = new Date();
  const [months, setMonths] = useState(9);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(now.getMonth()); // 0-indexed
  const [intensity, setIntensity] = useState(1.0);
  const [bondYield, setBondYield] = useState(DEFAULT_BOND_YIELD);
  const [bondYieldInput, setBondYieldInput] = useState((DEFAULT_BOND_YIELD * 100).toFixed(2));
  const [yieldSource, setYieldSource] = useState<'api' | 'fallback' | 'user'>('fallback');
  const [taxMode, setTaxMode] = useState<TaxMode>('isk');
  const [schablonRate, setSchablonRate] = useState(0.015);
  const [customTaxRate, setCustomTaxRate] = useState(0.30);
  const [showDetail, setShowDetail] = useState(false);

  // Try to fetch Riksbank rate on mount
  useEffect(() => {
    fetch('/api/bond-rate')
      .then((r) => r.json())
      .then((data) => {
        if (data?.rate && typeof data.rate === 'number') {
          setBondYield(data.rate / 100);
          setBondYieldInput(data.rate.toFixed(2));
          setYieldSource(data.source ?? 'api');
        }
      })
      .catch(() => {/* keep fallback */});
  }, []);

  const startDate = useMemo(
    () => new Date(startYear, startMonth, 1),
    [startYear, startMonth]
  );

  const { disbursements, summary } = useMemo(
    () => calculateDisbursements(startDate, months, intensity, bondYield),
    [startDate, months, intensity, bondYield]
  );

  const chartData = useMemo(
    () => buildChartData(disbursements, summary.repaymentDate, bondYield),
    [disbursements, summary.repaymentDate, bondYield]
  );

  const repaymentMonthLabel = formatMonth(summary.repaymentDate);

  // Tax calculation on total
  const holdingYears =
    disbursements.length > 0
      ? (disbursements.reduce((s, d) => s + d.daysToRepayment, 0) /
          disbursements.length) /
        365
      : 0;

  const taxResult = useMemo(() => {
    return calculateTax(
      summary.totalBondValue,
      summary.totalLoan,
      holdingYears,
      taxMode,
      schablonRate,
      customTaxRate
    );
  }, [summary, holdingYears, taxMode, schablonRate, customTaxRate]);

  const netAfterTax = summary.totalBondValue - taxResult.taxPaid - summary.totalLoanAtRepayment;
  const canRepayAfterTax = netAfterTax >= 0;

  function handleYieldInput(val: string) {
    setBondYieldInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setBondYield(parsed / 100);
      setYieldSource('user');
    }
  }

  const monthOptions = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const yearOptions = Array.from({ length: 10 }, (_, i) => now.getFullYear() + i);

  return (
    <div className="space-y-10">
      {/* ── Inputs ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Your CSN setup</h2>

        {/* Duration slider */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-gray-700">
              Duration receiving CSN
            </label>
            <span className="text-2xl font-bold" style={{ color: SWEDISH_BLUE }}>
              {months} month{months !== 1 ? 's' : ''}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={48}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="mt-2 w-full accent-[#006AA7]"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 month</span>
            <span>48 months</span>
          </div>
        </div>

        {/* Start date */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start month</label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            >
              {monthOptions.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start year</label>
            <select
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Intensity */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">Study intensity</label>
          <div className="flex gap-2 flex-wrap">
            {INTENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setIntensity(opt.value)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  intensity === opt.value
                    ? 'border-[#006AA7] bg-[#006AA7] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#006AA7]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bond yield */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Bond yield assumption (% per annum)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.01"
              min="0"
              max="20"
              value={bondYieldInput}
              onChange={(e) => handleYieldInput(e.target.value)}
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            />
            <span className="text-xs text-gray-500">
              {yieldSource === 'api' && '↑ fetched from Riksbank'}
              {yieldSource === 'fallback' && '↑ default estimate — override freely'}
              {yieldSource === 'user' && '↑ custom value'}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            CSN loan rate: 2.135% · Riksbank reference rate used as proxy for SEK bond yield
          </p>
        </div>
      </section>

      {/* ── Repayment date callout ── */}
      <div className="rounded-xl border border-[#006AA7]/20 bg-[#006AA7]/5 px-5 py-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-[#006AA7]">Earliest repayment date: </span>
          {repaymentMonthLabel} — 6 months after your last CSN payment (
          {formatMonth(addMonths(startDate, months - 1))})
        </p>
      </div>

      {/* ── Summary cards ── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Pre-tax results</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            label="Total CSN grant"
            value={formatSEK(summary.totalGrant)}
            sub={`${months} payments`}
          />
          <SummaryCard
            label="Total loan at repayment"
            value={formatSEK(summary.totalLoanAtRepayment)}
            sub={`Principal ${formatSEK(summary.totalLoan)} + interest`}
          />
          <SummaryCard
            label="Projected bond portfolio"
            value={formatSEK(summary.totalBondValue)}
            sub={`At ${(bondYield * 100).toFixed(2)}% yield`}
          />
          <SummaryCard
            label={summary.canRepayImmediately ? 'Surplus (pre-tax)' : 'Shortfall (pre-tax)'}
            value={formatSEK(Math.abs(summary.netGainPreTax))}
            sub={summary.canRepayImmediately ? 'You can repay immediately' : 'Bonds fall short'}
            highlight={summary.canRepayImmediately ? 'green' : 'red'}
          />
        </div>
      </section>

      {/* ── Chart ── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Accumulation over time</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="bondGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006AA7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#006AA7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatSEK(Number(value)),
                  name === 'bondPortfolio' ? 'Bond portfolio' : 'Loan balance',
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === 'bondPortfolio' ? 'Bond portfolio' : 'Loan balance'
                }
              />
              <ReferenceLine
                x={repaymentMonthLabel}
                stroke="#6b7280"
                strokeDasharray="4 4"
                label={{ value: 'Repayment', position: 'top', fontSize: 11, fill: '#6b7280' }}
              />
              <Area
                type="monotone"
                dataKey="bondPortfolio"
                stroke={SWEDISH_BLUE}
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
        </div>
      </section>

      {/* ── Tax section ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Tax assumptions</h2>
        <p className="mb-5 text-sm text-gray-500">
          Swedish capital gains tax differs by account type. Choose the scenario that matches your setup.
        </p>

        {/* Mode tabs */}
        <div className="mb-6 flex rounded-lg border border-gray-200 p-1 w-fit gap-1">
          {([
            { key: 'isk', label: 'ISK' },
            { key: 'depot', label: 'Regular Depot' },
            { key: 'custom', label: 'Custom' },
          ] as { key: TaxMode; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTaxMode(key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                taxMode === key
                  ? 'bg-[#006AA7] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {taxMode === 'isk' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <strong>ISK (Investeringssparkonto):</strong> Schablonbeskattning — an annual flat tax
              on the portfolio value, not on realized gains. No tax when bonds mature.
            </p>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">Schablonränta (%/year)</label>
              <input
                type="number"
                step="0.01"
                value={(schablonRate * 100).toFixed(2)}
                onChange={(e) => setSchablonRate(parseFloat(e.target.value) / 100)}
                className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
              />
            </div>
          </div>
        )}

        {taxMode === 'depot' && (
          <p className="text-sm text-gray-700">
            <strong>Regular depot (Värdepapperskonto):</strong> Kapitalinkomstskatt — 30% tax on
            realized gains when bonds mature. Applied per disbursement on the profit above the
            invested loan principal.
          </p>
        )}

        {taxMode === 'custom' && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Effective tax rate on gains (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={(customTaxRate * 100).toFixed(1)}
              onChange={(e) => setCustomTaxRate(parseFloat(e.target.value) / 100)}
              className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006AA7]"
            />
          </div>
        )}

        {/* After-tax result */}
        <div className={`mt-6 rounded-xl border p-5 ${canRepayAfterTax ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Net result after tax
              </p>
              <p className={`mt-1 text-3xl font-bold ${canRepayAfterTax ? 'text-green-700' : 'text-red-700'}`}>
                {canRepayAfterTax ? '+' : ''}{formatSEK(netAfterTax)}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {canRepayAfterTax
                  ? 'You could repay the full loan immediately and keep this as profit — on top of your grant.'
                  : `Bond proceeds fall short by ${formatSEK(-netAfterTax)} after tax and interest.`}
              </p>
            </div>
            <div className={`text-3xl ${canRepayAfterTax ? 'text-green-600' : 'text-red-500'}`}>
              {canRepayAfterTax ? '✓' : '✗'}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-current/10 pt-3">
            <div>
              <p className="text-xs text-gray-500">Tax paid</p>
              <p className="font-semibold text-gray-800">{formatSEK(taxResult.taxPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Bond value</p>
              <p className="font-semibold text-gray-800">{formatSEK(summary.totalBondValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Loan + interest</p>
              <p className="font-semibold text-gray-800">{formatSEK(summary.totalLoanAtRepayment)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Detail table ── */}
      <section>
        <button
          onClick={() => setShowDetail((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-[#006AA7] hover:underline"
        >
          <span>{showDetail ? '▲' : '▼'}</span>
          {showDetail ? 'Hide' : 'Show'} disbursement breakdown
        </button>

        {showDetail && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-right">Grant</th>
                  <th className="px-4 py-3 text-right">Loan</th>
                  <th className="px-4 py-3 text-right">Days to repayment</th>
                  <th className="px-4 py-3 text-right">Bond value at repayment</th>
                  <th className="px-4 py-3 text-right">Loan owed at repayment</th>
                  <th className="px-4 py-3 text-right">Net (pre-tax)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disbursements.map((d) => {
                  const net = d.bondValue - d.loanAtRepayment;
                  return (
                    <tr key={d.monthIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{d.label}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatSEK(d.grant)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatSEK(d.loan)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{d.daysToRepayment}d</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatSEK(d.bondValue)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatSEK(d.loanAtRepayment)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {net >= 0 ? '+' : ''}{formatSEK(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                <tr>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">{formatSEK(summary.totalGrant)}</td>
                  <td className="px-4 py-3 text-right">{formatSEK(summary.totalLoan)}</td>
                  <td />
                  <td className="px-4 py-3 text-right">{formatSEK(summary.totalBondValue)}</td>
                  <td className="px-4 py-3 text-right">{formatSEK(summary.totalLoanAtRepayment)}</td>
                  <td className={`px-4 py-3 text-right ${summary.netGainPreTax >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {summary.netGainPreTax >= 0 ? '+' : ''}{formatSEK(summary.netGainPreTax)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* ── Disclaimer ── */}
      <p className="text-xs text-gray-400">
        CSN rates: SEK 4,120 grant + SEK 9,472 loan per 4 weeks (full-time, 2026). Loan interest
        2.135% p.a. Bond yield is a proxy — actual retail prices may differ. This tool is for
        informational purposes only and does not constitute financial advice.
      </p>
    </div>
  );
}
