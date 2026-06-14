import { useState, useRef, useId } from 'react'

const IMPACT_STYLE = {
  High:   { background: 'var(--brand-green)', color: 'var(--bg-card)' },
  Medium: { background: 'var(--text-heading)', color: 'var(--bg-card)' },
  Low:    { background: 'var(--badge-low)', color: 'var(--bg-card)' },
}

const IMPACT_ORDER = { High: 0, Medium: 1, Low: 2 }

const IMPACT_TOOLTIPS = {
  High:   'High revenue impact. Automating this directly affects what you close or retain.',
  Medium: 'Medium impact. Meaningful time savings, lower direct revenue risk.',
  Low:    'Lower impact. Useful to automate but limited effect on top-line results.',
}

const FREQ_OPTIONS = ['Occasionally', 'Regularly', 'Constantly']

const FREQ_TOOLTIPS = {
  Occasionally: '1 hr/week per staff member',
  Regularly:    '3 hrs/week per staff member',
  Constantly:   '6 hrs/week per staff member',
}

const inputStyle = {
  border: '1.5px solid var(--border)',
  borderRadius: 5,
  padding: '8px',
  minHeight: 40,
  boxSizing: 'border-box',
  font: '400 14px DM Sans',
  color: 'var(--text-heading)',
  background: 'var(--bg-card)',
  outline: 'none',
  width: 56,
  textAlign: 'center',
}

// Dismiss a focus-triggered tooltip with Escape (WCAG 1.4.13) by dropping focus.
function dismissOnEscape(e) {
  if (e.key === 'Escape') e.currentTarget.blur()
}

function ImpactBadge({ level }) {
  const tipId = useId()
  return (
    <button
      type="button"
      className="impact-badge flex-shrink-0"
      aria-describedby={tipId}
      onClick={(e) => e.preventDefault()}
      onKeyDown={dismissOnEscape}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'help', font: 'inherit' }}
    >
      <span
        style={{
          ...IMPACT_STYLE[level],
          padding: '3px 9px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.03em',
        }}
      >
        {level}
      </span>
      <div className="impact-badge-tooltip" role="tooltip" id={tipId}>{IMPACT_TOOLTIPS[level]}</div>
    </button>
  )
}

function CustomCheckbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="task-checkbox"
    />
  )
}

// People input: type=text so user can select-all and retype freely.
// Commits parsed integer to parent only on blur; shows empty string while editing.
function PeopleInput({ id, people, onPeopleChange }) {
  const [local, setLocal] = useState(String(people))

  function handleChange(e) {
    const raw = e.target.value
    if (raw === '' || /^\d+$/.test(raw)) setLocal(raw)
  }

  function handleBlur() {
    const parsed = parseInt(local, 10)
    if (!isNaN(parsed) && parsed >= 1) {
      onPeopleChange(parsed)
      setLocal(String(parsed))
    } else {
      setLocal(String(people))
    }
  }

  return (
    <input
      id={id}
      type="text"
      value={local}
      placeholder="2"
      onChange={handleChange}
      onBlur={handleBlur}
      className="input-field"
      style={inputStyle}
    />
  )
}

