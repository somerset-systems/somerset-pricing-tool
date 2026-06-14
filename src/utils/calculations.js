// ════════════════════════════════════════════════════════════════════════
//  PHASE 1 PRICING CONFIG — EDIT EVERYTHING HERE
//  This is the single source of truth for Somerset's Phase 1 price. Every
//  downstream figure on the output page (payback window, Phase 3 monthly
//  maintenance, Year 1 / Year 2 net impact) is derived from these values.
//  Nothing downstream is hardcoded — change a number here and the whole
//  assessment recalculates.
//
//  The price is set by TWO layers, both fully transparent:
//    LAYER 1 — REVENUE BAND (ability to pay): the revenue tier sets the
//              floor → ceiling range for a company that size.
//    LAYER 2 — SCOPE (effort): the capabilities selected for the Phase 1
//              build each carry an EFFORT WEIGHT. The sum of those weights
//              positions the quoted range inside the revenue band — light
//              scope sits near the floor, heavy scope near the ceiling.
//
//  To move the whole anchor up or down, edit PHASE1_REVENUE_BANDS.
//  To recalibrate how complex a build is, edit EFFORT_WEIGHTS.
//  To change how aggressively scope moves the price, edit PHASE1_POSITIONING.
// ════════════════════════════════════════════════════════════════════════

// LAYER 1 — Revenue band. Sets the floor→ceiling for a company this size.
// "Foot in the door but not cheap": core tier sits just under a $10K anchor.
export const PHASE1_REVENUE_BANDS = {
  '<2m':   { floor: 4000, ceiling: 6000  },
  '2-5m':  { floor: 5500, ceiling: 7500  },
  '5-10m': { floor: 7000, ceiling: 9500  },
  '10m+':  { floor: 8500, ceiling: 12000 },
}

// LAYER 2 — Effort weight per capability. light = 1, medium = 2, heavy = 3.
// Keyed by the capability TITLE exactly as it appears in src/data/niches.js.
// These are build-complexity estimates — edit freely as real build times land.
// Any capability not listed here falls back to DEFAULT_EFFORT_WEIGHT.
export const EFFORT_WEIGHTS = {
  // ── Light (1) — one templated report pulled from a single system, low judgment.
  'Weekly Report Automation':             1,
  // ── Medium (2) — read-only analytics/dashboards, scheduled digests,
  //    single-purpose outbound automations, or external monitoring. No money
  //    written back, no optimization model.
  'AI Owner Briefings':                   2,
  'Maintenance Renewal Tracker':          2,
  'Estimate Conversion Tracking':         2,
  'Research Center':                      2,
  'Technician Profitability Dashboard':   2,
  'Job Type Margin Analysis':             2,
  'Automated Follow-Up Workflows':        2,
  'Missed Call Recovery':                 2,
  'Callback and Warranty Tracking':       2,
  'Cross-System Reporting':               2,
  'Lead Source Attribution':              2,
  'Job Status Tracker':                   2,  // live read-only aggregation across systems; no write-back or optimization
  'Client Intake Automation':             2,
  'Caseload Intelligence Dashboard':      2,
  'Deadline and Compliance Tracker':      2,
  'Billing Realization Tracker':          2,
  'Client Follow-Up Automation':          2,
  // ── Heavy (3) — touches money/tax, writes back into a system of record,
  //    runs an optimization/forecast model, or is a general-purpose AI
  //    assistant over a unified live-data model.
  'Automated Invoicing':                  3,  // tax handling + payment/accounting write-back + reconciliation
  'Automated Invoicing and Billing':      3,  // legal billing: time-entry compilation, trust/realization, tax
  'Proposal and Work Order Automation':   3,
  'Scheduling and Dispatch Optimization': 3,
  '30/60/90 Capacity Forecast':           3,
  'AI Operations Assistant':              3,  // reliable natural-language layer over live ops data
}
export const DEFAULT_EFFORT_WEIGHT = 2

