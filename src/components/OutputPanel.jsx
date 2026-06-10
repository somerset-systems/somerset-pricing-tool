import { useState, Fragment } from 'react'
import { formatCurrency, deriveTaskHours, LABOR_RATES } from '../utils/calculations.js'
import { CAPABILITIES } from '../data/niches.js'

const REVENUE_LABELS = {
  '<2m': 'Under $2M', '2-5m': '$2M–$5M', '5-10m': '$5M–$10M', '10m+': '$10M+',
}

const IMPACT_STYLE = {
  High:   { background: '#2D5E3A', color: '#fff' },
  Medium: { background: '#1C1C1C', color: '#fff' },
  Low:    { background: '#888888', color: '#fff' },
}

const SIGNAL_STYLE = {
  low:    { background: '#888888', color: '#fff' },
  medium: { background: '#1C1C1C', color: '#fff' },
  high:   { background: '#2D5E3A', color: '#fff' },
}

const EFFICIENCY_LABELS = {
  0.80: '80% automatable — minimal human judgment required',
  0.75: '75% automatable — light review still needed',
  0.70: '70% automatable — some coordination remains manual',
  0.65: '65% automatable — human oversight is part of the workflow',
  0.55: '55% automatable — significant judgment calls remain',
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

function SectionCard({ children, style }) {
  return (
    <div
      className="rounded-lg mb-0"
      style={{
        background: 'var(--bg-card)',
        boxShadow: '0 2px 16px rgba(45, 94, 58, 0.10)',
        border: '1px solid var(--border)',
        borderTop: '3px solid #2D5E3A',
        padding: 32,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 20 }}>
      {children}
    </div>
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
            {deriveTaskHours(t)} hrs/wk
          </span>
        </div>
      ))}
    </div>
  )
}

