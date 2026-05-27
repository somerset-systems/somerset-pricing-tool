const STEPS = [
  { number: 1, label: 'Niche' },
  { number: 2, label: 'Company' },
  { number: 3, label: 'Friction' },
  { number: 4, label: 'Assessment' },
]

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, idx) => {
        const isCompleted = step.number < currentStep
        const isActive = step.number === currentStep

        let circleStyle = {}
        const circleClass = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0'

        if (isCompleted) {
          circleStyle = { background: '#1C1C1C', color: '#fff' }
        } else if (isActive) {
          circleStyle = { background: '#2D5E3A', color: '#fff' }
        } else {
          circleStyle = { background: '#fff', border: '1.5px solid #2D5E3A', color: 'var(--text-muted)' }
        }

        const lineColor = isCompleted ? '#1C1C1C' : '#D1D5DB'

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={circleClass} style={circleStyle}>
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className="mt-1 text-xs hidden sm:block"
                style={{ color: isActive ? '#2D5E3A' : isCompleted ? '#1C1C1C' : 'var(--text-muted)' }}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className="mx-1 sm:mx-2"
                style={{ width: 32, height: 2, background: lineColor, flexShrink: 0 }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