// How scope (summed effort) positions the quote inside the revenue band.
export const PHASE1_POSITIONING = {
  EFFORT_FLOOR:   1,    // effort sum at/below this sits at the band FLOOR (a single light build)
  EFFORT_CEILING: 6,    // effort sum at/above this sits at the band CEILING (two heavy builds)
  WINDOW_FRACTION: 0.6, // the range shown to the prospect spans 60% of the band, and slides within it
  MAX_PILOT_CAPS: 2,    // beyond this many capabilities, flag the scope as Phase-2-sized
}

// Phase 3 monthly maintenance = this fraction of the Phase 1 midpoint.
export const MAINTENANCE_RATE = 0.10
// ════════════════════════════════════════════════════════════════════════

const REVENUE_TIER_LABELS = {
  '<2m': 'under $2M', '2-5m': '$2–5M', '5-10m': '$5–10M', '10m+': '$10M+',
}

// Effort weight for a capability title, falling back to the default.
export function getEffortWeight(title) {
  return EFFORT_WEIGHTS[title] != null ? EFFORT_WEIGHTS[title] : DEFAULT_EFFORT_WEIGHT
}

function roundToNearest250(n) {
  return Math.round(n / 250) * 250
}

export const BASE_PRICE = {
  '<2m':   { floor: 8000,  ceiling: 12000 },
  '2-5m':  { floor: 10000, ceiling: 15000 },
  '5-10m': { floor: 15000, ceiling: 22000 },
  '10m+':  { floor: 22000, ceiling: 35000 },
}

const REVENUE_MIDPOINTS = {
  '<2m':   1000000,
  '2-5m':  3500000,
  '5-10m': 7500000,
  '10m+':  15000000,
}

const FREQUENCY_HOURS = { Occasionally: 1, Regularly: 3, Constantly: 6 }

export const LABOR_RATES = {
  admin:      { floor: 25, ceiling: 35 },
  operations: { floor: 35, ceiling: 60 },
  owner:      { floor: 75, ceiling: 150 },
}

const DECISION_QUALITY_BENEFITS = [
  'Clearer margin visibility across job types and crews',
  'Better hiring and capacity decisions based on real utilization data',
  'Reduced reporting confusion between systems',
  'Owner time freed from operational questions your team can now answer themselves',
]

export function deriveTaskHours(task) {
  const freqHours = FREQUENCY_HOURS[task.frequency] || 3
  const people = parseInt(task.people, 10) || 2
  return people * freqHours
}

export function roundToNearest500(n) {
  return Math.round(n / 500) * 500
}

function roundToNearest5k(n) {
  return Math.round(n / 5000) * 5000
}

export function formatCurrency(value) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export function formatImpactRange(value) {
  if (value <= 0) return 'Below breakeven'
  const lo = roundToNearest5k(value * 0.7)
  const hi = roundToNearest5k(value * 1.2)
  const fmt = (n) => n >= 1000 ? `$${Math.round(n / 1000)}k` : formatCurrency(n)
  return `~${fmt(lo)} – ${fmt(hi)}`
}

// Base price lookup — no modifiers applied
export function calculatePricing({ revenueRange }) {
  const base = BASE_PRICE[revenueRange]
  if (!base) return null
  const { floor, ceiling } = base
  const midpoint = (floor + ceiling) / 2
  const monthlyMaintenance = roundToNearest500(midpoint * MAINTENANCE_RATE)
  return { floor, ceiling, midpoint, monthlyMaintenance }
}

// Phase 1 maintenance = MAINTENANCE_RATE × Phase 1 midpoint, rounded to nearest $50.
export function calculatePhase1Maintenance(phase1) {
  const midpoint = (phase1.floor + phase1.ceiling) / 2
  return Math.round(midpoint * MAINTENANCE_RATE / 50) * 50
}