function SubsectionBlock({ sectionLabel, headline, isOpen, onToggle, children, accent }) {
  return (
    <div className="mb-4 rounded-md" style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
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
        <div className="font-medium text-sm mt-0.5" style={{ color: 'var(--text-heading)', fontFamily: 'ui-monospace, Consolas, monospace' }}>
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

export default function OutputPanel({ output, company, niche, nicheLabel, tasks, onBack, onPrint }) {
  const [open, setOpen] = useState({})
  const [openTaskCalc, setOpenTaskCalc] = useState(null)
  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  if (!output) return null

  const { roi, phase1 } = output
  const tr = roi.roiAvailable ? roi.calculationTrace : null

  const checkedTasks = tasks.filter((t) => t.included)
  const highTasks    = checkedTasks.filter((t) => t.impact === 'High')
  const mediumTasks  = checkedTasks.filter((t) => t.impact === 'Medium')
  const lowTasks     = checkedTasks.filter((t) => t.impact === 'Low')

  const phase1Label = `${formatCurrency(phase1.floor)} – ${formatCurrency(phase1.ceiling)}`
  const capabilities = CAPABILITIES[niche] || CAPABILITIES.other

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

  const whyPoints = [
    { label: 'Connects to your stack', desc: "Integrates directly with whatever tools you're already running — no replacements, no migrations." },
    { label: 'Nothing disrupted', desc: "Your existing workflows stay intact. We build capability on top without displacing what works." },
    { label: 'Built only for you', desc: 'Every build is scoped around your specific operations, not a packaged template or off-the-shelf product.' },
    { label: 'Grows with you', desc: 'The infrastructure built in Phase 1 is designed to expand as your priorities and team evolve.' },
  ]

  return (
    <div>

      {/* Presentation banner */}
      <div
        className="rounded-lg mb-6"
        style={{ background: '#2D5E3A', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: '#fff', letterSpacing: '-0.01em' }}>
            Operational Opportunity Assessment
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.80)', marginTop: 4 }}>
            Prepared by Somerset Systems
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.90)', textAlign: 'right' }}>
          {nicheLabel}
        </div>
      </div>

      {/* Section A — Company Snapshot (document header) */}
      <div
        className="rounded-lg mb-0"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '20px 28px' }}
      >
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 12 }}>
          Company Snapshot
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-3">
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
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Integration</span>
            <div style={{ color: 'var(--text-body)', fontSize: 13, marginTop: 2 }}>We connect directly to your existing tools, whatever you're already running.</div>
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
            <ImpactGroup label="High"   tasks={highTasks}   accentColor="#2D5E3A" />
            <ImpactGroup label="Medium" tasks={mediumTasks} accentColor="#1C1C1C" />
            <ImpactGroup label="Low"    tasks={lowTasks}    accentColor="var(--text-muted)" />
          </>
        )}
      </SectionCard>

      <SectionDivider />

      {/* Section C — Where We See Opportunity */}
      <SectionCard>
        <SectionTitle>Where We See Opportunity</SectionTitle>

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
                          <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, Consolas, monospace' }}>
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
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-heading)', fontFamily: 'ui-monospace, Consolas, monospace', whiteSpace: 'nowrap' }}>
                            {formatCurrency(t.annualFloor)} – {formatCurrency(t.annualCeiling)}
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setOpenTaskCalc(openTaskCalc === t.id ? null : t.id)}
                              aria-label={openTaskCalc === t.id ? `Hide calculation for ${t.label}` : `Show calculation for ${t.label}`}
                              aria-expanded={openTaskCalc === t.id}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1, padding: 0, minWidth: 32, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <span aria-hidden="true">{openTaskCalc === t.id ? '▲' : '▼'}</span>
                            </button>
                          </td>
                        </tr>
                        {openTaskCalc === t.id && (
                          <tr key={`${t.id}-calc`} style={{ background: 'var(--bg-active)' }}>
                            <td colSpan={7} style={{ padding: '10px 14px' }}>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'ui-monospace, Consolas, monospace', lineHeight: 1.8 }}>
                                <div>
                                  <strong>Raw hours:</strong>{' '}
                                  {t.people} staff × {t.freqHoursPerPerson} hrs/wk ({t.frequency}) = {t.rawHours} hrs/wk raw
                                  {' → × '}{t.efficiencyFactor} efficiency factor = {Math.round(t.effectiveHours * 100) / 100} hrs/wk available for automation
                                </div>
                                <div style={{ marginTop: 2, color: '#5A5A5A', fontSize: 10 }}>
                                  {efficiencyLabel(t.efficiencyFactor)}
                                </div>
                                {tr.isCapped && (
                                  <div style={{ marginTop: 6, color: '#5A5A5A' }}>
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
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-heading)', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                        {Math.round(tr.totalScaledHours * 10) / 10} hrs/wk
                      </td>
                      <td colSpan={2} />
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-heading)', fontFamily: 'ui-monospace, Consolas, monospace', whiteSpace: 'nowrap' }}>
                        {formatCurrency(tr.operationalFloor)} – {formatCurrency(tr.operationalCeiling)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
                </div>
                <p className="text-xs italic mt-3" style={{ color: 'var(--text-muted)' }}>
                  These ranges use conservative fully-loaded labor costs for admin ($25–$35/hr) and operations/management ($35–$60/hr) staff. Actual impact depends on current compensation, adoption, and workflow design.
                </p>
                {tr.isCapped && (
                  <div className="mt-3 rounded px-3 py-2 text-xs" style={{ background: 'var(--bg-active)', border: '1px solid #D8D4C8', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Cap applied:</strong> Hours scaled to {tr.hrCap} hrs/week — conservative ceiling based on your team size of {tr.numEmployees} employees. This reflects realistic automation coverage: a new system doesn't instantly capture 100% of available time savings.{' '}
                    <span style={{ fontFamily: 'ui-monospace, Consolas, monospace' }}>Formula: {tr.capFormula}.</span>
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
                        <span style={{ fontFamily: 'ui-monospace, Consolas, monospace' }}>
                          {t.people} staff × {t.frequency} = {t.derivedHours} hrs/wk
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs mb-2" style={{ color: 'var(--text-body)' }}>{roi.revenueRecoveryNote}</p>
                <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                  Revenue recovery is assessed qualitatively. We don't assign a dollar amount because results depend heavily on your current close rates, follow-up cadence, and lead volume.
                </p>
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
                      <span aria-hidden="true" style={{ color: '#2D5E3A', flexShrink: 0, marginTop: 1 }}>→</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="text-xs italic mt-2" style={{ color: 'var(--text-muted)' }}>
                  These benefits are real but hard to quantify. Better information leads to better decisions over time.
                </p>
              </div>
            )}

            {roi.operationalAvailable && tr.paybackFloorWeeks !== null && (
              <>
                <TraceRow
                  label="Estimated payback window"
                  value={`~${tr.paybackFloorWeeks} – ${tr.paybackCeilingWeeks} weeks`}
                  isOpen={!!open.payback}
                  onToggle={() => toggle('payback')}
                  bg="#fff"
                >
                  <div className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                    <div>Phase 1 floor ({formatCurrency(tr.phase1Floor)}) ÷ weekly operational value ({formatCurrency(Math.round(tr.weeklyOperationalValue))}/wk) = {tr.paybackFloorWeeks} weeks</div>
                    <div className="mt-1">Phase 1 ceiling ({formatCurrency(tr.phase1Ceiling)}) ÷ weekly operational value ({formatCurrency(Math.round(tr.weeklyOperationalValue))}/wk) = {tr.paybackCeilingWeeks} weeks</div>
                  </div>
                </TraceRow>
                <div className="text-xs mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'ui-monospace, Consolas, monospace', paddingLeft: 4 }}>
                  Weekly operational value: Annual operational midpoint ({formatCurrency(tr.operationalMidpoint)}) ÷ 52 weeks = {formatCurrency(Math.round(tr.weeklyOperationalValue))}/week
                </div>
              </>
            )}

            {roi.operationalAvailable && tr.year1NetCeiling > 0 && (
              <TraceRow
                label="Estimated Year 1 net impact"
                value={fmtRange(tr.year1NetFloor, tr.year1NetCeiling)}
                isOpen={!!open.year1}
                onToggle={() => toggle('year1')}
                bg="var(--bg-raised)"
              >
                <div className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                  <div>Annual impact floor ({formatCurrency(tr.operationalFloor)}) − Phase 1 midpoint ({formatCurrency(Math.round(tr.phase1Midpoint))}) − ({formatCurrency(tr.monthlyMaintenance)} × 12 mo) = {formatCurrency(Math.round(tr.year1NetFloor))}</div>
                  <div className="mt-1">Annual impact ceiling ({formatCurrency(tr.operationalCeiling)}) − Phase 1 midpoint ({formatCurrency(Math.round(tr.phase1Midpoint))}) − ({formatCurrency(tr.monthlyMaintenance)} × 12 mo) = {formatCurrency(Math.round(tr.year1NetCeiling))}</div>
                </div>
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
                <div className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                  <div>Annual impact floor ({formatCurrency(tr.operationalFloor)}) − ({formatCurrency(tr.monthlyMaintenance)} × 12 mo) = {formatCurrency(Math.round(tr.year2NetFloor))}</div>
                  <div className="mt-1">Annual impact ceiling ({formatCurrency(tr.operationalCeiling)}) − ({formatCurrency(tr.monthlyMaintenance)} × 12 mo) = {formatCurrency(Math.round(tr.year2NetCeiling))}</div>
                </div>
              </TraceRow>
            )}

            <p className="text-xs italic" style={{ color: 'var(--text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
              Estimates reflect potential value, not guaranteed outcomes. Actual results depend on software access, team adoption, workflow design, and current operational baseline. Revenue recovery impact is assessed qualitatively and not included in financial projections. Efficiency factors reflect the realistic share of each task that automation can capture. Not all time spent on a task is recoverable — human review, judgment calls, and edge cases remain part of every workflow.
            </p>
          </>
        )}
      </SectionCard>

      <SectionDivider large />

      {/* Section D — Recommended Implementation Phases */}
      <SectionCard style={{ boxShadow: '0 4px 28px rgba(45, 94, 58, 0.14)' }}>
        <SectionTitle>Recommended Implementation Phases</SectionTitle>

        <div className="flex flex-col gap-4">
          {/* Phase 1 — Hero */}
          <div style={{ background: 'var(--bg-active)', border: '1.5px solid #2D5E3A', borderTop: '3px solid #2D5E3A', borderRadius: 8, padding: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#2D5E3A', marginBottom: 5 }}>
              Phase 1
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 10 }}>
              Pilot &amp; Proof
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 18 }}>
              One focused improvement to deliver fast value and build trust. We identify your single highest-impact friction point, build a targeted solution, and prove ROI before asking for full commitment.
            </p>
            <div style={{ borderTop: '1px solid rgba(45,94,58,0.18)', paddingTop: 16, marginTop: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Estimated Phase 1 investment</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: '#2D5E3A', lineHeight: 1.1 }}>
                {phase1Label}
              </div>
            </div>
          </div>

          {/* Phase 2 + 3 — side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {/* Phase 2 */}
            <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                Phase 2
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 8 }}>
                Operational Intelligence Layer
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                A full operational engagement scoped around your specific priorities. Any capability from the list below: cross-system reporting, AI-assisted insights, workflow automations, margin analysis, capacity forecasting, or any combination that addresses your most important pain points. Scoped and priced after Phase 1 proves the foundation.
              </p>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
                Investment: Scoped after Phase 1, based on your specific needs and priorities.
              </div>
            </div>

            {/* Phase 3 */}
            <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                Phase 3
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 8 }}>
                Ongoing Optimization
              </div>
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

      <SectionDivider />

      {/* Section D.5 — What We Can Build For You */}
      <SectionCard style={{ borderTop: '1px solid var(--border)' }}>
        <SectionTitle>What We Can Build For You</SectionTitle>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: -12, marginBottom: 20 }}>
          Every engagement is scoped around your specific needs. Below are the capabilities we deliver.
        </p>

        {TAG_ORDER.map(tag => {
          const caps = capsByTag[tag]
          if (!caps) return null
          const highlighted = caps.filter(c => highlightedCaps.has(c.title))
          const regular = caps.filter(c => !highlightedCaps.has(c.title))
          return (
            <div key={tag} style={{ marginBottom: 24 }}>
              {/* Category label — no uppercase, no tracking */}
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 10 }}>
                {tag}
              </div>

              {/* Recommended items — full-width featured rows */}
              {highlighted.map(cap => (
                <div
                  key={cap.title}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 14px',
                    marginBottom: 4,
                    background: 'var(--bg-active)',
                    border: '1.5px solid #2D5E3A',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 14, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 3 }}>
                      {cap.title}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                      {cap.description}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#2D5E3A', flexShrink: 0, marginTop: 2 }}>
                    Recommended
                  </span>
                </div>
              ))}

              {/* Regular items — 2-col compact list, no individual card borders */}
              {regular.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  columnGap: 24,
                  marginTop: highlighted.length > 0 ? 6 : 0,
                }}>
                  {regular.map(cap => (
                    <div
                      key={cap.title}
                      style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}
                    >
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 2 }}>
                        {cap.title}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                        {cap.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <p style={{ textAlign: 'center', fontSize: 12, fontStyle: 'italic', color: 'var(--text-muted)', marginTop: 4 }}>
          We build on top of your existing software. All capabilities connect directly to the tools you already use. Your Phase 1 pilot addresses one or two of these. A full engagement can include any combination.
        </p>
      </SectionCard>

      <SectionDivider />

      {/* Section E — Why This Fits Your Business */}
      <div
        className="rounded-lg mb-0"
        style={{ background: 'var(--bg-card)', boxShadow: '0 2px 16px rgba(45, 94, 58, 0.10)', border: '1px solid var(--border)', borderTop: '3px solid #2D5E3A', padding: '32px 32px 0 32px', overflow: 'hidden' }}
      >
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 20 }}>
          Why This Fits Your Business
        </div>

        {/* 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
          {whyPoints.map(pt => (
            <div key={pt.label} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>{pt.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{pt.desc}</div>
            </div>
          ))}
        </div>

        {/* Where This Can Go — flush to card edges */}
        <div style={{ background: 'var(--bg-subtle)', margin: '0 -32px', padding: '24px 32px 28px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: 'var(--text-heading)', marginBottom: 10, marginTop: 0 }}>
            Where This Can Go
          </h4>
          <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.65, marginBottom: 20 }}>
            Every engagement starts focused — one or two improvements, proven fast. But the infrastructure we build in Phase 1 is designed to grow. If you want it, a full operational layer is possible: one place where all your tools agree on the numbers that matter — revenue, utilization, capacity, margin, and pipeline.
          </p>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
            somersetsystems.co
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onBack}
          style={{ color: '#2D5E3A', border: '1.5px solid #2D5E3A', background: 'transparent', padding: '12px 28px', borderRadius: 6, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Back
        </button>
        <button
          onClick={onPrint}
          style={{ background: '#2D5E3A', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 6, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Print / Share
        </button>
      </div>
    </div>
  )
}
