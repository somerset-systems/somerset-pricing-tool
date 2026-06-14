# LOGIC.md — Pricing & ROI Calculation Specification

This document is the authoritative reference for every number the tool produces.
If CLAUDE.md and this file conflict, this file wins for math-related decisions.

---

## Philosophy

Somerset prices based on the client's capacity to pay (revenue range). No circumstance modifiers are applied. The ROI output uses three buckets: operational capacity (quantified), revenue recovery (qualitative signal), and decision quality (strategic). Every number shown must be traceable to a dropdown.

---

## Revenue Range → Base Price

```js
const BASE_PRICE = {
  '<2m':   { floor: 8000,  ceiling: 12000 },
  '2-5m':  { floor: 10000, ceiling: 15000 },
  '5-10m': { floor: 15000, ceiling: 22000 },
  '10m+':  { floor: 22000, ceiling: 35000 },
}
```

No circumstance modifiers. Used as-is for maintenance fee calculation.

---

## Maintenance Fee (Full Engagement — for reference only)

```js
const midpoint = (floor + ceiling) / 2
const monthlyMaintenance = Math.round(midpoint * 0.10 / 500) * 500
```

This is derived from the full engagement base price and is kept internally. It is NOT used for Phase 3 display or ROI calculations.

## Phase 1 Maintenance Fee (calculatePhase1Maintenance — used in all calculations)

```js
function calculatePhase1Maintenance(phase1) {
  const midpoint = (phase1.floor + phase1.ceiling) / 2
  return Math.round(midpoint * 0.10 / 50) * 50
}
```

This is the value passed to `calculateROI` as `monthlyMaintenance` and displayed in Phase 3 card. Rounded to nearest $50. The `phase1.floor`/`phase1.ceiling` here are the **quoted** range (after scope positioning, see below), so maintenance tracks the scoped midpoint, not a fixed tier value.

Trace string stored in `calculationTrace.phase1MaintenanceTrace`:
`"Phase 1 midpoint ($X) × 10% = $Y/month"`

---

## Task Fields

Each task object has:
- `laborCategory`: `'admin'` | `'operations'` | `'owner'` (owner reserved for future use)
- `valueBucket`: `'operational'` | `'revenue_recovery'`
- `efficiencyFactor`: number 0–1, representing the fraction of time on this task that automation can realistically capture

These come from niches.js for built-in tasks. Custom tasks default to `operations` / `operational` / `0.65`.

---

## People × Frequency → Derived Hours → Effective Hours

`people` is stored as a plain integer (min 1, default 2). No string mapping needed.

```js
const FREQUENCY_HOURS = { Occasionally: 1, Regularly: 3, Constantly: 6 }

function deriveTaskHours(task) {
  return parseInt(task.people, 10) * FREQUENCY_HOURS[task.frequency]
  // rawHours: total time the team currently spends on this task per week
}

// effectiveHours: the portion automation can realistically capture
const effectiveHours = deriveTaskHours(task) * task.efficiencyFactor
```

| Frequency    | Hours/week per person |
|--------------|-----------------------|
| Occasionally | 1                     |
| Regularly    | 3                     |
| Constantly   | 6                     |

Default: 2 staff × Regularly = 6 hrs/week raw per task.

**Efficiency factor labels** (shown inline in OutputPanel dropdown and PrintSummary):
- 0.80: "80% automatable — minimal human judgment required"
- 0.75: "75% automatable — light review still needed"
- 0.70: "70% automatable — some coordination remains manual"
- 0.65: "65% automatable — human oversight is part of the workflow"
- 0.55: "55% automatable — significant judgment calls remain"

Section B (Where Your Team Is Losing Time) shows raw derived hours (the actual time spent), not effective hours. The efficiency-adjusted values are only used in the Operational Capacity calculation in Section C.

---

## Labor Rate Ranges

```js
const LABOR_RATES = {
  admin:      { floor: 25, ceiling: 35 },   // $25–$35/hr
  operations: { floor: 35, ceiling: 60 },   // $35–$60/hr
  owner:      { floor: 75, ceiling: 150 },  // reserved for future use
}
```

These are conservative fully-loaded hourly cost estimates, not billing rates.

---

## Phase 1 Pricing (calculatePhase1Range) — TWO-LAYER MODEL