// Two-layer Phase 1 pricing.
//   Layer 1: revenueRange selects the band [bandFloor, bandCeiling].
//   Layer 2: selectedCapabilities → summed effort → position inside the band.
// Returns the QUOTED range { floor, ceiling } (what the prospect sees) plus the
// internal midpoint (drives payback / net / maintenance) and a full trace.
//
//   effortSum = Σ effort weights of the selected capabilities
//   position  = clamp((effortSum − EFFORT_FLOOR) / (EFFORT_CEILING − EFFORT_FLOOR), 0, 1)
//   window    = WINDOW_FRACTION × bandWidth          (width of the shown range)
//   slideRoom = bandWidth − window                   (how far the window can travel)
//   quoteFloor   = bandFloor + position × slideRoom  (rounded to $250)
//   quoteCeiling = quoteFloor + window               (rounded to $250)
//   midpoint     = (quoteFloor + quoteCeiling) / 2   (reproducible from the shown range)
//
// With no scope selected yet, the full band is shown and midpoint = band midpoint.
export function calculatePhase1Range({ revenueRange, selectedCapabilities = [] }) {
  const band = PHASE1_REVENUE_BANDS[revenueRange] || PHASE1_REVENUE_BANDS['<2m']
  const bandFloor = band.floor
  const bandCeiling = band.ceiling
  const bandWidth = bandCeiling - bandFloor
  const { EFFORT_FLOOR, EFFORT_CEILING, WINDOW_FRACTION, MAX_PILOT_CAPS } = PHASE1_POSITIONING

  const scope = (selectedCapabilities || []).map((title) => ({ title, weight: getEffortWeight(title) }))
  const effortSum = scope.reduce((s, c) => s + c.weight, 0)
  const selectedCount = scope.length
  const tierLabel = REVENUE_TIER_LABELS[revenueRange] || revenueRange

  const windowWidth = WINDOW_FRACTION * bandWidth
  const slideRoom = bandWidth - windowWidth

  // No scope picked yet → show the full band; midpoint = band midpoint.
  if (selectedCount === 0) {
    const floor = bandFloor
    const ceiling = bandCeiling
    return {
      floor, ceiling, midpoint: (floor + ceiling) / 2, tierKey: revenueRange,
      bandFloor, bandCeiling, effortSum: 0, position: 0, selectedCount: 0, scope,
      windowWidth, exceedsPilot: false, noScopeSelected: true,
      positioningTrace: `No Phase 1 capabilities selected yet — showing the full revenue band for a company ${tierLabel} (${formatCurrency(bandFloor)} – ${formatCurrency(bandCeiling)}). Select one or two capabilities below to position the estimate by scope.`,
    }
  }

  const position = Math.max(0, Math.min(1, (effortSum - EFFORT_FLOOR) / (EFFORT_CEILING - EFFORT_FLOOR)))
  const quoteFloorRaw = bandFloor + position * slideRoom
  const floor = roundToNearest250(quoteFloorRaw)
  const ceiling = roundToNearest250(quoteFloorRaw + windowWidth)
  const midpoint = (floor + ceiling) / 2
  const exceedsPilot = selectedCount > MAX_PILOT_CAPS || effortSum > EFFORT_CEILING

  const scopeStr = scope.map((c) => `${c.title} [${c.weight}]`).join(' + ')
  const positioningTrace =
    `Revenue band for a company ${tierLabel}: ${formatCurrency(bandFloor)} – ${formatCurrency(bandCeiling)}. ` +
    `Selected scope effort = ${effortSum} (${scopeStr}). ` +
    `Position = (${effortSum} − ${EFFORT_FLOOR}) ÷ (${EFFORT_CEILING} − ${EFFORT_FLOOR}) = ${Math.round(position * 100)}% of the band. ` +
    `Quoted Phase 1 range: ${formatCurrency(floor)} – ${formatCurrency(ceiling)} (internal midpoint ${formatCurrency(midpoint)}).`

  return {
    floor, ceiling, midpoint, tierKey: revenueRange,
    bandFloor, bandCeiling, effortSum, position, selectedCount, scope,
    windowWidth, exceedsPilot, noScopeSelected: false, positioningTrace,
  }
}

// Dynamic cap: 25 hrs/week for ≤10 employees; +2 hrs per employee above 10.
export function calculateHrCap(employees) {
  const n = parseInt(employees, 10) || 10
  return n <= 10 ? 25 : 25 + ((n - 10) * 2)
}

