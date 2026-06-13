import { useState, useEffect } from 'react'
import { TASK_LISTS } from './data/niches.js'
import { calculatePricing, calculateROI, calculatePhase1Range, calculatePhase1Maintenance } from './utils/calculations.js'
import StepIndicator from './components/StepIndicator.jsx'
import NicheSelector from './components/NicheSelector.jsx'
import CompanyProfile from './components/CompanyProfile.jsx'
import TaskAudit from './components/TaskAudit.jsx'
import OutputPanel from './components/OutputPanel.jsx'
import PrintSummary from './components/PrintSummary.jsx'

function initTasks(nicheId) {
  return (TASK_LISTS[nicheId] || []).map((t) => ({
    id: t.id,
    label: t.label,
    impact: t.impact,
    laborCategory: t.laborCategory,
    valueBucket: t.valueBucket,
    efficiencyFactor: t.efficiencyFactor || 0.65,
    included: false,
    people: 2,
    frequency: 'Regularly',
  }))
}

// In-progress sessions are kept in the salesperson's own browser so an accidental
// refresh or tab switch mid-call doesn't wipe the prep. Client-side only; no server.
const STORAGE_KEY = 'somerset-pricing-tool-v1'
const EMPTY_COMPANY = { revenueRange: '', employees: '', billableStaff: '', ownerOperated: null, yearsInBusiness: '' }

function loadSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const saved = loadSession()

  const [currentStep, setCurrentStep] = useState(saved?.currentStep ?? 1)
  const [niche, setNiche] = useState(saved?.niche ?? null)
  const [nicheLabel, setNicheLabel] = useState(saved?.nicheLabel ?? '')
  const [company, setCompany] = useState(saved?.company ?? { ...EMPTY_COMPANY })
  const [tasks, setTasks] = useState(saved?.tasks ?? [])
  const [customTasks, setCustomTasks] = useState(saved?.customTasks ?? [])
  const [output, setOutput] = useState(saved?.output ?? null)

  // Persist the working session on every change.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentStep, niche, nicheLabel, company, tasks, customTasks, output })
      )
    } catch {
      /* storage unavailable (private mode / quota) — fall back to in-memory only */
    }
  }, [currentStep, niche, nicheLabel, company, tasks, customTasks, output])

  function handleReset() {
    if (typeof window !== 'undefined' && !window.confirm('Start a new assessment? This clears everything you\'ve entered.')) return
    try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    setCurrentStep(1)
    setNiche(null)
    setNicheLabel('')
    setCompany({ ...EMPTY_COMPANY })
    setTasks([])
    setCustomTasks([])
    setOutput(null)
  }

  function handleStepClick(stepNumber) {
    // Only completed steps are clickable (guaranteed by StepIndicator), so this only goes back.
    if (stepNumber < currentStep) setCurrentStep(stepNumber)
  }

  function handleNicheSelect(id, label) {
    setNiche(id)
    setNicheLabel(label)
    setTasks(initTasks(id))
  }

  function handleCompanyChange(field, value) {
    setCompany((prev) => ({ ...prev, [field]: value }))
  }

  function handleTaskChange(taskId, field, value) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t))
    )
  }

  function handleCustomTaskAdd() {
    setCustomTasks((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        label: '',
        impact: 'Medium',
        laborCategory: 'operations',
        valueBucket: 'operational',
        efficiencyFactor: 0.65,
        included: true,
        people: 2,
        frequency: 'Regularly',
      },
    ])
  }

  function handleCustomTaskChange(id, field, value) {
    setCustomTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  function handleCustomTaskRemove(id) {
    setCustomTasks((prev) => prev.filter((t) => t.id !== id))
  }

  // Custom rows the user added but never named are noise — keep them out of the math and the output.
  const namedCustomTasks = customTasks.filter((t) => t.label.trim() !== '')

  function handleNext() {
    if (currentStep === 3) {
      const allTasks = [...tasks, ...namedCustomTasks]
      const pricing = calculatePricing({ revenueRange: company.revenueRange })
      const phase1 = calculatePhase1Range({ revenueRange: company.revenueRange })
      const phase1Maintenance = calculatePhase1Maintenance(phase1)
      const roi = calculateROI({
        tasks: allTasks,
        monthlyMaintenance: phase1Maintenance,
        phase1,
        employees: company.employees,
        yearsInBusiness: company.yearsInBusiness,
      })
      setOutput({ pricing, roi, phase1 })
    }
    setCurrentStep((s) => Math.min(s + 1, 4))
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  const allTasksForOutput = [...tasks, ...namedCustomTasks]

  return (
    <>
    <style>{`
      .btn-primary { transition: background 0.12s; }
      .btn-primary:hover { background: var(--brand-green-lt) !important; }
      .btn-secondary { transition: background 0.12s; }
      .btn-secondary:hover { background: var(--bg-active) !important; }
      .btn-reset { transition: background 0.12s, color 0.12s; }
      .btn-reset:hover { background: var(--bg-active) !important; color: var(--text-body) !important; }
      .navlink { transition: background 0.12s, border-color 0.12s; }
      .navlink:hover { background: var(--bg-active) !important; border-color: var(--border) !important; }
      .freq-btn-inactive { transition: border-color 0.1s, color 0.1s; }
      .freq-btn-inactive:hover { border-color: var(--brand-green) !important; color: var(--brand-green) !important; }
      .input-field:focus, .select-field:focus {
        border-color: var(--brand-green) !important;
        box-shadow: 0 0 0 3px rgba(45, 94, 58, 0.12) !important;
        outline: none !important;
      }
    `}</style>
    <div className="no-print min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="mx-auto px-6 pt-8 pb-8" style={{ maxWidth: currentStep === 4 ? 940 : 720 }}>

        {/* Persistent header */}
        <div
          className="flex flex-wrap items-center gap-4 pb-6 mb-6"
          style={{ borderBottom: '1px solid #D8D4C8' }}
        >
          <img
            src="/somerset-logo-horizontal.png"
            alt="Somerset Systems"
            width={180}
            height={48}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            style={{ height: 48, width: 'auto', flexShrink: 0, objectFit: 'contain' }}
          />
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, borderLeft: '1px solid #D8D4C8' }}>
            Operational Opportunity Assessment
          </div>
          {(niche || currentStep > 1) && (
            <button
              type="button"
              onClick={handleReset}
              className="btn-reset"
              style={{
                marginLeft: 'auto', flexShrink: 0, background: 'transparent', border: 'none',
                color: 'var(--text-muted)', font: '500 12px DM Sans', cursor: 'pointer',
                padding: '6px 8px', borderRadius: 5,
              }}
            >
              Start over
            </button>
          )}
        </div>

        <StepIndicator currentStep={currentStep} onStepClick={handleStepClick} />

        <main>
        {currentStep === 1 && (
          <NicheSelector
            niche={niche}
            nicheLabel={nicheLabel}
            onSelect={handleNicheSelect}
            onContinue={handleNext}
          />
        )}
        {currentStep === 2 && (
          <CompanyProfile
            company={company}
            niche={niche}
            onChange={handleCompanyChange}
            onBack={handleBack}
            onContinue={handleNext}
          />
        )}
        {currentStep === 3 && (
          <TaskAudit
            tasks={tasks}
            customTasks={customTasks}
            onTaskChange={handleTaskChange}
            onCustomTaskAdd={handleCustomTaskAdd}
            onCustomTaskChange={handleCustomTaskChange}
            onCustomTaskRemove={handleCustomTaskRemove}
            onBack={handleBack}
            onContinue={handleNext}
          />
        )}
        {currentStep === 4 && (
          <OutputPanel
            output={output}
            company={company}
            niche={niche}
            nicheLabel={nicheLabel}
            tasks={allTasksForOutput}
            onBack={handleBack}
            onPrint={() => window.print()}
          />
        )}
        </main>

      </div>
    </div>
    <PrintSummary output={output} company={company} niche={niche} nicheLabel={nicheLabel} tasks={allTasksForOutput} />
    </>
  )
}
