import { useState } from 'react'
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

export default function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [niche, setNiche] = useState(null)
  const [nicheLabel, setNicheLabel] = useState('')
  const [company, setCompany] = useState({
    revenueRange: '',
    employees: '',
    billableStaff: '',
    ownerOperated: null,
    yearsInBusiness: '',
  })
  const [tasks, setTasks] = useState([])
  const [customTasks, setCustomTasks] = useState([])
  const [output, setOutput] = useState(null)

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

  function handleNext() {
    if (currentStep === 3) {
      const allTasks = [...tasks, ...customTasks]
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

  const allTasksForOutput = [...tasks, ...customTasks]

  return (
    <>
    <div className="no-print min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="mx-auto px-6 pt-8 pb-8" style={{ maxWidth: 720 }}>

        {/* Persistent header */}
        <div
          className="flex items-center gap-3 pb-6 mb-6"
          style={{ borderBottom: '1px solid #D8D4C8' }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#2D5E3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            SS
          </div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 400, color: '#2D5E3A', lineHeight: 1.2 }}>
              Somerset Systems
            </div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#5A5A5A', marginTop: 2 }}>
              Operational Opportunity Assessment
            </div>
          </div>
        </div>

        <StepIndicator currentStep={currentStep} />

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

      </div>
    </div>
    <PrintSummary output={output} company={company} niche={niche} nicheLabel={nicheLabel} tasks={allTasksForOutput} />
    </>
  )
}
