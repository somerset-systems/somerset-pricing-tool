const STEPS = [
  { number: 1, label: 'Industry' },
  { number: 2, label: 'Company' },
  { number: 3, label: 'Operations' },
  { number: 4, label: 'Assessment' },
]

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <nav aria-label="Progress" className="flex items-center justify-center mb-10">
      {STEPS.map((step, idx) => {
        const isCompleted = step.number < currentStep
        const isActive = step.number === currentStep
        const isNavigable = isCompleted && typeof onStepClick === 'function'

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

        const StepTag = isNavigable ? 'button' : 'div'
        const stepProps = isNavigable
          ? {
              type: 'button',
              onClick: () => onStepClick(step.number),
              'aria-label': `Go back to step ${step.number}: ${step.label}`,
              style: { background: 'none', border: 'none', padding: 0, cursor: 'pointer' },
            }
          : { 'aria-current': isActive ? 'step' : undefined }

        return (
          <div key={step.number} className="flex items-center">
            <StepTag className="flex flex-col items-center" {...stepProps}>
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
                {isCompleted && <span className="sr-only"> (completed, click to return)</span>}
              </span>
            </StepTag>

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