Phase 1 price is set by two transparent, fully config-driven layers:

- **Layer 1 — Revenue band (ability to pay):** the revenue tier selects a fixed `[floor, ceiling]` band.
- **Layer 2 — Scope (effort):** the capabilities selected for the Phase 1 build each carry an effort weight (light/medium/heavy). The summed effort positions the quoted range *inside* the band — light scope sits near the floor, heavy scope near the ceiling.

Signature: `calculatePhase1Range({ revenueRange, selectedCapabilities = [] })`. `selectedCapabilities` is an array of capability titles (from `src/data/niches.js`). Returns the **quoted** range plus the internal midpoint and a trace.

### Layer 1 — Revenue band

```js
const PHASE1_REVENUE_BANDS = {
  '<2m':   { floor: 4000, ceiling: 6000  },
  '2-5m':  { floor: 5500, ceiling: 7500  },
  '5-10m': { floor: 7000, ceiling: 9500  },
  '10m+':  { floor: 8500, ceiling: 12000 },
}
```

| Revenue Range | Band Floor | Band Ceiling | Width |
|---------------|------------|--------------|-------|
| < $2M         | $4,000     | $6,000       | $2,000 |
| $2–5M         | $5,500     | $7,500       | $2,000 |
| $5–10M        | $7,000     | $9,500       | $2,500 |
| $10M+         | $8,500     | $12,000      | $3,500 |

### Layer 2 — Effort weights (build complexity)

Keyed by capability title. `light = 1`, `medium = 2`, `heavy = 3`. Anything not listed → `DEFAULT_EFFORT_WEIGHT` (2). All editable in `calculations.js`.

Rubric: **heavy** = touches money/tax, writes back into a system of record, runs an optimization/forecast model, or is a general-purpose AI assistant over live data; **medium** = read-only analytics/dashboards, scheduled digests, single-purpose automations, or external monitoring; **light** = one templated report pulled from a single system.

- **Light (1):** Weekly Report Automation
- **Medium (2):** AI Owner Briefings · Maintenance Renewal Tracker · Estimate Conversion Tracking · Research Center · Job Status Tracker · (+ default 2 for: Technician Profitability Dashboard, Job Type Margin Analysis, Automated Follow-Up Workflows, Missed Call Recovery, Callback and Warranty Tracking, Cross-System Reporting, Lead Source Attribution, Client Intake Automation, Caseload Intelligence Dashboard, Deadline and Compliance Tracker, Billing Realization Tracker, Client Follow-Up Automation)
- **Heavy (3):** Automated Invoicing · Automated Invoicing and Billing · Proposal and Work Order Automation · Scheduling and Dispatch Optimization · 30/60/90 Capacity Forecast · AI Operations Assistant

### Positioning formula

```js
const PHASE1_POSITIONING = {
  EFFORT_FLOOR: 1,      // effort ≤ 1 → band floor (a single light build)
  EFFORT_CEILING: 6,    // effort ≥ 6 → band ceiling (two heavy builds)
  WINDOW_FRACTION: 0.6, // shown range spans 60% of the band, and slides within it
  MAX_PILOT_CAPS: 2,    // beyond this many capabilities → exceedsPilot flag
}

effortSum    = Σ getEffortWeight(title) for each selected capability
position     = clamp((effortSum − EFFORT_FLOOR) / (EFFORT_CEILING − EFFORT_FLOOR), 0, 1)
bandWidth    = bandCeiling − bandFloor
windowWidth  = WINDOW_FRACTION × bandWidth
slideRoom    = bandWidth − windowWidth
floor   = roundToNearest250(bandFloor + position × slideRoom)   // quoted floor (shown)
ceiling = roundToNearest250(bandFloor + position × slideRoom + windowWidth) // quoted ceiling (shown)
midpoint = (floor + ceiling) / 2   // internal — drives payback / net / maintenance
exceedsPilot = selectedCount > MAX_PILOT_CAPS || effortSum > EFFORT_CEILING
```

**No scope selected:** `floor = bandFloor`, `ceiling = bandCeiling`, `midpoint = band midpoint`, `noScopeSelected = true`. The full band is shown until the salesperson picks capabilities.

Returns `{ floor, ceiling, midpoint, tierKey, bandFloor, bandCeiling, effortSum, position, selectedCount, scope: [{title, weight}], windowWidth, exceedsPilot, noScopeSelected, positioningTrace }`.

