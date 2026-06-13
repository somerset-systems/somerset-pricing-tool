export const BASE_PRICE = {
  '<2m':   { floor: 8000,  ceiling: 12000 },
  '2-5m':  { floor: 10000, ceiling: 15000 },
  '5-10m': { floor: 15000, ceiling: 22000 },
  '10m+':  { floor: 22000, ceiling: 35000 },
}

// Fixed Phase 1 tiers — not percentage-based
const PHASE1_TIERS = {
  '<2m':   { floor: 2500, ceiling: 4000  },
  '2-5m':  { floor: 3500, ceiling: 6000  },
  '5-10m': { floor: 5000, ceiling: 8500  },
  '10m+':  { floor: 7500, ceiling: 12000 },
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
  const monthlyMaintenance = roundToNearest500(midpoint * 0.10)
  return { floor, ceiling, midpoint, monthlyMaintenance }
}

// Phase 1 maintenance = 10% of Phase 1 midpoint, rounded to nearest $50.
export function calculatePhase1Maintenance(phase1) {
  const midpoint = (phase1.floor + phase1.ceiling) / 2
  return Math.round(midpoint * 0.10 / 50) * 50
}

// Fixed Phase 1 tiers. Minimum spread of $1,500 enforced.
export function calculatePhase1Range({ revenueRange }) {
  const tier = PHASE1_TIERS[revenueRange]
  if (!tier) return { floor: 2500, ceiling: 4000, tierKey: revenueRange }
  let { floor, ceiling } = tier
  if (ceiling - floor < 1500) ceiling = floor + 1500
  return { floor, ceiling, tierKey: revenueRange }
}

// Dynamic cap: 25 hrs/week for ≤10 employees; +2 hrs per employee above 10.
export function calculateHrCap(employees) {
  const n = parseInt(employees, 10) || 10
  return n <= 10 ? 25 : 25 + ((n - 10) * 2)
}

const TENURE_NOTE = 'Adjusted for company tenure: established businesses typically carry a large base of lapsed maintenance clients representing meaningful re-engagement opportunity.'

// Three-bucket ROI calculation.
// tasks: combined array of built-in (all) + custom tasks (all with included:true)
// employees: raw value from company state (string or number)
// yearsInBusiness: optional string from company state
export function calculateROI({ tasks, monthlyMaintenance, phase1, employees, yearsInBusiness }) {
  const includedTasks = tasks.filter((t) => t.included)
  if (includedTasks.length === 0) return { roiAvailable: false }

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
  const weeklyOperationalValue = operationalMidpoint / 52

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
  const paybackFloorWeeks   = operationalMidpoint > 0 ? Math.round(phase1.floor   / weeklyOperationalValue) : null
  const paybackCeilingWeeks = operationalMidpoint > 0 ? Math.round(phase1.ceiling / weeklyOperationalValue) : null

  // ── Year 1 / Year 2 ──────────────────────────────────────────────────────
  const year1NetFloor   = operationalFloor   - phase1Midpoint - (monthlyMaintenance * 12)
  const year1NetCeiling = operationalCeiling - phase1Midpoint - (monthlyMaintenance * 12)
  const year2NetFloor   = operationalFloor   - (monthlyMaintenance * 12)
  const year2NetCeiling = operationalCeiling - (monthlyMaintenance * 12)

  const calculationTrace = {
    operationalTasks: operationalTaskDetails,
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
    phase1TierSource: 'Fixed tier table',
    monthlyMaintenance,
    phase1MaintenanceTrace: `Phase 1 midpoint ($${Math.round(phase1Midpoint).toLocaleString()}) × 10% = $${monthlyMaintenance.toLocaleString()}/month`,
    paybackFloorWeeks,
    paybackCeilingWeeks,
    year1NetFloor,
    year1NetCeiling,
    year2NetFloor,
    year2NetCeiling,
  }

  return {
    roiAvailable: true,
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
