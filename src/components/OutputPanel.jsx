import { useState } from 'react'
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

const TAG_STYLE = {
  'Operational Efficiency': { background: '#2D5E3A', color: '#fff' },
  'Revenue Intelligence':   { background: '#2D5E3A', color: '#fff' },
  'Financial Clarity':      { background: '#888888', color: '#fff' },
}

const EFFICIENCY_LABELS = {
  0.80: '80% automatable — minimal human judgment required',
  0.75: '75% automatable — light review still needed',
  0.70: '70% automatable — some coordination remains manual',
  0.65: '65% automatable — human oversight is part of the workflow',
  0.55: '55% automatable — significant judgment calls remain',
}

// Task ID → capability title(s) to highlight when frequency is 'Constantly'
const TASK_TO_CAPS = {
  scheduling: ['Scheduling and Dispatch Optimization'],
  followup:   ['Automated Follow-Up Workflows', 'Maintenance Renewal Tracker'],
  proposals:  ['Proposal and Work Order Automation'],
  invoices:   ['Automated Invoicing'],
  jobstatus:  ['Job Status Tracker'],
  reports:    ['Weekly Report Automation', 'AI Owner Briefings'],
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

function ChevronIcon({ isOpen }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0, color: 'var(--text-muted)' }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Card({ children, accentColor, bg, className, topBorderColor }) {
  return (
    <div
      className={`rounded-lg p-8 mb-6 ${className || ''}`}
      style={{
        background: bg || 'var(--bg-card)',
        boxShadow: '0 2px 16px rgba(45, 94, 58, 0.10)',
        borderLeft: accentColor ? `4px solid ${accentColor}` : 'none',
        borderTop: topBorderColor ? `1px solid ${topBorderColor}` : undefined,
      }}
    >
      {children}
    </div>
  )
}

function CardTitle({ children, large }) {
  return (
    <h3
      className="mb-4"
      style={{
        fontFamily: "'DM Serif Display', serif",
        color: 'var(--text-heading)',
        fontWeight: 400,
        fontSize: large ? 19 : 18,
      }}
    >
      {children}
    </h3>
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
      <div className="text-xs font-medium uppercase mb-2" style={{ color: accentColor, letterSpacing: '0.06em' }}>{label} Impact</div>
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

function PhaseCard({ number, title, description, investment, highlight, subtext }) {
  return (
    <div
      className="flex-1 rounded-lg p-5"
      style={{
        background: highlight ? '#F0F4F1' : '#EDEADE',
        border: highlight ? '1.5px solid #2D5E3A' : '1.5px solid #D8D4C8',
        borderLeft: highlight ? '4px solid #2D5E3A' : '1.5px solid #D8D4C8',
        borderTop: highlight ? '2px solid #2D5E3A' : '1px solid #D8D4C8',
        boxShadow: highlight ? '0 2px 12px rgba(45,94,58,0.12)' : '0 1px 4px rgba(45,94,58,0.04)',
        minWidth: 0,
      }}
    >
      <div className="text-xs font-medium mb-1" style={{ color: highlight ? '#2D5E3A' : 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Phase {number}
      </div>
      <div className="font-medium mb-2" style={{ color: 'var(--text-heading)', fontFamily: "'DM Serif Display', serif", fontSize: highlight ? 16 : 14, fontWeight: 400 }}>
        {title}
      </div>
      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      <div className="text-xs font-medium" style={{ color: highlight ? '#2D5E3A' : '#888888' }}>
        Estimated investment: {investment}
      </div>
      {subtext && (
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {subtext}
        </div>
      )}
    </div>
  )
}

// A collapsible row with headline + optional dropdown trace
function TraceRow({ label, value, isOpen, onToggle, children, bg }) {
  return (
    <div className="rounded mb-2" style={{ background: bg || '#FAFAFA', padding: '10px 14px' }}>
      <div
        className="flex items-start justify-between gap-3"
        style={{ cursor: children ? 'pointer' : 'default' }}
        onClick={children ? onToggle : undefined}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
          <div className="font-medium text-sm mt-0.5" style={{ color: 'var(--text-heading)', fontFamily: 'ui-monospace, Consolas, monospace' }}>
            {value}
          </div>
        </div>
        {children && <ChevronIcon isOpen={isOpen} />}
      </div>
      {isOpen && children && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// Subsection with headline + chevron + collapsible content
function SubsectionBlock({ headline, isOpen, onToggle, children, accent }) {
  return (
    <div className="mb-4 rounded" style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{ background: accent ? '#F0F4F1' : '#FAFAFA', cursor: 'pointer' }}
        onClick={onToggle}
      >
        <span className="font-medium text-sm" style={{ color: 'var(--text-heading)', flex: 1 }}>{headline}</span>
        <ChevronIcon isOpen={isOpen} />
      </div>
      {isOpen && (
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
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

  const { pricing, roi, phase1 } = output
  const tr = roi.roiAvailable ? roi.calculationTrace : null

  const checkedTasks = tasks.filter((t) => t.included)
  const highTasks    = checkedTasks.filter((t) => t.impact === 'High')
  const mediumTasks  = checkedTasks.filter((t) => t.impact === 'Medium')
  const lowTasks     = checkedTasks.filter((t) => t.impact === 'Low')

  const phase1Label = `${formatCurrency(phase1.floor)} – ${formatCurrency(phase1.ceiling)}`
  const capabilities = CAPABILITIES[niche] || CAPABILITIES.other

  // Compute which capabilities to highlight based on Constantly tasks
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

  return (
    <div>

      {/* Section A — Company Snapshot */}
      <Card accentColor="#2D5E3A">
        <CardTitle large>Company Snapshot</CardTitle>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4">
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Industry</span>
            <div className="font-medium" style={{ color: 'var(--text-heading)', fontSize: 15 }}>{nicheLabel}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Annual Revenue</span>
            <div className="font-medium" style={{ color: 'var(--text-heading)', fontSize: 15 }}>{REVENUE_LABELS[company.revenueRange] || '—'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team Size</span>
            <div className="font-medium" style={{ color: 'var(--text-heading)', fontSize: 15 }}>{company.employees ? `${company.employees} employees` : '—'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Integration</span>
            <div className="font-medium" style={{ color: 'var(--text-heading)', fontSize: 14 }}>We connect directly to your existing tools, whatever you're already running.</div>
          </div>
        </div>
        <p className="text-sm italic" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          Based on what you've shared, here's where Somerset Systems sees the most meaningful opportunity.
        </p>
      </Card>

      {/* Section B — Operational Friction Areas */}
      <Card accentColor="#2D5E3A">
        <CardTitle>Where Your Team Is Losing Time</CardTitle>
        {checkedTasks.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No friction areas selected. Go back to Step 3 to check tasks.</p>
        ) : (
          <>
            <ImpactGroup label="High"   tasks={highTasks}   accentColor="#2D5E3A" />
            <ImpactGroup label="Medium" tasks={mediumTasks} accentColor="#1C1C1C" />
            <ImpactGroup label="Low"    tasks={lowTasks}    accentColor="var(--text-muted)" />
          </>
        )}
      </Card>

      {/* Section C — Where We See Opportunity */}
      <Card accentColor="#2D5E3A">
        <CardTitle>Where We See Opportunity</CardTitle>

        {!roi.roiAvailable ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select tasks in Step 3 to see estimated impact.</p>
        ) : (
          <>
            {/* ── Bucket 1: Operational Capacity ─────────────────────────── */}
            {roi.operationalAvailable && (
              <SubsectionBlock
                headline={`~${fmtK(roi.operationalFloor)} – ${fmtK(roi.operationalCeiling)} per year in operational capacity unlocked`}
                isOpen={!!open.operational}
                onToggle={() => toggle('operational')}
                accent
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#F0F4F1' }}>
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
                      <>
                        <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                          <td style={{ padding: '6px 8px', color: 'var(--text-body)' }}>{t.label}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {t.people}
                          </td>
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
                              title="Show calculation"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1, padding: 2 }}
                            >
                              {openTaskCalc === t.id ? '▲' : '▼'}
                            </button>
                          </td>
                        </tr>
                        {openTaskCalc === t.id && (
                          <tr key={`${t.id}-calc`} style={{ background: '#F0F4F1' }}>
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
                      </>
                    ))}
                    <tr style={{ background: '#F0F4F1', fontWeight: 600 }}>
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
                <p className="text-xs italic mt-3" style={{ color: 'var(--text-muted)' }}>
                  These ranges use conservative fully-loaded labor costs for admin ($25–$35/hr) and operations/management ($35–$60/hr) staff. Actual impact depends on current compensation, adoption, and workflow design.
                </p>
                {tr.isCapped && (
                  <div className="mt-3 rounded px-3 py-2 text-xs" style={{ background: '#F0F4F1', border: '1px solid #D8D4C8', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Cap applied:</strong> Hours scaled to {tr.hrCap} hrs/week — conservative ceiling based on your team size of {tr.numEmployees} employees. This reflects realistic automation coverage: a new system doesn't instantly capture 100% of available time savings.{' '}
                    <span style={{ fontFamily: 'ui-monospace, Consolas, monospace' }}>Formula: {tr.capFormula}.</span>
                  </div>
                )}
              </SubsectionBlock>
            )}

            {/* ── Bucket 2: Revenue Recovery ─────────────────────────────── */}
            {roi.revenueRecoverySignal && (
              <SubsectionBlock
                headline={
                  <span>
                    <span style={{ ...SIGNAL_STYLE[roi.revenueRecoverySignal], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, marginRight: 8 }}>
                      {roi.revenueRecoverySignal.charAt(0).toUpperCase() + roi.revenueRecoverySignal.slice(1)}
                    </span>
                    Revenue Recovery Opportunity
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

            {/* ── Bucket 3: Decision Quality ─────────────────────────────── */}
            {roi.showDecisionQuality && (
              <div className="mb-4 rounded px-4 py-3" style={{ border: '1px solid var(--border)', background: '#FAFAFA' }}>
                <div className="font-medium text-sm mb-2" style={{ color: 'var(--text-heading)' }}>
                  Strategic Visibility Benefits
                </div>
                <ul className="flex flex-col gap-1">
                  {roi.decisionQualityBenefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
                      <span style={{ color: '#2D5E3A', flexShrink: 0, marginTop: 1 }}>→</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="text-xs italic mt-2" style={{ color: 'var(--text-muted)' }}>
                  These benefits are real but hard to quantify. Better information leads to better decisions over time.
                </p>
              </div>
            )}

            {/* ── Payback ───────────────────────────────────────────────── */}
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

            {/* ── Year 1 ────────────────────────────────────────────────── */}
            {roi.operationalAvailable && tr.year1NetCeiling > 0 && (
              <TraceRow
                label="Estimated Year 1 net impact"
                value={fmtRange(tr.year1NetFloor, tr.year1NetCeiling)}
                isOpen={!!open.year1}
                onToggle={() => toggle('year1')}
                bg="#FAFAFA"
              >
                <div className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                  <div>Annual impact floor ({formatCurrency(tr.operationalFloor)}) − Phase 1 midpoint ({formatCurrency(Math.round(tr.phase1Midpoint))}) − ({formatCurrency(tr.monthlyMaintenance)} × 12 mo) = {formatCurrency(Math.round(tr.year1NetFloor))}</div>
                  <div className="mt-1">Annual impact ceiling ({formatCurrency(tr.operationalCeiling)}) − Phase 1 midpoint ({formatCurrency(Math.round(tr.phase1Midpoint))}) − ({formatCurrency(tr.monthlyMaintenance)} × 12 mo) = {formatCurrency(Math.round(tr.year1NetCeiling))}</div>
                </div>
              </TraceRow>
            )}

            {/* ── Year 2 ────────────────────────────────────────────────── */}
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

            {/* ── Assumptions ───────────────────────────────────────────── */}
            <p className="text-xs italic mt-4" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Estimates reflect potential value, not guaranteed outcomes. Actual results depend on software access, team adoption, workflow design, and current operational baseline. Revenue recovery impact is assessed qualitatively and not included in financial projections. Efficiency factors reflect the realistic share of each task that automation can capture. Not all time spent on a task is recoverable — human review, judgment calls, and edge cases remain part of every workflow.
            </p>
          </>
        )}
      </Card>

      {/* Section D — Recommended Implementation Phases */}
      <Card accentColor="#2D5E3A">
        <CardTitle>Recommended Implementation Phases</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <PhaseCard
            number={1}
            title="Pilot & Proof"
            description="One focused improvement to deliver fast value and build trust. We identify your single highest-impact friction point, build a targeted solution, and prove ROI before asking for full commitment."
            investment={phase1Label}
            highlight
          />
          <PhaseCard
            number={2}
            title="Operational Intelligence Layer"
            description="A full operational engagement scoped around your specific priorities. Any capability from the list below: cross-system reporting, AI-assisted insights, workflow automations, margin analysis, capacity forecasting, or any combination that addresses your most important pain points. Scoped and priced after Phase 1 proves the foundation."
            investment="Scoped after Phase 1, based on your specific needs and priorities."
          />
          <PhaseCard
            number={3}
            title="Ongoing Optimization"
            description="Monthly maintenance, new automations, additional integrations, and AI improvements as your business grows. Your system evolves with you."
            investment={roi.roiAvailable ? `~${formatCurrency(tr.monthlyMaintenance)}/month` : 'Typically 10% of Phase 1 investment per month'}
            subtext={roi.roiAvailable ? tr.phase1MaintenanceTrace : undefined}
          />
        </div>
        <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
          All Phase 1 engagements include a 30-day performance guarantee. If the solution doesn't perform as scoped within 30 days of delivery, we'll fix it at no additional cost, or refund your final payment. No questions asked.
        </p>
      </Card>

      {/* Section D.5 — What We Can Build For You */}
      <Card accentColor="#2D5E3A">
        <CardTitle>What We Can Build For You</CardTitle>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Every engagement is scoped around your specific needs. Below are the capabilities we deliver.
        </p>
        <div className="flex flex-col gap-3">
          {capabilities.map((cap) => {
            const isHighlighted = highlightedCaps.has(cap.title)
            return (
              <div
                key={cap.title}
                className="rounded-lg p-4"
                style={{
                  border: '1px solid var(--border)',
                  borderLeft: isHighlighted ? '3px solid #2D5E3A' : '1px solid var(--border)',
                  background: isHighlighted ? '#F0F4F1' : '#FAFAFA',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-medium text-sm flex-1" style={{ color: 'var(--text-heading)', fontFamily: "'DM Serif Display', serif" }}>
                    {cap.title}
                  </span>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {isHighlighted && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: '#2D5E3A', fontFamily: 'DM Sans, sans-serif' }}>
                        Recommended
                      </span>
                    )}
                    <span
                      style={{
                        ...TAG_STYLE[cap.tag],
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cap.tag}
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {cap.description}
                </p>
              </div>
            )
          })}
        </div>
        <p className="text-xs italic mt-4" style={{ color: 'var(--text-muted)' }}>
          We build on top of your existing software. All capabilities connect directly to the tools you already use. Your Phase 1 pilot addresses one or two of these. A full engagement can include any combination.
        </p>
      </Card>

      {/* Section E — Why This Fits Your Business */}
      <Card accentColor="#2D5E3A">
        <CardTitle>Why This Fits Your Business</CardTitle>
        <ul className="flex flex-col gap-2 mb-5">
          {[
            'Connects directly to your existing tools and software',
            'Nothing in your current workflow gets replaced or disrupted',
            'Built exclusively around your operations, not a generic template',
            'Designed to expand, with new automations and integrations as you grow',
          ].map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
              <span style={{ color: '#2D5E3A', flexShrink: 0, marginTop: 2 }}>→</span>
              {point}
            </li>
          ))}
        </ul>

        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <h4 className="mb-2 text-sm font-medium" style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-heading)', fontWeight: 400, fontSize: 15 }}>
            Where This Can Go
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
            Every engagement starts focused, one or two improvements, proven fast. But the infrastructure we build in Phase 1 is designed to grow. If you want it, a full operational layer is possible: one place where all your tools agree on the numbers that matter: revenue, utilization, capacity, margin, and pipeline.
          </p>
        </div>
      </Card>

      <div className="flex justify-between items-center mt-2">
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