### Worked examples — $5–10M company (band $7,000–$9,500; window = 0.6 × 2,500 = $1,500; slideRoom = $1,000)

| Selected scope | Effort | Position | Quoted range (shown) | Internal midpoint | Maintenance |
|----------------|--------|----------|----------------------|-------------------|-------------|
| Weekly Report Automation only | 1 | (1−1)/5 = 0% | **$7,000 – $8,500** | $7,750 | $800/mo |
| Proposal & Work Order Automation + Scheduling and Dispatch Optimization | 3+3 = 6 | (6−1)/5 = 100% | **$8,000 – $9,500** | $8,750 | $900/mo |

Every figure traces: band from `PHASE1_REVENUE_BANDS`, weights from `EFFORT_WEIGHTS`, position from the printed formula. Revenue dominates the range; scope tunes the position inside it.

---

## Three-Bucket ROI (calculateROI)

Function signature: `calculateROI({ tasks, monthlyMaintenance, phase1, employees })`

`tasks` = combined array of built-in + custom tasks (all, not pre-filtered — the function filters by `included`).
`employees` = raw value from `company.employees` in App.jsx state (parsed to integer inside the function).

### Dynamic Cap (calculateHrCap)

```js
function calculateHrCap(employees) {
  const n = parseInt(employees, 10) || 10
  return n <= 10 ? 25 : 25 + ((n - 10) * 2)
}
```

| Employees | Cap (hrs/week) | Formula                     |
|-----------|---------------|------------------------------|
| ≤ 10      | 25            | base cap                     |
| 20        | 45            | 25 + ((20 − 10) × 2)        |
| 50        | 105           | 25 + ((50 − 10) × 2)        |
| 100       | 205           | 25 + ((100 − 10) × 2)       |

### Bucket 1 — Operational Capacity Unlocked

Full chain: raw hours → efficiency-adjusted hours → cap scaling → annual range.

```js
const numEmployees = parseInt(employees, 10) || 10
const hrCap = calculateHrCap(numEmployees)

const operationalTasks = tasks.filter(t => t.included && t.valueBucket === 'operational')

// Per task: raw hours and efficiency-adjusted effective hours
const rawHours      = deriveTaskHours(t)                          // people × freqHours
const ef            = t.efficiencyFactor ?? 0.65                  // fraction automation can capture
const effectiveHours = rawHours * ef                              // hours available for automation

// Cap is applied to the sum of effective hours, not raw hours
const effectiveOpHoursTotal = sum(effectiveHours for all operationalTasks)
const isCapped = effectiveOpHoursTotal > hrCap
const scaleFactor = isCapped ? hrCap / effectiveOpHoursTotal : 1

// Per task
const scaledHours   = effectiveHours * scaleFactor
const annualFloor   = scaledHours * 52 * LABOR_RATES[t.laborCategory].floor
const annualCeiling = scaledHours * 52 * LABOR_RATES[t.laborCategory].ceiling

// Totals
const operationalFloor   = Math.round(sum(annualFloor)   / 1000) * 1000
const operationalCeiling = Math.round(sum(annualCeiling) / 1000) * 1000
const operationalMidpoint = (operationalFloor + operationalCeiling) / 2
const weeklyOperationalValue = operationalMidpoint / 52
```

Example — 20-employee company, 3 tasks with effective hours totaling 60 hrs/week:
- cap = 25 + ((20 − 10) × 2) = 45 hrs/week
- isCapped = true; scaleFactor = 45 ÷ 60 = 0.75
- All effective hours scaled by 0.75 before annual value calculation

`calculationTrace` per task stores: `rawHours`, `efficiencyFactor`, `effectiveHours`, `scaledHours`, `annualFloor`, `annualCeiling`.
`calculationTrace` global stores: `rawOperationalHours` (sum of raw), `effectiveOperationalHours` (sum of effective), `totalScaledHours` (min(effective, cap)).

### Bucket 2 — Revenue Recovery Opportunity (qualitative signal)

```js
const revRecoveryTasks = tasks.filter(t => t.included && t.valueBucket === 'revenue_recovery')
const rrCount = revRecoveryTasks.length
const rrHours = sum(deriveTaskHours for each)

// Signal thresholds (evaluated in order):
// 0 tasks → null
// rrCount >= 2 OR rrHours > 8 → 'high'
// rrHours >= 3 → 'medium'
// otherwise → 'low'
```

