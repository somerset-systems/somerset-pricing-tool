import { useState, Fragment } from 'react'
import { formatCurrency, deriveTaskHours, LABOR_RATES, PHASE1_POSITIONING } from '../utils/calculations.js'
import { CAPABILITIES, INDUSTRY_INTELLIGENCE } from '../data/niches.js'

const REVENUE_LABELS = {
  '<2m': 'Under $2M', '2-5m': '$2M–$5M', '5-10m': '$5M–$10M', '10m+': '$10M+',
}

const IMPACT_STYLE = {
  High:   { background: 'var(--brand-green)', color: '#fff' },
  Medium: { background: 'var(--text-heading)', color: '#fff' },
  Low:    { background: 'var(--badge-low)', color: '#fff' },
}

const SIGNAL_STYLE = {
  low:    { background: 'var(--badge-low)', color: '#fff' },
  medium: { background: 'var(--text-heading)', color: '#fff' },
  high:   { background: 'var(--brand-green)', color: '#fff' },
}

const EFFICIENCY_LABELS = {
  0.80: '80% automatable. Minimal human judgment required.',
  0.75: '75% automatable. Light review still needed.',
  0.70: '70% automatable. Some coordination remains manual.',
  0.65: '65% automatable. Human oversight is part of the workflow.',
  0.55: '55% automatable. Significant judgment calls remain.',
}

const TASK_TO_CAPS = {
  scheduling: ['Scheduling and Dispatch Optimization'],
  followup:   ['Automated Follow-Up Workflows', 'Maintenance Renewal Tracker'],
  proposals:  ['Proposal and Work Order Automation'],
  invoices:   ['Automated Invoicing'],
  jobstatus:  ['Job Status Tracker'],
  reports:    ['Weekly Report Automation', 'AI Owner Briefings'],
}

const TAG_ORDER = ['Operational Efficiency', 'Revenue Intelligence', 'Financial Clarity']

// Plain-English build size per effort weight — keeps the internal effort
// integers off the client-facing screen.
const EFFORT_WORD = { 1: 'light', 2: 'medium', 3: 'heavy' }
function buildWeightPhrase(effort) {
  if (!effort) return ''
  return effort <= 2 ? 'light build' : effort <= 4 ? 'moderate build' : 'substantial build'
}

function efficiencyLabel(ef) {
  return EFFICIENCY_LABELS[ef] || `${Math.round(ef * 100)}% automatable`
}

const fmtK = (n) => {
  const abs = Math.abs(Math.round(n / 1000))
  return n < 0 ? `-$${abs}k` : `$${abs}k`
}
const fmtRange = (lo, hi) => {
  if (hi <= 0) return 'Below breakeven'
  return lo < 0 ? `below breakeven – ${fmtK(hi)}` : `${fmtK(lo)} – ${fmtK(hi)}`
}

function ChevronIcon({ isOpen, size = 16 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16" fill="none"
      style={{
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.15s',
        flexShrink: 0,
        color: 'var(--text-muted)',
      }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SectionDivider({ large }) {
  return <div style={{ height: 1, background: 'var(--border)', margin: large ? '0 0 44px 0' : '0 0 24px 0' }} />
}

function SectionCard({ children, style, id }) {
  return (
    <div
      id={id}
      className="rounded-lg mb-0"
      style={{
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border)',
        borderTop: '3px solid var(--brand-green)',
        padding: 32,
        scrollMarginTop: 60,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

const NAV_SECTIONS = [
  { id: 'sec-snapshot', label: 'Snapshot' },
  { id: 'sec-opportunity', label: 'Opportunity' },
  { id: 'sec-investment', label: 'Your Pilot' },
]

function SectionNav({ onJump }) {
  return (
    <div
      className="no-print"
      style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--bg-page)', borderBottom: '1px solid var(--border)',
        display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center',
        padding: '8px 0', marginBottom: 24,
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Jump to</span>
      {NAV_SECTIONS.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => onJump(n.id)}
          className="navlink"
          style={{
            background: 'transparent', border: '1px solid transparent', color: 'var(--brand-green)',
            font: '500 12px DM Sans', cursor: 'pointer', padding: '9px 12px', minHeight: 40,
            display: 'inline-flex', alignItems: 'center', borderRadius: 5,
          }}
        >
          {n.label}
        </button>
      ))}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: 'var(--text-heading)', margin: '0 0 20px' }}>
      {children}
    </h2>
  )
}

