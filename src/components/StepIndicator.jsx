const STEPS = [
  { number: 1, label: 'Niche' },
  { number: 2, label: 'Company' },
  { number: 3, label: 'Friction' },
  { number: 4, label: 'Assessment' },
]

export default function StepIndicator({ currentStep }) {
  return (
    <nav aria-label="Progress" className="flex items-center justify-center mb-10">
      {STEPS.map((step, idx) => {
        const isCompleted = step.number < currentStep
        const isActive = step.number === currentStep

        const BASE_CIRCLE = { width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }
        let circleStyle = {}

        if (isCompleted) {
          circleStyle = { ...BASE_CIRCLE, background: 'var(--text-heading)', color: 'var(--bg-card)' }
        } else if (isActive) {
          circleStyle = { ...BASE_CIRCLE, background: 'var(--brand-green)', color: 'var(--bg-card)' }
        } else {
          circleStyle = { ...BASE_CIRCLE, background: 'var(--bg-card)', border: '1.5px solid var(--border)', color: 'var(--text-muted)' }
        }

        const lineColor = isCompleted ? 'var(--brand-green)' : 'var(--border)'

        return (
          <div key={step.number} className="flex items-center">
            <div
              className="flex flex-col items-center"
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className="flex items-center justify-center text-sm font-medium"
                style={circleStyle}
                aria-hidden="true"
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className="mt-1"
                style={{ color: isActive ? 'var(--brand-green)' : isCompleted ? 'var(--text-heading)' : 'var(--text-muted)', fontSize: 11, display: 'block' }}
              >
                {step.label}
                {isCompleted && <span className="sr-only"> (completed)</span>}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                aria-hidden="true"
                className="mx-1 sm:mx-2"
                style={{ width: 32, height: 2, background: lineColor, flexShrink: 0 }}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