Signal notes:
- **Low**: "Even one additional closed job or renewed maintenance contract per month could meaningfully offset your Phase 1 investment."
- **Medium**: "Automating follow-up on stale estimates and lapsed clients typically recovers 2–4 additional jobs or contracts per month for operations this size."
- **High**: "Consistent follow-up automation at this volume commonly drives 5–10% improvement in close rates and renewal retention — material revenue impact."

No dollar amount is assigned to revenue recovery. It is not included in financial projections.

### Bucket 3 — Decision Quality (qualitative, no dollar)

Show when `operationalTasks.length >= 2`. Fixed list:
- "Clearer margin visibility across job types and crews"
- "Better hiring and capacity decisions based on real utilization data"
- "Reduced reporting confusion between systems"
- "Owner time freed from operational questions your team can now answer themselves"

### Payback and Year 1/2

```js
const phase1Midpoint = (phase1.floor + phase1.ceiling) / 2
// weeklyOperationalValue = operationalMidpoint / 52  (shown as always-visible inline formula in UI)
const paybackFloorWeeks   = Math.round(phase1.floor   / weeklyOperationalValue)
const paybackCeilingWeeks = Math.round(phase1.ceiling / weeklyOperationalValue)

// monthlyMaintenance here = calculatePhase1Maintenance(phase1), NOT the full-engagement value
const year1NetFloor   = operationalFloor   - phase1Midpoint - (monthlyMaintenance * 12)
const year1NetCeiling = operationalCeiling - phase1Midpoint - (monthlyMaintenance * 12)
const year2NetFloor   = operationalFloor   - (monthlyMaintenance * 12)
const year2NetCeiling = operationalCeiling - (monthlyMaintenance * 12)
```

Show Year 1 if `year1NetCeiling > 0`. Show Year 2 if `year2NetCeiling > 0`.

---

## calculationTrace Object

Returned alongside all ROI values. Contains every input, rate, and derived value so dropdowns can display the full trace without recomputing:

```js
calculationTrace: {
  operationalTasks: [{ id, label, people, frequency, freqHoursPerPerson, rawHours, efficiencyFactor, effectiveHours, scaledHours, laborCategory, floorRate, ceilingRate, annualFloor, annualCeiling }],
  rawOperationalHours,         // sum of raw (people × freq) before efficiency
  effectiveOperationalHours,   // sum of effectiveHours (raw × efficiencyFactor) — what cap compares against
  totalScaledHours,            // min(effectiveOperationalHours, hrCap)
  isCapped,                    // boolean
  hrCap,                       // dynamic cap value (25 or 25 + ((n-10)*2))
  numEmployees,                // parsed employee count used for cap calculation
  capFormula,                  // human-readable formula string
  revRecoveryTasks: [{ id, label, people, frequency, derivedHours }],
  rrCount,
  rrHours,
  operationalFloor,
  operationalCeiling,
  operationalMidpoint,
  weeklyOperationalValue,
  phase1Floor,                 // quoted floor (after scope positioning)
  phase1Ceiling,               // quoted ceiling (after scope positioning)
  phase1Midpoint,
  phase1TierKey,               // revenueRange key used to select the Phase 1 band
  phase1TierSource,            // 'Revenue band + scope positioning'
  phase1BandFloor,             // Layer-1 band floor before positioning
  phase1BandCeiling,           // Layer-1 band ceiling before positioning
  phase1EffortSum,             // Σ effort weights of selected capabilities
  phase1Position,              // 0–1 position within the band
  phase1SelectedCount,         // number of capabilities selected for Phase 1
  phase1Scope,                 // [{ title, weight }]
  phase1ExceedsPilot,          // true if scope is broader than a 1–2 capability pilot
  phase1NoScopeSelected,       // true if no capabilities selected yet (full band shown)
  phase1PositioningTrace,      // human-readable band + effort + position derivation
  monthlyMaintenance,          // = calculatePhase1Maintenance(phase1) — Phase 1-based
  phase1MaintenanceTrace,      // human-readable: "Phase 1 midpoint ($X) × 10% = $Y/month"
  paybackFloorWeeks,
  paybackCeilingWeeks,
  year1NetFloor,
  year1NetCeiling,
  year2NetFloor,
  year2NetCeiling,
}
```