// Blended (midpoint) hourly labor rate for a task's category.
function blendedRate(laborCategory) {
  const r = LABOR_RATES[laborCategory] || LABOR_RATES.operations
  return (r.floor + r.ceiling) / 2
}

// Annual labor-dollar value a single task represents, before any cap scaling.
// Basis for impact tiers so the badge always matches the dollar ranking.
// hrs = (staff × per-person hrs) × efficiency factor; value = hrs × 52 × blended rate.
export function taskAnnualValue(task) {
  const ef = task.efficiencyFactor != null ? task.efficiencyFactor : 0.65
  const effectiveHours = deriveTaskHours(task) * ef
  return effectiveHours * 52 * blendedRate(task.laborCategory)
}

// Impact tiers DERIVED FROM each task's annual dollar value, graded relative
// to the largest opportunity in the set. The highest-dollar task is always
// High, so the "Where Your Team Is Losing Time" page and the dollar
// opportunity on the next page tell the same story. Returns { [taskId]: tier }.
const IMPACT_HIGH_THRESHOLD = 0.6   // ≥60% of the top opportunity → High
const IMPACT_MEDIUM_THRESHOLD = 0.3 // ≥30% of the top opportunity → Medium

export function deriveImpactTiers(tasks) {
  const values = tasks.map((t) => ({ id: t.id, value: taskAnnualValue(t) }))
  const max = values.reduce((m, v) => Math.max(m, v.value), 0)
  const byId = {}
  values.forEach(({ id, value }) => {
    const ratio = max > 0 ? value / max : 0
    byId[id] = ratio >= IMPACT_HIGH_THRESHOLD ? 'High'
             : ratio >= IMPACT_MEDIUM_THRESHOLD ? 'Medium'
             : 'Low'
  })
  return byId
}

const TENURE_NOTE = 'Adjusted for company tenure: established businesses typically carry a large base of lapsed maintenance clients representing meaningful re-engagement opportunity.'

