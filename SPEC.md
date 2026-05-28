# CSN Arbitrage — Site Specification

> Last updated: 2026-05-28  
> Status: Pre-build specification — approved before any code is written.

---

## 1. Project Overview

A public personal website with two sections:

1. **CSN Arbitrage Tool** — the core feature. An interactive financial planning tool that models whether a Swedish master's student can invest the loan portion of their CSN payments in SEK-denominated bonds, let those bonds mature near the repayment date, and repay the loan immediately — effectively keeping the grant portion as a net gain.
2. **About** — a short personal page explaining who built the tool, why, and how to get in touch.

The site is public and written in English, with Swedish financial terms shown inline where relevant (e.g., "ISK (Investeringssparkonto)").

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ with TypeScript (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts (or similar lightweight React charting lib) |
| PDF export | `react-pdf` or `jsPDF` |
| CSV export | Native string generation, no library needed |
| Market data | Riksbank API (with user override) |
| Deployment | Vercel (free tier, auto-deploy from GitHub) |
| Domain | TBD — Vercel subdomain initially |

---

## 3. Site Structure

```
/               → CSN Arbitrage Tool (main feature, hero page)
/about          → About page
```

No navigation bar needed initially — a minimal header with the site name and a link to `/about` is sufficient.

---

## 4. Design System

**Style:** Clean and minimal, light mode only.  
**Palette:** White/off-white backgrounds, neutral greys for secondary text, one accent color for interactive elements and positive results (e.g., a muted blue or Swedish-flag blue `#006AA7`), a warning amber for flagged mismatches.  
**Typography:** A modern sans-serif (e.g., Inter). Large numbers for key financial outputs.  
**Layout:** Centered single-column on mobile; wider two-column (inputs left, results right) on desktop for the tool.

---

## 5. CSN Data & Assumptions (2026)

These values are hardcoded as constants and labeled clearly in the UI so users can see the source.

| Parameter | Value | Source |
|---|---|---|
| Grant per 4 weeks (full-time) | SEK 4,120 | CSN 2026 |
| Loan per 4 weeks (full-time) | SEK 9,472 | CSN 2026 |
| Total per 4 weeks | SEK 13,592 | — |
| Loan interest rate | 2.135% per annum | CSN 2026 |
| Repayment delay (first-time borrower) | ≥ 6 months after last payment | CSN rules |

**Monthly conversion:** CSN pays per 4-week period. The tool converts to a monthly model by treating each calendar month as one disbursement period (i.e., one payment of the 4-week amounts per month). A note in the UI clarifies this simplification.

**Part-time study:** CSN pays proportionally at four levels:
- Full-time: 100% of rates above
- 75% of full-time
- 50% of full-time
- 25% of full-time

---

## 6. Timeline Feature — Functional Specification

### 6.1 Quick Mode (default)

- A **slider** (range: 1–48 months) labeled "How many months will you receive CSN?"
- A **start date picker** (month + year, defaults to current month)
- A **study intensity selector** — one setting applied to the entire period: Full / 75% / 50% / 25%
- All results update live as the user drags

### 6.2 Advanced Mode

Toggle button: "Advanced mode" (expands a table below the slider).

The advanced table shows **one row per month** with columns:
- Month (label, e.g., "Sep 2026")
- Study intensity dropdown (Full / 75% / 50% / 25%)
- Grant amount (auto-calculated, read-only)
- Loan amount (auto-calculated, read-only)
- Bond matched (auto-filled from market data, editable)
- Maturity date (auto-filled, read-only unless overridden)
- Mismatch flag (warning icon if nearest bond maturity differs from target by more than N days — N = 14 days, configurable)

The advanced table overrides the quick-mode intensity setting.

### 6.3 Repayment Date Calculation

```
Last disbursement date = start date + (months - 1)
Earliest repayment date = last disbursement date + 6 months
```

The tool displays this date prominently and uses it as the **target maturity date** for bond matching.

---

## 7. Investment Matching Logic

### 7.1 Bond Matching

For each monthly disbursement:
1. Take the **loan amount** for that month (e.g., SEK 9,472 × intensity %)
2. Look up the available SEK-denominated instruments from the data source
3. Find the instrument whose **maturity date** is closest to the repayment date
4. If the nearest maturity differs from the target by more than 14 days, display a **yellow flag** with the message: "Closest bond matures [N days] [early/late] — adjust if needed"
5. Calculate projected value at maturity: `principal × (1 + annualYield) ^ (daysToMaturity / 365)`

### 7.2 Instrument Types (in priority order)

1. Swedish government bonds (Statsobligationer) — lowest risk, ideal
2. Swedish treasury bills (Statsskuldväxlar) — short-term, < 1 year
3. Swedish covered bonds (Säkerställda obligationer) — slightly higher yield
4. As a fallback label: "Use a Swedish money-market fund" — displayed when no bond matures within 30 days of the repayment date, with a note that the user should verify current rates

### 7.3 Total Value at Repayment

```
Total bond value = Σ (projected value of each disbursement's bond at repayment date)
Total loan owed = Σ (loan amount per month × (1 + 2.135%)^(months since disbursement))
Net gain (pre-tax) = Total bond value − Total loan owed
```

---

## 8. Market Data

### 8.1 Source

**Primary:** Riksbank API (`api.riksbank.se`) — provides reference rates and Swedish government bond yields.  
**Fallback:** If the API is unavailable or returns no data, display the last successfully fetched value with a timestamp and a warning banner: "Market data may be outdated — last updated [date]."

### 8.2 User Override

A clearly labeled input field (e.g., "Bond yield assumption (% per annum)") is pre-filled with the fetched rate. The user can type any value to override it. All calculations update live.

### 8.3 Refresh Cadence

Data is fetched on page load (server-side in Next.js via `fetch` with `revalidate: 3600` — once per hour). No websocket/real-time streaming needed.

---

## 9. Tax Modeling

The tax section sits below the main results, under a heading "Tax assumptions". It has three modes selectable via a segmented control / tab switch:

### Mode A — ISK (Investeringssparkonto)

Swedish flat-rate account tax (schablonbeskattning):
- Annual tax = portfolio value × schablonränta (currently ~1.5% of value)
- The schablonränta is user-editable (pre-filled with the current statutory rate)
- Tax is applied yearly across the holding period
- No tax on realized gains at exit

### Mode B — Regular Depot (AF-konto / Värdepapperskonto)

Swedish capital gains tax (kapitalinkomstskatt):
- Tax = 30% × (sale proceeds − purchase price)
- Applied at the point of selling (i.e., when bonds mature)
- Net gain after tax = (bond value − principal invested) × (1 − 0.30)

### Mode C — Custom

- User types an **effective tax rate** (0–100%)
- Applied as: `after-tax gain = pre-tax gain × (1 − effective rate)`
- A note reads: "Enter your expected effective tax rate on investment gains."

The summary cards always show values for the currently selected tax mode. If mode B or C is active, a small secondary line shows the ISK comparison.

---

## 10. Results Presentation

### 10.1 Summary Cards (always visible)

Four cards at the top of the results section:

| Card | Content |
|---|---|
| Total CSN received | Grant total + Loan total (SEK) |
| Total loan at repayment | Loan principal + accrued interest at 2.135% |
| Projected bond portfolio | Total value of all bonds at repayment date |
| Net gain after tax | Portfolio value − loan owed − tax, with a verdict label: "You can repay immediately" (green) or "Shortfall of SEK X" (red) |

### 10.2 Chart

A combined chart below the cards:
- X-axis: months (from first disbursement to repayment date + 12 months)
- Line 1: cumulative loan balance (principal + interest)
- Line 2: cumulative bond portfolio value
- Vertical dashed line: repayment date
- The area between the two lines on the repayment date is shaded green (surplus) or red (shortfall)

### 10.3 Detail Table (expandable)

A collapsible section labeled "Breakdown by disbursement":
- One row per month
- Columns: Month | Intensity | Grant | Loan | Bond matched | Bond yield | Maturity date | Projected value | Mismatch flag

---

## 11. Export

Two buttons in the results section:

- **Export CSV** — downloads a flat file with all rows from the detail table plus the summary card values in a header section
- **Export PDF** — downloads a formatted single-page summary: site name, generation date, input parameters, summary cards, and the detail table (no chart in PDF for simplicity in v1)

---

## 12. About Page (`/about`)

Content:

1. **Short bio** — Marco Manzotti, Social Scientifi Data Analisys, Lund university
2. **Why this tool exists** — 2–3 sentences: "I was trying to decide whether to take the CSN loan. I couldn't find a tool that modeled the arbitrage cleanly, so I built one."
3. **Links** — GitHub https://github.com/marcomanzotti, [LinkedIn](https://www.linkedin.com/in/marco-manzotti/), email marcomanzotti18@gmail.com (placeholders for now) 
4. **Disclaimer** — "This tool is for informational purposes only and does not constitute financial advice. Tax rules and CSN rates may change — always verify with official sources."

---

## 13. Key Assumptions & Simplifications

- Disbursements are modeled as monthly (not strictly every 4 weeks) — labeled in UI
- Bonds are assumed to be purchased at face value with no transaction costs
- No currency risk modeled (everything is SEK)
- Riksbank API yields are used as a proxy; actual retail bond prices may differ slightly
- The 6-month repayment delay is the **minimum**; actual CSN repayment schedules may be longer — user can adjust the repayment date manually in advanced mode
- Inflation is not modeled in v1

---

## 14. Open Questions / Future Scope

- **Custom repayment date override** — allow user to drag the repayment marker on the chart
- **Multiple scenarios** — save and compare two side-by-side (e.g., "9 months vs 12 months")
- **URL-encoded state** — shareable links encoding all parameters
- **Riksbank API availability** — if the API proves too limited, Avanza public data or a curated static JSON of current bond rates may be used as a fallback
- **Part-time CSN income effect** — modeling how reduced loan means less to invest, and whether the strategy still works at 50%
- **i18n** — Swedish translation if the site gets Swedish-speaking traffic

---

## 15. Non-Goals (v1)

- No user accounts or authentication
- No database or persistent storage of scenarios
- No real-time price feed (hourly revalidation is sufficient)
- No mobile-specific native app
- No blog or notes section (can add later)
- No dark mode