### Nested Task Calculation Dropdowns

Each task row in the Operational Capacity table (inside the SubsectionBlock dropdown) has a ▼/▲ toggle. When expanded, it shows:

1. **Raw hours + efficiency step:** `X staff × Y hrs/wk (Frequency) = Z hrs/wk raw → × [efficiencyFactor] efficiency factor = [effectiveHours] hrs/wk available for automation`
   - Plus the plain-English efficiency label (e.g. "65% automatable — human oversight is part of the workflow")
2. **Cap scaling** (only when `isCapped`): `Total effective hours: [effectiveTotal] hrs/wk exceeded [hrCap]hr cap. Scale factor: [hrCap] ÷ [effectiveTotal] = [ratio]. Scaled hours for this task: [effective] × [ratio] = [scaled] hrs/wk.`
3. **Annual floor:** `scaledHrs × $floorRate/hr × 52 weeks = $annualFloor`
4. **Annual ceiling:** `scaledHrs × $ceilingRate/hr × 52 weeks = $annualCeiling`

Below the table, when `isCapped`, a highlighted note box shows the full cap explanation: "Hours scaled to [hrCap] hrs/week — conservative ceiling based on your team size of [numEmployees] employees..." with the `capFormula` inline.

Only one task's nested breakdown can be open at a time (tracked via `openTaskCalc` state in OutputPanel.jsx).

---

## Output Dropdown Trace Format

### Payback dropdown
```
Phase 1 floor ($X) ÷ weekly operational value ($Y/wk) = Z weeks
Phase 1 ceiling ($X) ÷ weekly operational value ($Y/wk) = Z weeks
```

### Year 1 dropdown
```
Annual impact floor ($X) − Phase 1 midpoint ($Y) − ($M × 12 mo) = $Z
Annual impact ceiling ($X) − Phase 1 midpoint ($Y) − ($M × 12 mo) = $Z
```

### Year 2 dropdown
```
Annual impact floor ($X) − ($M × 12 mo) = $Z
Annual impact ceiling ($X) − ($M × 12 mo) = $Z
```

---

## Satisfaction Guarantee Copy

"All Phase 1 engagements include a 30-day performance guarantee. If the solution doesn't perform as scoped within 30 days of delivery, we'll fix it at no additional cost — or refund your final payment. No questions asked."

---

## Assumptions Paragraph (always shown in Section C)

"Estimates reflect potential value, not guaranteed outcomes. Actual results depend on software access, team adoption, workflow design, and current operational baseline. Revenue recovery impact is assessed qualitatively and not included in financial projections. Efficiency factors reflect the realistic share of each task that automation can capture. Not all time spent on a task is recoverable — human review, judgment calls, and edge cases remain part of every workflow."

---

## Task Mappings (laborCategory / valueBucket / efficiencyFactor)

### HVAC / Electrical
| Task                                       | laborCategory | valueBucket       | efficiencyFactor |
|--------------------------------------------|---------------|-------------------|-----------------|
| Writing proposals and work orders by hand  | admin         | operational       | 0.65            |
| Scheduling and dispatching technicians     | operations    | operational       | 0.55            |
| Generating invoices after job completion   | admin         | operational       | 0.80            |
| Following up with past clients             | admin         | revenue_recovery  | 0.70            |
| Tracking job status across multiple crews  | operations    | operational       | 0.60            |
| Compiling weekly/monthly reports           | operations    | operational       | 0.75            |

### Legal
| Task                                       | laborCategory | valueBucket       | efficiencyFactor |
|--------------------------------------------|---------------|-------------------|-----------------|
| Drafting client intake documents           | admin         | operational       | 0.65            |
| Writing case status summaries              | operations    | operational       | 0.70            |
| Tracking court filing deadlines            | operations    | operational       | 0.75            |
| Generating billing summaries and invoices  | admin         | operational       | 0.80            |
| Following up with clients on document reqs | admin         | revenue_recovery  | 0.70            |
| Compiling weekly caseload reports          | operations    | operational       | 0.75            |