// Three-bucket ROI calculation.
// tasks: combined array of built-in (all) + custom tasks (all with included:true)
// employees: raw value from company state (string or number)
// yearsInBusiness: optional string from company state
export function calculateROI({ tasks, monthlyMaintenance, phase1, employees, yearsInBusiness }) {
  const includedTasks = tasks.filter((t) => t.included)
  if (includedTasks.length === 0) return { roiAvailable: false }

  // Impact tiers derived from dollar value across ALL included tasks, so the
  // friction-areas page and the opportunity page rank items identically.
  const taskImpactById = deriveImpactTiers(includedTasks)

  // ── Dynamic cap ──────────────────────────────────────────────────────────
  const numEmployees = parseInt(employees, 10) || 10
  const hrCap = calculateHrCap(numEmployees)
  const capFormula = numEmployees <= 10
    ? `25 hrs/week (base cap for teams of 10 or fewer)`
    : `25 + ((${numEmployees} - 10) × 2) = ${hrCap} hrs/week`

  // ── Bucket 1: Operational Capacity ──────────────────────────────────────
  const operationalTasks = includedTasks.filter((t) => t.valueBucket === 'operational')

  // Compute raw and effective hours per task before cap check
  const rawOpHoursTotal = operationalTasks.reduce((s, t) => s + deriveTaskHours(t), 0)
  const effectiveOpHoursTotal = operationalTasks.reduce((s, t) => {
    const ef = t.efficiencyFactor != null ? t.efficiencyFactor : 0.65
    return s + deriveTaskHours(t) * ef
  }, 0)

  // Cap is applied to effective hours, not raw hours
  const isCapped = effectiveOpHoursTotal > hrCap
  const scaleFactor = isCapped ? hrCap / effectiveOpHoursTotal : 1

  const operationalTaskDetails = operationalTasks.map((t) => {
    const rawHours = deriveTaskHours(t)
    const ef = t.efficiencyFactor != null ? t.efficiencyFactor : 0.65
    const effectiveHours = rawHours * ef
    const scaledHours = effectiveHours * scaleFactor
    const rates = LABOR_RATES[t.laborCategory] || LABOR_RATES.operations
    const freqHoursPerPerson = FREQUENCY_HOURS[t.frequency] || 3
    return {
      id: t.id,
      label: t.label || '(unnamed)',
      people: parseInt(t.people, 10) || 2,
      frequency: t.frequency,
      freqHoursPerPerson,
      rawHours,
      efficiencyFactor: ef,
      effectiveHours,
      scaledHours,
      laborCategory: t.laborCategory || 'operations',
      floorRate: rates.floor,
      ceilingRate: rates.ceiling,
      annualFloor: Math.round(scaledHours * 52 * rates.floor),
      annualCeiling: Math.round(scaledHours * 52 * rates.ceiling),
    }
  })

  const rawOperationalFloor   = operationalTaskDetails.reduce((s, t) => s + t.annualFloor, 0)
  const rawOperationalCeiling = operationalTaskDetails.reduce((s, t) => s + t.annualCeiling, 0)
  const operationalFloor   = Math.round(rawOperationalFloor   / 1000) * 1000
  const operationalCeiling = Math.round(rawOperationalCeiling / 1000) * 1000
  const operationalMidpoint = (operationalFloor + operationalCeiling) / 2
  // Round the weekly value to whole dollars so the payback math below is
  // EXACTLY reproducible from the figure shown on the page.
  const weeklyOperationalValue = Math.round(operationalMidpoint / 52)

  // ── Bucket 2: Revenue Recovery ───────────────────────────────────────────
  const revRecoveryTasks = includedTasks.filter((t) => t.valueBucket === 'revenue_recovery')
  const rrCount = revRecoveryTasks.length
  const rrHours = revRecoveryTasks.reduce((s, t) => s + deriveTaskHours(t), 0)

  let revenueRecoverySignal = null
  let revenueRecoveryNote = ''
  if (rrCount > 0) {
    if (rrCount >= 2 || rrHours > 8) {
      revenueRecoverySignal = 'high'
      revenueRecoveryNote = 'Consistent follow-up automation at this volume commonly drives 5–10% improvement in close rates and renewal retention. Material revenue impact.'
    } else if (rrHours >= 3) {
      revenueRecoverySignal = 'medium'
      revenueRecoveryNote = 'Automating follow-up on stale estimates and lapsed clients typically recovers 2–4 additional jobs or contracts per month for operations this size.'
    } else {
      revenueRecoverySignal = 'low'
      revenueRecoveryNote = 'Even one additional closed job or renewed maintenance contract per month could meaningfully offset your Phase 1 investment.'
    }
  }

  // Apply yearsInBusiness upgrade rules to revenueRecoverySignal
  if (yearsInBusiness === '30+') {
    if (revenueRecoverySignal === null) {
      revenueRecoverySignal = 'low'
      revenueRecoveryNote = TENURE_NOTE
    } else if (revenueRecoverySignal === 'low') {
      revenueRecoverySignal = 'medium'
      revenueRecoveryNote = revenueRecoveryNote ? revenueRecoveryNote + ' ' + TENURE_NOTE : TENURE_NOTE
    }
  } else if (yearsInBusiness === '16-30') {
    if (revenueRecoverySignal === 'low') {
      revenueRecoverySignal = 'medium'
      revenueRecoveryNote = revenueRecoveryNote ? revenueRecoveryNote + ' ' + TENURE_NOTE : TENURE_NOTE
    }
  }

  const revRecoveryTaskDetails = revRecoveryTasks.map((t) => ({
    id: t.id,
    label: t.label || '(unnamed)',
    people: parseInt(t.people, 10) || 2,
    frequency: t.frequency,
    derivedHours: deriveTaskHours(t),
  }))

  // ── Bucket 3: Decision Quality ───────────────────────────────────────────
  const showDecisionQuality = operationalTasks.length >= 2

  // ── Phase 1 & Payback ────────────────────────────────────────────────────
  const phase1Midpoint = (phase1.floor + phase1.ceiling) / 2
  // Payback divides by the SAME rounded weekly value shown on the page.
  const paybackFloorWeeks   = weeklyOperationalValue > 0 ? Math.round(phase1.floor   / weeklyOperationalValue) : null
  const paybackCeilingWeeks = weeklyOperationalValue > 0 ? Math.round(phase1.ceiling / weeklyOperationalValue) : null

  // ── Year 1 / Year 2 ──────────────────────────────────────────────────────
  const year1NetFloor   = operationalFloor   - phase1Midpoint - (monthlyMaintenance * 12)
  const year1NetCeiling = operationalCeiling - phase1Midpoint - (monthlyMaintenance * 12)
  const year2NetFloor   = operationalFloor   - (monthlyMaintenance * 12)
  const year2NetCeiling = operationalCeiling - (monthlyMaintenance * 12)

  // Honest maintenance trace: show the exact 10% figure AND the $50 rounding
  // so the displayed monthly fee is reproducible.
  const maintExact = Math.round(phase1Midpoint * MAINTENANCE_RATE)
  const ratePct = Math.round(MAINTENANCE_RATE * 100)
  const phase1MaintenanceTrace = maintExact === monthlyMaintenance
    ? `Phase 1 midpoint ($${Math.round(phase1Midpoint).toLocaleString()}) × ${ratePct}% = $${monthlyMaintenance.toLocaleString()}/month`
    : `Phase 1 midpoint ($${Math.round(phase1Midpoint).toLocaleString()}) × ${ratePct}% = $${maintExact.toLocaleString()}, rounded to $${monthlyMaintenance.toLocaleString()}/month`

  const calculationTrace = {
    operationalTasks: operationalTaskDetails,
    taskImpactById,
    rawOperationalHours: rawOpHoursTotal,
    effectiveOperationalHours: effectiveOpHoursTotal,
    totalScaledHours: Math.min(effectiveOpHoursTotal, hrCap),
    isCapped,
    hrCap,
    numEmployees,
    capFormula,
    revRecoveryTasks: revRecoveryTaskDetails,
    rrCount,
    rrHours,
    operationalFloor,
    operationalCeiling,
    operationalMidpoint,
    weeklyOperationalValue,
    phase1Floor: phase1.floor,
    phase1Ceiling: phase1.ceiling,
    phase1Midpoint,
    phase1TierKey: phase1.tierKey || '(unknown)',
    phase1TierSource: 'Revenue band + scope positioning',
    phase1BandFloor: phase1.bandFloor,
    phase1BandCeiling: phase1.bandCeiling,
    phase1EffortSum: phase1.effortSum,
    phase1Position: phase1.position,
    phase1SelectedCount: phase1.selectedCount,
    phase1Scope: phase1.scope || [],
    phase1ExceedsPilot: !!phase1.exceedsPilot,
    phase1NoScopeSelected: !!phase1.noScopeSelected,
    phase1PositioningTrace: phase1.positioningTrace || '',
    monthlyMaintenance,
    phase1MaintenanceTrace,
    paybackFloorWeeks,
    paybackCeilingWeeks,
    year1NetFloor,
    year1NetCeiling,
    year2NetFloor,
    year2NetCeiling,
  }

  return {
    roiAvailable: true,
    taskImpactById,
    isCapped,
    cappingNote: isCapped
      ? `Hours scaled to ${hrCap} hrs/week, a conservative ceiling based on your team size of ${numEmployees} employees. This reflects realistic automation coverage: a new system doesn't instantly capture 100% of available time savings. Formula: ${capFormula}.`
      : null,
    operationalAvailable: operationalTasks.length > 0,
    operationalFloor,
    operationalCeiling,
    operationalMidpoint,
    weeklyOperationalValue,
    revenueRecoverySignal,
    revenueRecoveryNote,
    showDecisionQuality,
    decisionQualityBenefits: DECISION_QUALITY_BENEFITS,
    paybackFloorWeeks,
    paybackCeilingWeeks,
    year1NetFloor,
    year1NetCeiling,
    year2NetFloor,
    year2NetCeiling,
    calculationTrace,
  }
}
