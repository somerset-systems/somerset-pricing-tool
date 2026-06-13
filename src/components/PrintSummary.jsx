import { formatCurrency, deriveTaskHours, LABOR_RATES } from '../utils/calculations.js'
import { CAPABILITIES } from '../data/niches.js'

const REVENUE_LABELS = {
  '<2m': 'Under $2M', '2-5m': '$2M–$5M', '5-10m': '$5M–$10M', '10m+': '$10M+',
}

const EFFICIENCY_LABELS = {
  0.80: '80% automatable. Minimal human judgment required.',
  0.75: '75% automatable. Light review still needed.',
  0.70: '70% automatable. Some coordination remains manual.',
  0.65: '65% automatable. Human oversight is part of the workflow.',
  0.55: '55% automatable. Significant judgment calls remain.',
}

function efficiencyLabel(ef) {
  return EFFICIENCY_LABELS[ef] || `${Math.round(ef * 100)}% automatable`
}

const s = {
  sectionTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 15, fontWeight: 400, color: 'var(--text-heading)', marginTop: 0, marginBottom: 10 },
  label:  { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  value:  { fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 2 },
  body:   { fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6, margin: 0 },
  muted:  { fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 },
  card:   { border: '1px solid var(--border)', borderTop: '3px solid var(--brand-green)', borderRadius: 6, padding: '16px 20px', marginBottom: 18, pageBreakInside: 'avoid', breakInside: 'avoid' },
  divider:{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 },
  formula:{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', padding: '0 8px 8px' },
}

const fmtK = (n) => {
  const abs = Math.abs(Math.round(n / 1000))
  return n < 0 ? `-$${abs}k` : `$${abs}k`
}
const fmtRange = (lo, hi) => {
  if (hi <= 0) return 'Below breakeven'
  return lo < 0 ? `below breakeven – ${fmtK(hi)}` : `${fmtK(lo)} – ${fmtK(hi)}`
}

const laborCategoryLabel = { admin: 'Admin', operations: 'Operations', owner: 'Owner' }
const laborRateLabel = (cat) => {
  const r = LABOR_RATES[cat] || LABOR_RATES.operations
  return `$${r.floor}–$${r.ceiling}/hr`
}

const TAG_ORDER = ['Operational Efficiency', 'Revenue Intelligence', 'Financial Clarity']

export default function PrintSummary({ output, company, niche, nicheLabel, tasks }) {
  if (!output) return null

  const { roi, phase1 } = output
  const tr = roi.roiAvailable ? roi.calculationTrace : null
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const checkedTasks = (tasks || []).filter((t) => t.included)
  const highTasks   = checkedTasks.filter((t) => t.impact === 'High')
  const mediumTasks = checkedTasks.filter((t) => t.impact === 'Medium')
  const lowTasks    = checkedTasks.filter((t) => t.impact === 'Low')

  const phase1Label = `${formatCurrency(phase1.floor)} – ${formatCurrency(phase1.ceiling)}`
  const capabilities = CAPABILITIES[niche] || CAPABILITIES.other

  const capsByTag = {}
  TAG_ORDER.forEach(tag => {
    const filtered = capabilities.filter(c => c.tag === tag)
    if (filtered.length > 0) capsByTag[tag] = filtered
  })

  return (
    <div className="print-only" style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text-heading)', maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, paddingBottom: 14, borderBottom: '2px solid var(--brand-green)' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 400, color: 'var(--brand-green)', margin: 0 }}>Somerset Systems</h1>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Operational Opportunity Assessment</div>
        </div>
        <img src="/somerset-icon.png" alt="Somerset Systems" style={{ height: 44, opacity: 0.85 }} onError={(e) => { e.target.style.display = 'none' }} />
      </div>

      {/* Section A — Company Snapshot */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>Company Snapshot</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px', marginBottom: 10 }}>
          <div><div style={s.label}>Industry</div><div style={s.value}>{nicheLabel}</div></div>
          <div><div style={s.label}>Annual Revenue</div><div style={s.value}>{REVENUE_LABELS[company.revenueRange] || '—'}</div></div>
          <div><div style={s.label}>Team Size</div><div style={s.value}>{company.employees ? `${company.employees} employees` : '—'}</div></div>
          <div><div style={s.label}>Integration</div><div style={s.value}>We connect directly to your existing tools, whatever you're already running.</div></div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>Prepared {today}</div>
        <p style={{ ...s.muted, marginTop: 8 }}>
          Based on what you've shared, here's where Somerset Systems sees the most meaningful opportunity.
        </p>
      </div>

      {/* Section B — Operational Friction Areas */}
      {checkedTasks.length > 0 && (
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Where Your Team Is Losing Time</h2>
          {[['High', highTasks, 'var(--brand-green)'], ['Medium', mediumTasks, 'var(--text-heading)'], ['Low', lowTasks, 'var(--text-muted)']].map(([lvl, group, color]) =>
            group.length === 0 ? null : (
              <div key={lvl} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{lvl} Impact</div>
                {group.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-body)', padding: '4px 0', borderBottom: '1px solid var(--border)', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <span>{t.label || '(unnamed task)'}</span>
                    <span style={{ fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{deriveTaskHours(t)} hrs/wk</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Section C — Where We See Opportunity */}
      <div style={{ ...s.card, pageBreakBefore: 'always', breakBefore: 'page' }}>
        <h2 style={s.sectionTitle}>Where We See Opportunity</h2>
        {!roi.roiAvailable ? (
          <p style={s.muted}>No impact data. Select tasks in Step 3 to see estimated impact.</p>
        ) : (
          <>
            {roi.operationalAvailable && (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 6 }}>
                  Operational Capacity Unlocked: ~{fmtK(roi.operationalFloor)} – {fmtK(roi.operationalCeiling)} per year
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-active)' }}>
                      <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500 }}>Task</th>
                      <th style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>Staff</th>
                      <th style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>Eff. Hrs/wk</th>
                      <th style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>Category</th>
                      <th style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>Rate</th>
                      <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500 }}>Annual Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tr.operationalTasks.map((t, i) => (
                      <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg-raised)', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        <td style={{ padding: '4px 6px', color: 'var(--text-body)' }}>
                          {t.label}
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 1 }}>
                            {t.rawHours} hrs/wk raw × {t.efficiencyFactor} efficiency = {Math.round(t.effectiveHours * 10) / 10} hrs automatable ({efficiencyLabel(t.efficiencyFactor)})
                          </div>
                        </td>
                        <td style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t.people}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {Math.round(t.scaledHours * 10) / 10}
                        </td>
                        <td style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--text-secondary)' }}>{laborCategoryLabel[t.laborCategory] || t.laborCategory}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{laborRateLabel(t.laborCategory)}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                          {formatCurrency(t.annualFloor)} – {formatCurrency(t.annualCeiling)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--bg-active)', fontWeight: 600 }}>
                      <td colSpan={2} style={{ padding: '4px 6px', color: 'var(--text-heading)', fontSize: 10 }}>Total{tr.isCapped ? ` (scaled to ${tr.hrCap} hrs/wk)` : ''}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>{Math.round(tr.totalScaledHours * 10) / 10} hrs/wk</td>
                      <td colSpan={2} />
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {formatCurrency(tr.operationalFloor)} – {formatCurrency(tr.operationalCeiling)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style={{ ...s.muted, fontSize: 10, marginBottom: 8 }}>
                  Efficiency factors reflect the realistic share of each task that automation can capture. Not all time spent on a task is recoverable; human review, judgment calls, and edge cases remain part of every workflow.
                </p>

                {tr.paybackFloorWeeks !== null && (
                  <div style={{ fontSize: 11, marginBottom: 6, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <strong>Payback window:</strong> ~{tr.paybackFloorWeeks} – {tr.paybackCeilingWeeks} weeks
                    <div style={s.formula}>
                      Phase 1 floor ({formatCurrency(tr.phase1Floor)}) ÷ weekly operational value ({formatCurrency(Math.round(tr.weeklyOperationalValue))}/wk) = {tr.paybackFloorWeeks} wks •{' '}
                      Phase 1 ceiling ({formatCurrency(tr.phase1Ceiling)}) ÷ {formatCurrency(Math.round(tr.weeklyOperationalValue))}/wk = {tr.paybackCeilingWeeks} wks
                    </div>
                  </div>
                )}

                {tr.year1NetCeiling > 0 && (
                  <div style={{ fontSize: 11, marginBottom: 6, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <strong>Estimated Year 1 net impact:</strong> {fmtRange(tr.year1NetFloor, tr.year1NetCeiling)}
                    <div style={s.formula}>
                      Floor: {formatCurrency(tr.operationalFloor)} − {formatCurrency(Math.round(tr.phase1Midpoint))} − ({formatCurrency(tr.monthlyMaintenance)} × 12) = {formatCurrency(Math.round(tr.year1NetFloor))}{' '}•{' '}
                      Ceiling: {formatCurrency(tr.operationalCeiling)} − {formatCurrency(Math.round(tr.phase1Midpoint))} − ({formatCurrency(tr.monthlyMaintenance)} × 12) = {formatCurrency(Math.round(tr.year1NetCeiling))}
                    </div>
                  </div>
                )}

                {tr.year2NetCeiling > 0 && (
                  <div style={{ fontSize: 11, marginBottom: 6, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <strong>Estimated Year 2 net impact:</strong> {fmtRange(tr.year2NetFloor, tr.year2NetCeiling)}
                    <div style={s.formula}>
                      Floor: {formatCurrency(tr.operationalFloor)} − ({formatCurrency(tr.monthlyMaintenance)} × 12) = {formatCurrency(Math.round(tr.year2NetFloor))}{' '}•{' '}
                      Ceiling: {formatCurrency(tr.operationalCeiling)} − ({formatCurrency(tr.monthlyMaintenance)} × 12) = {formatCurrency(Math.round(tr.year2NetCeiling))}
                    </div>
                  </div>
                )}
              </>
            )}

            {roi.revenueRecoverySignal && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>
                  Revenue Recovery Opportunity: {roi.revenueRecoverySignal.charAt(0).toUpperCase() + roi.revenueRecoverySignal.slice(1)} Signal
                </div>
                <p style={s.body}>{roi.revenueRecoveryNote}</p>
                <p style={{ ...s.muted, marginTop: 4 }}>Revenue recovery is assessed qualitatively and is not included in financial projections.</p>
              </div>
            )}

            {roi.showDecisionQuality && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>Strategic Visibility Benefits</div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {roi.decisionQualityBenefits.map((b) => (
                    <li key={b} style={{ fontSize: 12, color: 'var(--text-body)', display: 'flex', gap: 6, marginBottom: 3 }}>
                      <span style={{ color: 'var(--brand-green)', flexShrink: 0 }}>→</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p style={{ ...s.muted, marginTop: 10, fontSize: 10 }}>
              Conservative fully-loaded labor cost ranges used: admin ($25–$35/hr), operations ($35–$60/hr). Estimates reflect potential value, not guaranteed outcomes.
            </p>
          </>
        )}
      </div>

      {/* Section D — Recommended Implementation Phases (always starts fresh page) */}
      <div style={{ ...s.card, pageBreakBefore: 'always', breakBefore: 'page' }}>
        <h2 style={s.sectionTitle}>Recommended Implementation Phases</h2>
        {[
          { n: 1, title: 'Pilot & Proof', desc: 'One focused improvement to deliver fast value and build trust. We identify your single highest-impact friction point, build a targeted solution, and prove ROI before asking for full commitment.', investment: phase1Label },
          { n: 2, title: 'Operational Intelligence Layer', desc: 'A full operational engagement scoped around your specific priorities. Any capability from the list below: cross-system reporting, AI-assisted insights, workflow automations, margin analysis, capacity forecasting, or any combination that addresses your most important pain points. Scoped and priced after Phase 1 proves the foundation.', investment: 'Scoped after Phase 1, based on your specific needs and priorities.' },
          { n: 3, title: 'Ongoing Optimization', desc: 'Monthly maintenance, new automations, additional integrations, and AI improvements as your business grows. Your system evolves with you.', investment: tr ? `~${formatCurrency(tr.monthlyMaintenance)}/month` : 'Typically 10% of Phase 1 investment per month', investmentNote: tr ? tr.phase1MaintenanceTrace : undefined },
        ].map(({ n, title, desc, investment, investmentNote }) => (
          <div key={n} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: n < 3 ? '1px solid var(--border)' : 'none', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <div style={{ fontSize: 10, color: n === 1 ? 'var(--brand-green)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Phase {n}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 3 }}>{title}</div>
            <p style={s.body}>{desc}</p>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-green)', marginTop: 4 }}>Estimated investment: {investment}</div>
            {investmentNote && (
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>{investmentNote}</div>
            )}
          </div>
        ))}
        <p style={s.muted}>
          All Phase 1 engagements include a 30-day performance guarantee. If the solution doesn't perform as scoped within 30 days of delivery, we'll fix it at no additional cost, or refund your final payment. No questions asked.
        </p>
      </div>

      {/* Section D.5 — What We Can Build For You */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>What We Can Build For You</h2>
        <p style={{ ...s.body, marginBottom: 12 }}>
          Every engagement is scoped around your specific needs. Below are the capabilities we deliver.
        </p>

        {TAG_ORDER.map(tag => {
          const caps = capsByTag[tag]
          if (!caps) return null
          return (
            <div key={tag} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 5, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
                {tag}
              </div>
              {caps.map((cap) => (
                <div key={cap.title} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid #E8E8E4', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 2 }}>
                    {cap.title}
                  </div>
                  <p style={{ ...s.body, fontSize: 11, lineHeight: 1.5 }}>{cap.description}</p>
                </div>
              ))}
            </div>
          )
        })}

        <p style={{ ...s.muted, textAlign: 'center', marginTop: 4 }}>
          We build on top of your existing software. All capabilities connect directly to the tools you already use. Your Phase 1 pilot addresses one or two of these. A full engagement can include any combination.
        </p>
      </div>

      {/* Section E — Why This Fits */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>Why This Fits Your Business</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 14 }}>
          {[
            { label: 'Connects to your stack', desc: "Integrates directly with whatever tools you're already running. No replacements." },
            { label: 'Nothing disrupted', desc: 'Your existing workflows stay intact. We build capability on top.' },
            { label: 'Built only for you', desc: 'Every build is scoped around your specific operations, not a template.' },
            { label: 'Grows with you', desc: 'Phase 1 infrastructure is designed to expand as your priorities evolve.' },
          ].map(pt => (
            <div key={pt.label} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 2 }}>{pt.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-body)', lineHeight: 1.5 }}>{pt.desc}</div>
            </div>
          ))}
        </div>
        <div style={s.divider}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 5px' }}>Where This Can Go</h3>
          <p style={{ ...s.body, fontSize: 11 }}>
            Every engagement starts focused, one or two improvements, proven fast. But the infrastructure we build in Phase 1 is designed to grow. If you want it, a full operational layer is possible: one place where all your tools agree on the numbers that matter: revenue, utilization, capacity, margin, and pipeline.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Prepared by Somerset Systems</span>
        <span>somersetsystems.co</span>
      </div>
    </div>
  )
}