### Generic (Other)
| Task                                       | laborCategory | valueBucket       | efficiencyFactor |
|--------------------------------------------|---------------|-------------------|-----------------|
| Writing and sending proposals              | admin         | operational       | 0.65            |
| Generating invoices                        | admin         | operational       | 0.80            |
| Scheduling and coordination                | operations    | operational       | 0.55            |
| Client follow-up and outreach              | admin         | revenue_recovery  | 0.70            |
| Internal reporting                         | operations    | operational       | 0.75            |
| Document filing and tracking               | admin         | operational       | 0.70            |

Custom tasks default to `operations` / `operational` / `0.65`, but `laborCategory` is mutable via an inline select in the UI (Admin / Operations / Owner). This affects the labor rate applied in all calculations.

---

## Section D.5 — Capability Cards (What We Can Build For You)

Capability cards are defined in `src/data/niches.js` as `CAPABILITIES`. They are niche-filtered: `hvac` and `electrical` use the same list; `legal` uses its own list; `other` falls back to the HVAC/Electrical list.

Each has: `title`, `description` (one sentence), and `tag` (one of: Operational Efficiency / Revenue Intelligence / Financial Clarity).

**Cards are selectable (Phase 1 scope picker).** Each card has a checkbox. The set of checked titles is held in `App.jsx` state (`selectedCapabilities`, persisted to localStorage) and passed to `calculatePhase1Range` as `selectedCapabilities`. Checking/unchecking recomputes the entire output live (output is a `useMemo` derived from inputs). Selected cards show an "In Phase 1" marker and a green accent; cards still also show the "Recommended" marker driven by Constantly-marked tasks. A summary strip above the cards lists the current Phase 1 scope and the quoted range. The effort weight of each capability lives in `EFFORT_WEIGHTS` (`calculations.js`), not on the card object.

Note shown below the card list: "We build on top of your existing software. All capabilities connect directly to the tools you already use. Your Phase 1 pilot addresses one or two of these. A full engagement can include any combination."

### HVAC / Electrical (18 capabilities, in display order)

| # | Title | Tag |
|---|-------|-----|
| 1 | Proposal and Work Order Automation | Operational Efficiency |
| 2 | Scheduling and Dispatch Optimization | Operational Efficiency |
| 3 | Automated Invoicing | Operational Efficiency |
| 4 | Job Status Tracker | Operational Efficiency |
| 5 | AI Owner Briefings | Operational Efficiency |
| 6 | Technician Profitability Dashboard | Revenue Intelligence |
| 7 | Job Type Margin Analysis | Revenue Intelligence |
| 8 | Estimate Conversion Tracking | Revenue Intelligence |
| 9 | Maintenance Renewal Tracker | Revenue Intelligence |
| 10 | Automated Follow-Up Workflows | Revenue Intelligence |
| 11 | Missed Call Recovery | Revenue Intelligence |
| 12 | Callback and Warranty Tracking | Revenue Intelligence |
| 13 | 30/60/90 Capacity Forecast | Operational Efficiency |
| 14 | Cross-System Reporting | Financial Clarity |
| 15 | Lead Source Attribution | Financial Clarity |
| 16 | AI Operations Assistant | Operational Efficiency |
| 17 | Weekly Report Automation | Operational Efficiency |
| 18 | Research Center | Revenue Intelligence |

### Legal (11 capabilities, in display order)

| # | Title | Tag |
|---|-------|-----|
| 1 | Client Intake Automation | Operational Efficiency |
| 2 | Caseload Intelligence Dashboard | Operational Efficiency |
| 3 | Deadline and Compliance Tracker | Operational Efficiency |
| 4 | AI Owner Briefings | Operational Efficiency |
| 5 | Automated Invoicing and Billing | Operational Efficiency |
| 6 | Weekly Report Automation | Operational Efficiency |
| 7 | Billing Realization Tracker | Financial Clarity |
| 8 | Client Follow-Up Automation | Revenue Intelligence |
| 9 | Cross-System Reporting | Financial Clarity |
| 10 | AI Operations Assistant | Operational Efficiency |
| 11 | Research Center | Revenue Intelligence |

---

## What the Tool Does NOT Do

- It does not call any AI API. All outputs are deterministic math.
- It does not store anything. State resets on page reload.
- It does not apply circumstance modifiers — that step was removed.
- It does not assign a dollar amount to revenue recovery — that is qualitative only.
- It does not expose pricing floor/ceiling or negotiation data to the client.