function ImpactBadge({ level }) {
  return (
    <span className="flex-shrink-0" style={{ ...IMPACT_STYLE[level], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
      {level}
    </span>
  )
}

function ImpactGroup({ label, tasks, accentColor }) {
  if (tasks.length === 0) return null
  return (
    <div className="mb-4">
      <div className="text-xs font-medium mb-2" style={{ color: accentColor }}>{label} Impact</div>
      {tasks.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-2 text-sm" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <ImpactBadge level={t.impact} />
            <span style={{ color: 'var(--text-body)' }}>{t.label || '(unnamed task)'}</span>
          </div>
          <span className="font-medium" style={{ color: 'var(--text-secondary)', flexShrink: 0, marginLeft: 8 }}>
            {deriveTaskHours(t)} hrs/wk total
          </span>
        </div>
      ))}
    </div>
  )
}

function SubsectionBlock({ sectionLabel, headline, isOpen, onToggle, children, accent }) {
  return (
    <div className="mb-4 rounded-md" style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
      <h3 style={{ margin: 0, font: 'inherit' }}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          style={{
            width: '100%',
            background: accent ? 'var(--bg-active)' : 'var(--bg-raised)',
            cursor: 'pointer',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            border: 'none',
            textAlign: 'left',
            font: 'inherit',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {sectionLabel && (
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                {sectionLabel}
              </div>
            )}
            <div style={{ fontSize: 20, fontFamily: "'DM Serif Display', serif", fontWeight: 400, color: 'var(--text-heading)', lineHeight: 1.25 }}>
              {headline}
            </div>
          </div>
          <ChevronIcon isOpen={isOpen} size={14} />
        </button>
      </h3>
      {isOpen && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 16 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function TraceRow({ label, value, isOpen, onToggle, children, bg }) {
  const inner = (
    <>
      <div className="flex-1 min-w-0">
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
        <div className="font-medium text-sm mt-0.5" style={{ color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
          {value}
        </div>
      </div>
      {children && <ChevronIcon isOpen={isOpen} />}
    </>
  )

  return (
    <div className="rounded mb-2" style={{ background: bg ?? 'var(--bg-raised)', padding: '10px 14px' }}>
      {children ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
            font: 'inherit',
          }}
        >
          {inner}
        </button>
      ) : (
        <div className="flex items-start justify-between gap-3">
          {inner}
        </div>
      )}
      {isOpen && children && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// One line of a calculation trace: plain-language label on the left, the
// resulting figure in mono on the right, and the raw formula as opt-in fine
// print below. Replaces run-on monospace sentences so the proof reads as an
// explanation a consultant would give, not a spreadsheet log line.
function TraceLine({ label, detail, result }) {
  return (
    <div style={{ padding: '5px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <span style={{ fontSize: 13, color: 'var(--text-body)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{result}</span>
      </div>
      {detail && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2, lineHeight: 1.6 }}>
          {detail}
        </div>
      )}
    </div>
  )
}

export default function OutputPanel({ output, company, niche, nicheLabel, tasks, selectedCapabilities = [], onToggleCapability, onBack, onPrint }) {
  const [open, setOpen] = useState({})
  const [openTaskCalc, setOpenTaskCalc] = useState(null)
  const [showAllCaps, setShowAllCaps] = useState({})
  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  function scrollToId(id) {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  if (!output) return null

  const { roi, phase1 } = output
  const tr = roi.roiAvailable ? roi.calculationTrace : null

  // Impact tiers are DERIVED FROM each task's annual dollar value (computed in
  // calculations.js) so this page ranks items the same way the opportunity
  // section does. Fall back to the task's seed impact only if no ROI is available.
  const impactOf = (t) => (tr && tr.taskImpactById && tr.taskImpactById[t.id]) || t.impact
  const checkedTasks = tasks.filter((t) => t.included).map((t) => ({ ...t, impact: impactOf(t) }))
  const highTasks    = checkedTasks.filter((t) => t.impact === 'High')
  const mediumTasks  = checkedTasks.filter((t) => t.impact === 'Medium')
  const lowTasks     = checkedTasks.filter((t) => t.impact === 'Low')

  const phase1Label = `${formatCurrency(phase1.floor)} – ${formatCurrency(phase1.ceiling)}`
  const capabilities = CAPABILITIES[niche] || CAPABILITIES.other
  const intel = INDUSTRY_INTELLIGENCE[niche] || INDUSTRY_INTELLIGENCE.other
  const selectedCapSet = new Set(selectedCapabilities)

  // A focused pilot is the first MAX_PILOT capabilities the salesperson checked
  // (selection order). Anything beyond that is honestly flagged as Phase 2 scope
  // at the point of selection — not buried in a note the user has to scroll up to.
  const MAX_PILOT = PHASE1_POSITIONING.MAX_PILOT_CAPS
  const pilotCaps = selectedCapabilities.slice(0, MAX_PILOT)
  const overflowCaps = selectedCapabilities.slice(MAX_PILOT)
  const pilotSet = new Set(pilotCaps)
  const isOverScoped = overflowCaps.length > 0
  const pilotEffort = (phase1.scope || []).filter((c) => pilotSet.has(c.title)).reduce((s, c) => s + c.weight, 0)
  const buildPhrase = buildWeightPhrase(pilotEffort)

  const highlightedCaps = new Set()
  tasks.forEach((t) => {
    if (t.frequency !== 'Constantly') return
    if (String(t.id).startsWith('custom-')) {
      highlightedCaps.add('AI Operations Assistant')
    } else if (TASK_TO_CAPS[t.id]) {
      TASK_TO_CAPS[t.id].forEach((cap) => highlightedCaps.add(cap))
    }
  })

  const laborCategoryLabel = { admin: 'Admin', operations: 'Operations', owner: 'Owner' }
  const laborRateLabel = (cat) => {
    const r = LABOR_RATES[cat] || LABOR_RATES.operations
    return `$${r.floor}–$${r.ceiling}/hr`
  }

  const capsByTag = {}
  TAG_ORDER.forEach(tag => {
    const filtered = capabilities.filter(c => c.tag === tag)
    if (filtered.length > 0) capsByTag[tag] = filtered
  })

  // Capability picker default view: when the prospect's "Constantly" tasks surface
  // recommendations, lead with those and collapse the rest of each category so the
  // decision point isn't a wall of checkboxes. With nothing recommended to lead
  // with, the first category stays open so options are visible at a glance.
  const hasAnyHighlight = highlightedCaps.size > 0
  const firstCapTag = TAG_ORDER.find(t => capsByTag[t])

  // One gesture to reveal every calculation in Section C, so the salesperson can
  // open all the math at once when a prospect asks to see it, instead of clicking
  // through six separate disclosures live on the call.
  const sectionCKeys = []
  if (roi.operationalAvailable) sectionCKeys.push('operational')
  if (roi.revenueRecoverySignal) sectionCKeys.push('revenueRecovery')
  if (intel) sectionCKeys.push('intel')
  if (roi.operationalAvailable && tr && tr.paybackFloorWeeks !== null) sectionCKeys.push('payback')
  if (roi.operationalAvailable && tr && tr.year1NetCeiling > 0) sectionCKeys.push('year1')
  if (roi.operationalAvailable && tr && tr.year2NetCeiling > 0) sectionCKeys.push('year2')
  const allCalcsOpen = sectionCKeys.length > 0 && sectionCKeys.every((k) => open[k])
  function toggleAllCalcs() {
    const target = !allCalcsOpen
    setOpen((prev) => {
      const next = { ...prev }
      sectionCKeys.forEach((k) => { next[k] = target })
      return next
    })
  }

  return (
    <div>

      {/* Presentation banner */}
      <div
        className="rounded-lg mb-6"
        style={{ background: 'var(--brand-green)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
            Operational Opportunity Assessment
          </h1>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.80)', marginTop: 4 }}>
            Prepared by Somerset Systems
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.90)', textAlign: 'right' }}>
          {nicheLabel}
        </div>
      </div>

      {/* Sticky in-page nav for live presentation */}
      <SectionNav onJump={scrollToId} />

      {/* Section A — Company Snapshot (document header) */}
      <div
        id="sec-snapshot"
        className="rounded-lg mb-0"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '20px 28px', scrollMarginTop: 60 }}
      >
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: 'var(--text-heading)', margin: '0 0 12px' }}>
          Company Snapshot
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-3">
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Industry</span>
            <div style={{ fontWeight: 500, color: 'var(--text-heading)', fontSize: 14, marginTop: 2 }}>{nicheLabel}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Annual Revenue</span>
            <div style={{ fontWeight: 500, color: 'var(--text-heading)', fontSize: 14, marginTop: 2 }}>{REVENUE_LABELS[company.revenueRange] || '—'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Team Size</span>
            <div style={{ fontWeight: 500, color: 'var(--text-heading)', fontSize: 14, marginTop: 2 }}>{company.employees ? `${company.employees} employees` : '—'}</div>
          </div>
        </div>
        <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: 10, margin: 0 }}>
          Based on what you've shared, here's where Somerset Systems sees the most meaningful opportunity.
        </p>
      </div>

      <SectionDivider />

      {/* Section B — Where Your Team Is Losing Time */}
      <SectionCard style={{ borderTop: '1px solid var(--border)' }}>
        <SectionTitle>Where Your Team Is Losing Time</SectionTitle>
        {checkedTasks.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No friction areas selected. Go back to Step 3 to check tasks.</p>
        ) : (
          <>
            <p className="mb-4" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Hours shown are <strong>total across all staff</strong> on each task (staff count × hours per person), not per person.
              Impact is graded by the annual dollar value each area represents, so the ranking here matches the opportunity figures below.
            </p>
            <ImpactGroup label="High"   tasks={highTasks}   accentColor="var(--brand-green)" />
            <ImpactGroup label="Medium" tasks={mediumTasks} accentColor="var(--text-heading)" />
            <ImpactGroup label="Low"    tasks={lowTasks}    accentColor="var(--text-muted)" />
          </>
        )}
      </SectionCard>

      <SectionDivider />

      {/* Section C — Where We See Opportunity */}
      <SectionCard id="sec-opportunity">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <SectionTitle>Where We See Opportunity</SectionTitle>
          {roi.roiAvailable && sectionCKeys.length > 1 && (
            <button
              type="button"
              onClick={toggleAllCalcs}
              aria-expanded={allCalcsOpen}
              className="no-print navlink"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--brand-green)', font: '500 12px DM Sans', cursor: 'pointer', padding: '7px 12px', borderRadius: 5, minHeight: 36, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {allCalcsOpen ? 'Collapse all calculations' : 'Show all calculations'}
              <ChevronIcon isOpen={allCalcsOpen} size={13} />
            </button>
          )}
        </div>

        {!roi.roiAvailable ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select tasks in Step 3 to see estimated impact.</p>
        ) : (
          <>
            {roi.operationalAvailable && (
              <SubsectionBlock
                sectionLabel="Operational Capacity Unlocked"
                headline={`~${fmtK(roi.operationalFloor)} – ${fmtK(roi.operationalCeiling)} per year`}
                isOpen={!!open.operational}
                onToggle={() => toggle('operational')}
                accent
              >
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: 580, borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-active)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Task</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Staff</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Effective Hrs/wk</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Category</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Rate</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>Annual Range</th>
                      <th style={{ padding: '6px 4px', width: 28 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {tr.operationalTasks.map((t, i) => (
                      <Fragment key={t.id}>
                        <tr style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg-raised)' }}>
                          <td style={{ padding: '6px 8px', color: 'var(--text-body)' }}>{t.label}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t.people}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {Math.round(t.scaledHours * 10) / 10} hrs
                            {tr.isCapped && Math.abs(t.effectiveHours - t.scaledHours) > 0.05 && (
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>
                                (eff: {Math.round(t.effectiveHours * 10) / 10}, scaled)
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {laborCategoryLabel[t.laborCategory] || t.laborCategory}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {laborRateLabel(t.laborCategory)}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                            {formatCurrency(t.annualFloor)} – {formatCurrency(t.annualCeiling)}
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setOpenTaskCalc(openTaskCalc === t.id ? null : t.id)}
                              aria-label={openTaskCalc === t.id ? `Hide calculation for ${t.label}` : `Show calculation for ${t.label}`}
                              aria-expanded={openTaskCalc === t.id}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1, padding: 0, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                            >
                              <span aria-hidden="true">{openTaskCalc === t.id ? '▲' : '▼'}</span>
                            </button>
                          </td>
                        </tr>
                        {openTaskCalc === t.id && (
                          <tr key={`${t.id}-calc`} style={{ background: 'var(--bg-active)' }}>
                            <td colSpan={7} style={{ padding: '10px 14px' }}>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>
                                <div>
                                  <strong>Raw hours:</strong>{' '}
                                  {t.people} staff × {t.freqHoursPerPerson} hrs/wk ({t.frequency}) = {t.rawHours} hrs/wk raw
                                  {' → × '}{t.efficiencyFactor} efficiency factor = {Math.round(t.effectiveHours * 100) / 100} hrs/wk available for automation
                                </div>
                                <div style={{ marginTop: 2, color: 'var(--text-secondary)', fontSize: 10 }}>
                                  {efficiencyLabel(t.efficiencyFactor)}
                                </div>
                                {tr.isCapped && (
                                  <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
                                    <strong>Cap scaling:</strong>{' '}
                                    Total effective hours: {Math.round(tr.effectiveOperationalHours * 10) / 10} hrs/wk exceeded {tr.hrCap}hr cap.{' '}
                                    Scale factor: {tr.hrCap} ÷ {Math.round(tr.effectiveOperationalHours * 10) / 10} = {(tr.hrCap / tr.effectiveOperationalHours).toFixed(3)}.{' '}
                                    Scaled hours for this task: {Math.round(t.effectiveHours * 100) / 100} × {(tr.hrCap / tr.effectiveOperationalHours).toFixed(3)} = {Math.round(t.scaledHours * 100) / 100} hrs/wk.
                                  </div>
                                )}
                                <div style={{ marginTop: 6 }}>
                                  <strong>Annual floor:</strong>{' '}
                                  {Math.round(t.scaledHours * 100) / 100} hrs/wk × ${t.floorRate}/hr × 52 weeks = {formatCurrency(t.annualFloor)}
                                </div>
                                <div>
                                  <strong>Annual ceiling:</strong>{' '}
                                  {Math.round(t.scaledHours * 100) / 100} hrs/wk × ${t.ceilingRate}/hr × 52 weeks = {formatCurrency(t.annualCeiling)}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                    <tr style={{ background: 'var(--bg-active)', fontWeight: 600 }}>
                      <td colSpan={2} style={{ padding: '6px 8px', color: 'var(--text-heading)', fontSize: 11 }}>
                        Total{tr.isCapped ? ` (scaled to ${tr.hrCap} hrs/wk)` : ''}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                        {Math.round(tr.totalScaledHours * 10) / 10} hrs/wk
                      </td>
                      <td colSpan={2} />
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {formatCurrency(tr.operationalFloor)} – {formatCurrency(tr.operationalCeiling)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
                </div>
                {tr.isCapped && (
                  <div className="mt-3 rounded px-3 py-2" style={{ fontSize: 13, background: 'var(--bg-active)', border: '1px solid var(--border)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Cap applied:</strong> Hours scaled to {tr.hrCap} hrs/week, a conservative ceiling based on your team size of {tr.numEmployees} employees. This reflects realistic automation coverage: a new system doesn't instantly capture 100% of available time savings.{' '}
                    <span style={{ fontFamily: 'var(--font-mono)' }}>Formula: {tr.capFormula}.</span>
                  </div>
                )}
              </SubsectionBlock>
            )}

            {roi.revenueRecoverySignal && (
              <SubsectionBlock
                sectionLabel="Revenue Recovery Opportunity"
                headline={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ ...SIGNAL_STYLE[roi.revenueRecoverySignal], padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                      {roi.revenueRecoverySignal.charAt(0).toUpperCase() + roi.revenueRecoverySignal.slice(1)} Signal
                    </span>
                    <span>Revenue recovery identified</span>
                  </span>
                }
                isOpen={!!open.revenueRecovery}
                onToggle={() => toggle('revenueRecovery')}
              >
                {tr.revRecoveryTasks.length > 0 && (
                  <div className="mb-3">
                    {tr.revRecoveryTasks.map((t) => (
                      <div key={t.id} className="flex justify-between text-sm py-1" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <span>{t.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          {t.people} staff × {t.frequency} = {t.derivedHours} hrs/wk
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs mb-2" style={{ color: 'var(--text-body)' }}>{roi.revenueRecoveryNote}</p>
              </SubsectionBlock>
            )}

            {roi.showDecisionQuality && (
              <div className="mb-4 rounded-md" style={{ border: '1px solid var(--border)', background: 'var(--bg-raised)', padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Strategic Visibility Benefits
                </div>
                <ul className="flex flex-col gap-1">
                  {roi.decisionQualityBenefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
                      <span aria-hidden="true" style={{ color: 'var(--brand-green)', flexShrink: 0, marginTop: 1 }}>→</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {intel && (
              <SubsectionBlock
                sectionLabel="Industry Intelligence: Research Center"
                headline={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--brand-green)', color: '#fff', padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                      {intel.badge}
                    </span>
                    <span>{intel.headline}</span>
                  </span>
                }
                isOpen={!!open.intel}
                onToggle={() => toggle('intel')}
              >
                <p className="text-sm mb-3" style={{ color: 'var(--text-body)', lineHeight: 1.6 }}>{intel.intro}</p>
                <ul className="flex flex-col gap-1 mb-3">
                  {intel.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
                      <span aria-hidden="true" style={{ color: 'var(--brand-green)', flexShrink: 0, marginTop: 1 }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm mb-2" style={{ color: 'var(--text-body)', lineHeight: 1.6 }}>{intel.closing}</p>
              </SubsectionBlock>
            )}

            {roi.operationalAvailable && (tr.paybackFloorWeeks !== null || tr.year1NetCeiling > 0 || tr.year2NetCeiling > 0) && (
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', margin: '20px 0 10px' }}>
                Return on the Phase 1 investment of {phase1Label}
              </div>
            )}

            {roi.operationalAvailable && tr.paybackFloorWeeks !== null && (
              <TraceRow
                label="Estimated payback window"
                value={`~${tr.paybackFloorWeeks} – ${tr.paybackCeilingWeeks} weeks`}
                isOpen={!!open.payback}
                onToggle={() => toggle('payback')}
                bg="#fff"
              >
                <TraceLine
                  label="Fastest payback, at the low Phase 1 price"
                  result={`${tr.paybackFloorWeeks} weeks`}
                  detail={`${formatCurrency(tr.phase1Floor)} ÷ ${formatCurrency(Math.round(tr.weeklyOperationalValue))}/wk`}
                />
                <TraceLine
                  label="Slowest payback, at the high Phase 1 price"
                  result={`${tr.paybackCeilingWeeks} weeks`}
                  detail={`${formatCurrency(tr.phase1Ceiling)} ÷ ${formatCurrency(Math.round(tr.weeklyOperationalValue))}/wk`}
                />
                <TraceLine
                  label="Weekly operational value"
                  result={`${formatCurrency(Math.round(tr.weeklyOperationalValue))}/wk`}
                  detail={`annual operational midpoint ${formatCurrency(tr.operationalMidpoint)} ÷ 52 weeks`}
                />
              </TraceRow>
            )}

            {roi.operationalAvailable && tr.year1NetCeiling > 0 && (
              <TraceRow
                label="Estimated Year 1 net impact"
                value={fmtRange(tr.year1NetFloor, tr.year1NetCeiling)}
                isOpen={!!open.year1}
                onToggle={() => toggle('year1')}
                bg="var(--bg-raised)"
              >
                <TraceLine
                  label="Conservative, at the impact floor"
                  result={formatCurrency(Math.round(tr.year1NetFloor))}
                  detail={`${formatCurrency(tr.operationalFloor)} − ${formatCurrency(Math.round(tr.phase1Midpoint))} Phase 1 − ${formatCurrency(tr.monthlyMaintenance)}/mo × 12`}
                />
                <TraceLine
                  label="Upside, at the impact ceiling"
                  result={formatCurrency(Math.round(tr.year1NetCeiling))}
                  detail={`${formatCurrency(tr.operationalCeiling)} − ${formatCurrency(Math.round(tr.phase1Midpoint))} Phase 1 − ${formatCurrency(tr.monthlyMaintenance)}/mo × 12`}
                />
              </TraceRow>
            )}

            {roi.operationalAvailable && tr.year2NetCeiling > 0 && (
              <TraceRow
                label="Estimated Year 2 net impact"
                value={fmtRange(tr.year2NetFloor, tr.year2NetCeiling)}
                isOpen={!!open.year2}
                onToggle={() => toggle('year2')}
                bg="#fff"
              >
                <TraceLine
                  label="Conservative, at the impact floor"
                  result={formatCurrency(Math.round(tr.year2NetFloor))}
                  detail={`${formatCurrency(tr.operationalFloor)} − ${formatCurrency(tr.monthlyMaintenance)}/mo × 12 (no Phase 1 cost in Year 2)`}
                />
                <TraceLine
                  label="Upside, at the impact ceiling"
                  result={formatCurrency(Math.round(tr.year2NetCeiling))}
                  detail={`${formatCurrency(tr.operationalCeiling)} − ${formatCurrency(tr.monthlyMaintenance)}/mo × 12`}
                />
              </TraceRow>
            )}

            <p className="italic" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
              How to read these figures: operational ranges use conservative fully-loaded labor costs (admin $25–$35/hr, operations $35–$60/hr) and effective hours — team totals reduced by each task's efficiency factor to reflect the share automation can realistically capture, since human review and judgment stay part of every workflow. They reflect potential value, not guaranteed outcomes; actual results depend on software access, adoption, and workflow design. Revenue recovery and industry intelligence are assessed qualitatively and are not included in the financial projections.
            </p>
          </>
        )}
      </SectionCard>

      <SectionDivider large />

      {/* Section D — Recommended Implementation Phases */}
      <SectionCard id="sec-investment" style={{ boxShadow: 'var(--shadow-card-raised)' }}>
        <SectionTitle>Recommended Implementation Phases</SectionTitle>

        <div className="flex flex-col gap-4">
          {/* Phase 1 — Hero */}
          <div style={{ background: 'var(--bg-active)', border: '1.5px solid var(--brand-green)', borderTop: '3px solid var(--brand-green)', borderRadius: 8, padding: 32, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-green)', marginBottom: 5 }}>
              Phase 1
            </div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, fontWeight: 400, color: 'var(--text-heading)', margin: '0 0 10px' }}>
              Pilot &amp; Proof
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 18 }}>
              One or two focused improvements that deliver fast value and prove ROI before any larger commitment. Pick what you'd start with below and the estimate updates to match.
            </p>
            <div style={{ borderTop: '1px solid rgba(45,94,58,0.18)', paddingTop: 16, marginTop: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
                {phase1.selectedCount > 0
                  ? `Estimated Phase 1 investment · ${pilotCaps.length} ${pilotCaps.length === 1 ? 'capability' : 'capabilities'}${buildPhrase ? ' · ' + buildPhrase : ''}`
                  : 'Estimated Phase 1 investment'}
              </div>
              <div key={phase1Label} className="price-settle" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--brand-green)', lineHeight: 1.1 }}>
                {phase1Label}
              </div>

              {phase1.noScopeSelected && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
                  This is the full range for a company your size. <strong>Check one or two capabilities below</strong> to scope your pilot and tighten the estimate.
                </p>
              )}

              {isOverScoped && (
                <div className="rounded px-3 py-2 mt-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(45,94,58,0.25)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  A focused pilot is one or two capabilities. The first two you checked define Phase 1; the {overflowCaps.length === 1 ? 'other one is' : `other ${overflowCaps.length} are`} flagged as <strong>Phase 2 scope</strong> below, and this estimate is held toward the top of your range. A scope this broad is usually delivered as a full Phase 2 engagement.
                </div>
              )}

              {!phase1.noScopeSelected && (
                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => toggle('phase1pos')}
                    aria-expanded={!!open.phase1pos}
                    className="no-print"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--brand-green)', font: '500 12px DM Sans' }}
                  >
                    How this range is set <ChevronIcon isOpen={!!open.phase1pos} size={13} />
                  </button>
                  {open.phase1pos && (
                    <div className="rounded mt-2" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border)', padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                        Two layers, both from fixed config: your <strong>revenue band</strong> sets the range, your selected <strong>scope</strong> positions the quote inside it.
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 8 }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '4px 6px', color: 'var(--text-secondary)' }}>Revenue band ({REVENUE_LABELS[company.revenueRange]})</td>
                            <td style={{ padding: '4px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
                              {formatCurrency(phase1.bandFloor)} – {formatCurrency(phase1.bandCeiling)}
                            </td>
                          </tr>
                          {phase1.scope.map((c) => (
                            <tr key={c.title} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '4px 6px', color: 'var(--text-secondary)' }}>
                                {c.title}{!pilotSet.has(c.title) && <span style={{ color: 'var(--text-muted)' }}> · Phase 2 scope</span>}
                              </td>
                              <td style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--text-heading)' }}>{EFFORT_WORD[c.weight] || 'medium'} build</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        Your pilot scope sits at {Math.round(phase1.position * 100)}% of your revenue band, which sets the quoted range of {formatCurrency(phase1.floor)} – {formatCurrency(phase1.ceiling)}.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Capability picker — the control that sets the price above. A recessed
                full-bleed band marks it as a distinct movement, so the eye reads
                price first, then configurator. */}
            <div style={{ background: 'rgba(255,255,255,0.5)', margin: '24px -32px -32px', padding: '24px 32px 28px', borderTop: '1px solid rgba(45,94,58,0.2)' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 4 }}>
                Choose what to build first
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0, marginBottom: 16 }}>
                Check the one or two capabilities you'd start with. Your estimate above updates to match the scope you pick.
              </p>

              {selectedCapSet.size > 0 && (
                <div className="rounded-md mb-4" style={{ background: '#fff', border: '1px solid var(--brand-green)', padding: '10px 14px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-green)' }}>In your Phase 1 pilot:</span>
                  <span style={{ fontSize: 12, color: 'var(--text-body)' }}>{pilotCaps.join(' · ')}</span>
                  {isOverScoped && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· Phase 2: {overflowCaps.join(' · ')}</span>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{phase1Label}</span>
                </div>
              )}

              {TAG_ORDER.map(tag => {
                const caps = capsByTag[tag]
                if (!caps) return null
                const highlighted = caps.filter(c => highlightedCaps.has(c.title))
                const regular = caps.filter(c => !highlightedCaps.has(c.title))
                const expandedByDefault = hasAnyHighlight ? false : tag === firstCapTag
                const isExpanded = showAllCaps[tag] ?? expandedByDefault
                const selectedRegular = regular.filter(c => selectedCapSet.has(c.title))
                const visibleRegular = isExpanded ? regular : selectedRegular
                const hiddenCount = regular.length - selectedRegular.length
                return (
                  <div key={tag} style={{ marginBottom: 24 }}>
                    {/* Category label — no uppercase, no tracking */}
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 10 }}>
                      {tag}
                    </div>

                    {/* Recommended items — full-width featured rows, selectable */}
                    {highlighted.map(cap => {
                      const selected = selectedCapSet.has(cap.title)
                      const inPilot = pilotSet.has(cap.title)
                      const overflow = selected && !inPilot
                      const badge = inPilot ? 'In Phase 1' : overflow ? 'Phase 2 scope' : 'Recommended'
                      return (
                        <label
                          key={cap.title}
                          className="cap-row"
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: '10px 14px',
                            marginBottom: 4,
                            background: '#fff',
                            border: selected
                              ? (inPilot ? '1.5px solid var(--brand-green)' : '1.5px dashed var(--text-muted)')
                              : '1.5px solid var(--border)',
                            borderRadius: 5,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => onToggleCapability(cap.title)}
                            style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: 'var(--brand-green)', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 14, fontWeight: 400, color: 'var(--text-heading)' }}>
                                {cap.title}
                              </span>
                              <span style={{ fontSize: 10, fontWeight: 600, color: overflow ? 'var(--text-muted)' : 'var(--brand-green)', flexShrink: 0, marginTop: 2 }}>
                                {badge}
                              </span>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '3px 0 0' }}>
                              {cap.description}
                            </p>
                          </div>
                        </label>
                      )
                    })}

                    {/* Regular items — compact list, collapsed to current picks until expanded */}
                    {visibleRegular.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        columnGap: 24,
                        marginTop: highlighted.length > 0 ? 6 : 0,
                      }}>
                        {visibleRegular.map(cap => {
                          const selected = selectedCapSet.has(cap.title)
                          const inPilot = pilotSet.has(cap.title)
                          return (
                            <label
                              key={cap.title}
                              className="cap-row"
                              style={{
                                display: 'flex',
                                gap: 10,
                                padding: '8px 10px',
                                borderBottom: '1px solid var(--border)',
                                background: selected
                                  ? (inPilot ? 'var(--bg-active)' : 'var(--bg-subtle)')
                                  : 'transparent',
                                cursor: 'pointer',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => onToggleCapability(cap.title)}
                                style={{ marginTop: 3, width: 15, height: 15, flexShrink: 0, accentColor: 'var(--brand-green)', cursor: 'pointer' }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, fontWeight: 400, color: 'var(--text-heading)' }}>
                                    {cap.title}
                                  </span>
                                  {selected && (
                                    <span style={{ fontSize: 10, fontWeight: 600, color: inPilot ? 'var(--brand-green)' : 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>
                                      {inPilot ? 'In Phase 1' : 'Phase 2 scope'}
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '2px 0 0' }}>
                                  {cap.description}
                                </p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAllCaps(prev => ({ ...prev, [tag]: !isExpanded }))}
                        aria-expanded={isExpanded}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 0', color: 'var(--brand-green)', font: '500 12px DM Sans' }}
                      >
                        {isExpanded ? 'Show fewer' : `Show ${hiddenCount} more in ${tag}`}
                        <ChevronIcon isOpen={isExpanded} size={13} />
                      </button>
                    )}
                  </div>
                )
              })}

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '4px 0 0' }}>
                A full engagement can include any combination of these. Your pilot starts with one or two.
              </p>
            </div>
          </div>

          {/* Phase 2 + 3 — subordinate to the Phase 1 hero: plain columns under a hairline */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            {/* Phase 2 */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                Phase 2
              </div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, fontWeight: 400, color: 'var(--text-heading)', margin: '0 0 8px' }}>
                Operational Intelligence Layer
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                A full operational engagement scoped around your specific priorities. Any capability from the list above: cross-system reporting, AI-assisted insights, workflow automations, margin analysis, capacity forecasting, or any combination that addresses your most important pain points. Scoped and priced after Phase 1 proves the foundation.
              </p>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
                Investment: Scoped after Phase 1, based on your specific needs and priorities.
              </div>
            </div>

            {/* Phase 3 */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                Phase 3
              </div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, fontWeight: 400, color: 'var(--text-heading)', margin: '0 0 8px' }}>
                Ongoing Optimization
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                Monthly maintenance, new automations, additional integrations, and AI improvements as your business grows. Your system evolves with you.
              </p>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
                Investment: {roi.roiAvailable ? `~${formatCurrency(tr.monthlyMaintenance)}/month` : 'Typically 10% of Phase 1 investment per month'}
              </div>
              {roi.roiAvailable && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 3 }}>
                  {tr.phase1MaintenanceTrace}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guarantee — outside phase cards, centered */}
        <p style={{ textAlign: 'center', fontSize: 12, fontStyle: 'italic', color: 'var(--text-muted)', marginTop: 20 }}>
          All Phase 1 engagements include a 30-day performance guarantee. If the solution doesn't perform as scoped within 30 days of delivery, we'll fix it at no additional cost, or refund your final payment. No questions asked.
        </p>
      </SectionCard>

      {/* Closing frame — the last thing on screen during the screenshare */}
      <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: 32, paddingTop: 28 }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: 'var(--text-heading)', lineHeight: 1.35, margin: '0 auto 8px', maxWidth: 460 }}>
          Let&rsquo;s start with one proven win.
        </p>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Somerset Systems &nbsp;·&nbsp; somersetsystems.co
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{ color: 'var(--brand-green)', border: '1.5px solid var(--brand-green)', background: 'transparent', padding: '12px 28px', borderRadius: 5, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Back
        </button>
        <button
          onClick={onPrint}
          className="btn-primary"
          style={{ background: 'var(--brand-green)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 5, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Print / share
        </button>
      </div>
    </div>
  )
}