function PeopleFreqControls({ people, frequency, onPeopleChange, onFreqChange, staffInputId }) {
  const tipBase = useId()
  const btnBase = {
    padding: '0 10px',
    minHeight: 44,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    lineHeight: 1,
  }
  const active   = { ...btnBase, background: 'var(--brand-green)', color: 'var(--bg-card)', border: '1.5px solid var(--brand-green)' }
  const inactive = { ...btnBase, background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)' }

  return (
    <div className="flex flex-wrap gap-3 items-center mt-2 ml-7">
      <div className="flex items-center gap-1.5">
        <label htmlFor={staffInputId} className="text-xs" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          Staff affected:
        </label>
        <PeopleInput id={staffInputId} people={people} onPeopleChange={onPeopleChange} />
      </div>

      <fieldset style={{ border: 0, margin: 0, padding: 0, minInlineSize: 0 }} className="flex items-center gap-1.5">
        <legend className="text-xs" style={{ color: 'var(--text-muted)', flexShrink: 0, padding: 0 }}>How often:</legend>
        <div className="flex gap-1">
          {FREQ_OPTIONS.map((opt) => {
            const tipId = `${tipBase}-${opt}`
            return (
              <div key={opt} className="freq-btn-wrapper">
                <button
                  type="button"
                  onClick={() => onFreqChange(opt)}
                  onKeyDown={dismissOnEscape}
                  aria-pressed={frequency === opt}
                  aria-describedby={tipId}
                  className={frequency === opt ? '' : 'freq-btn-inactive'}
                  style={frequency === opt ? active : inactive}
                >
                  {opt}
                </button>
                <div className="freq-btn-tooltip" role="tooltip" id={tipId}>{FREQ_TOOLTIPS[opt]}</div>
              </div>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

const LABOR_CATEGORY_OPTIONS = [
  { value: 'admin',      label: 'Admin ($25–35/hr)' },
  { value: 'operations', label: 'Operations ($35–60/hr)' },
  { value: 'owner',      label: 'Owner ($75–150/hr)' },
]

const VALUE_BUCKET_OPTIONS = [
  { value: 'operational',        label: 'Operational Efficiency' },
  { value: 'revenue_recovery',   label: 'Revenue Recovery' },
]

export default function TaskAudit({
  tasks,
  customTasks,
  onTaskChange,
  onCustomTaskAdd,
  onCustomTaskChange,
  onCustomTaskRemove,
  onBack,
  onContinue,
}) {
  // Sort once on mount by impact only — never re-sorts on staff/frequency changes.
  const canGenerate = tasks.some((t) => t.included) || customTasks.length > 0

  const sortedOrderRef = useRef(null)
  if (sortedOrderRef.current === null) {
    sortedOrderRef.current = [...tasks]
      .sort((a, b) => (IMPACT_ORDER[a.impact] ?? 1) - (IMPACT_ORDER[b.impact] ?? 1))
      .map((t) => t.id)
  }
  const sortedTasks = sortedOrderRef.current
    .map((id) => tasks.find((t) => t.id === id))
    .filter(Boolean)

  return (
    <div
      className="rounded-lg p-8"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-panel)' }}
    >
      <h1
        className="text-2xl mb-2"
        style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-heading)', fontWeight: 400, textWrap: 'balance' }}
      >
        Where Is Your Team Losing Time?
      </h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Check each area where your team manually handles work. Enter how many staff are involved and how often.
      </p>

      {/* Built-in tasks */}
      <div>
        {sortedTasks.map((task, idx) => (
          <div
            key={task.id}
            style={{
              background: task.included ? 'var(--bg-active)' : 'transparent',
              borderBottom: idx < sortedTasks.length - 1 || customTasks.length > 0 ? '1px solid var(--border)' : 'none',
              padding: '12px 32px',
              margin: '0 -32px',
              transition: 'background 0.15s',
            }}
          >
            <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
              <CustomCheckbox
                checked={task.included}
                onChange={(val) => onTaskChange(task.id, 'included', val)}
              />
              <span className="flex-1 text-sm" style={{ color: 'var(--text-body)', font: '400 15px DM Sans' }}>
                {task.label}
              </span>
              <ImpactBadge level={task.impact} />
            </label>
            {task.included && (
              <PeopleFreqControls
                staffInputId={`staff-${task.id}`}
                people={task.people}
                frequency={task.frequency}
                onPeopleChange={(v) => onTaskChange(task.id, 'people', v)}
                onFreqChange={(v) => onTaskChange(task.id, 'frequency', v)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Custom tasks */}
      {customTasks.length > 0 && (
        <div className="mt-2">
          {customTasks.map((task, idx) => (
            <div
              key={task.id}
              style={{
                background: 'var(--bg-active)',
                borderBottom: idx < customTasks.length - 1 ? '1px solid var(--border)' : 'none',
                padding: '12px 32px',
                margin: '0 -32px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={task.label}
                    onChange={(e) => onCustomTaskChange(task.id, 'label', e.target.value)}
                    placeholder="Describe this task…"
                    className="input-field"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: '1.5px solid var(--border)',
                      borderRadius: 5,
                      padding: '8px 10px',
                      minHeight: 40,
                      boxSizing: 'border-box',
                      font: '400 14px DM Sans',
                      color: 'var(--text-heading)',
                      background: 'var(--bg-card)',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onCustomTaskRemove(task.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: 18,
                      lineHeight: 1,
                      padding: 0,
                      minWidth: 40,
                      minHeight: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    aria-label="Remove task"
                  >
                    ×
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={task.laborCategory}
                    onChange={(e) => onCustomTaskChange(task.id, 'laborCategory', e.target.value)}
                    aria-label="Labor category"
                    title="Sets the hourly labor rate used in the ROI calculation"
                    className="select-field"
                    style={{
                      border: '1.5px solid var(--border)',
                      borderRadius: 5,
                      padding: '8px',
                      minHeight: 40,
                      font: '400 13px DM Sans',
                      color: 'var(--text-heading)',
                      background: 'var(--bg-card)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {LABOR_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    value={task.valueBucket}
                    onChange={(e) => onCustomTaskChange(task.id, 'valueBucket', e.target.value)}
                    aria-label="Value type"
                    title="Determines which ROI bucket this task contributes to"
                    className="select-field"
                    style={{
                      border: '1.5px solid var(--border)',
                      borderRadius: 5,
                      padding: '8px',
                      minHeight: 40,
                      font: '400 13px DM Sans',
                      color: 'var(--text-heading)',
                      background: 'var(--bg-card)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {VALUE_BUCKET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ImpactBadge level="Medium" />
                </div>
              </div>
              <PeopleFreqControls
                staffInputId={`staff-${task.id}`}
                people={task.people}
                frequency={task.frequency}
                onPeopleChange={(v) => onCustomTaskChange(task.id, 'people', v)}
                onFreqChange={(v) => onCustomTaskChange(task.id, 'frequency', v)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add custom task */}
      <div className="mt-5">
        <button
          type="button"
          onClick={onCustomTaskAdd}
          className="btn-secondary"
          style={{
            background: 'transparent',
            border: '1.5px solid var(--brand-green)',
            color: 'var(--brand-green)',
            padding: '0 18px',
            minHeight: 40,
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 5,
            cursor: 'pointer',
            font: '500 13px DM Sans',
          }}
        >
          + Add your own
        </button>
      </div>

      <div className="mt-8">
        {!canGenerate && (
          <p className="text-xs mb-3 text-center" style={{ color: 'var(--text-muted)' }}>
            Check at least one task above to generate the assessment.
          </p>
        )}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
            style={{ color: 'var(--text-body)', border: '1.5px solid var(--border)', background: 'transparent', padding: '12px 28px', borderRadius: 5, cursor: 'pointer', font: '500 15px DM Sans' }}
          >
            Back
          </button>
          <button
            onClick={onContinue}
            disabled={!canGenerate}
            className={canGenerate ? 'btn-primary' : ''}
            style={{
              background: canGenerate ? 'var(--brand-green)' : 'var(--btn-disabled)',
              color: canGenerate ? '#fff' : 'var(--btn-disabled-ink)',
              border: 'none',
              padding: '12px 28px',
              borderRadius: 5,
              cursor: canGenerate ? 'pointer' : 'not-allowed',
              font: '500 15px DM Sans',
            }}
          >
            Generate assessment
          </button>
        </div>
      </div>
    </div>
  )
}
