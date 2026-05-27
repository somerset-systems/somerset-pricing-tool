import { useState, useRef } from 'react'
import { deriveTaskHours } from '../utils/calculations.js'

const IMPACT_STYLE = {
  High:   { background: '#2D5E3A', color: '#fff' },
  Medium: { background: '#1C1C1C', color: '#fff' },
  Low:    { background: '#888888', color: '#fff' },
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
  border: '1.5px solid #D8D4C8',
  borderRadius: 6,
  padding: '5px 8px',
  font: '400 14px DM Sans',
  color: 'var(--text-heading)',
  background: '#fff',
  outline: 'none',
  width: 56,
  textAlign: 'center',
}

function ImpactBadge({ level }) {
  return (
    <div className="impact-badge flex-shrink-0">
      <span
        style={{
          ...IMPACT_STYLE[level],
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
      >
        {level}
      </span>
      <div className="impact-badge-tooltip">{IMPACT_TOOLTIPS[level]}</div>
    </div>
  )
}

function CustomCheckbox({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="flex-shrink-0"
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: checked ? 'none' : '1.5px solid var(--border)',
        background: checked ? '#2D5E3A' : '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked && (
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
          <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

// People input: type=text so user can select-all and retype freely.
// Commits parsed integer to parent only on blur; shows empty string while editing.
function PeopleInput({ people, onPeopleChange }) {
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
      type="text"
      value={local}
      placeholder="2"
      onChange={handleChange}
      onBlur={handleBlur}
      style={inputStyle}
    />
  )
}

function PeopleFreqControls({ people, frequency, onPeopleChange, onFreqChange }) {
  const btnBase = {
    padding: '4px 9px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    border: '1.5px solid #2D5E3A',
    fontFamily: 'DM Sans, sans-serif',
    lineHeight: 1.4,
  }
  const active   = { background: '#2D5E3A', color: '#fff', borderColor: '#2D5E3A' }
  const inactive = { background: 'transparent', color: '#2D5E3A' }

  return (
    <div className="flex flex-wrap gap-3 items-center mt-2 ml-7">
      <div className="flex items-center gap-1.5">
        <label className="text-xs" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          Staff affected:
        </label>
        <PeopleInput people={people} onPeopleChange={onPeopleChange} />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>How often:</span>
        <div className="flex gap-1">
          {FREQ_OPTIONS.map((opt) => (
            <div key={opt} className="freq-btn-wrapper">
              <button
                type="button"
                onClick={() => onFreqChange(opt)}
                style={{ ...btnBase, ...(frequency === opt ? active : inactive) }}
              >
                {opt}
              </button>
              <div className="freq-btn-tooltip">{FREQ_TOOLTIPS[opt]}</div>
            </div>
          ))}
        </div>
      </div>
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
      style={{ background: 'var(--bg-card)', boxShadow: '0 2px 12px rgba(45,94,58,0.08)' }}
    >
      <h2
        className="text-2xl mb-2"
        style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-heading)', fontWeight: 400 }}
      >
        Where Is Your Team Losing Time?
      </h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Check each area where your team manually handles work. Enter how many staff are involved and how often.
      </p>

      {/* Built-in tasks */}
      <div>
        {sortedTasks.map((task, idx) => (
          <div
            key={task.id}
            style={{
              background: task.included ? '#F0F4F1' : 'transparent',
              borderBottom: idx < sortedTasks.length - 1 || customTasks.length > 0 ? '1px solid var(--border)' : 'none',
              padding: '12px 32px',
              margin: '0 -32px',
              transition: 'background 0.15s',
            }}
          >
            <div className="flex items-center gap-3">
              <CustomCheckbox
                checked={task.included}
                onChange={(val) => onTaskChange(task.id, 'included', val)}
              />
              <span className="flex-1 text-sm" style={{ color: 'var(--text-body)', font: '400 15px DM Sans' }}>
                {task.label}
              </span>
              <ImpactBadge level={task.impact} />
            </div>
            {task.included && (
              <PeopleFreqControls
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
                background: '#F0F4F1',
                borderBottom: idx < customTasks.length - 1 ? '1px solid var(--border)' : 'none',
                padding: '12px 32px',
                margin: '0 -32px',
              }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  value={task.label}
                  onChange={(e) => onCustomTaskChange(task.id, 'label', e.target.value)}
                  placeholder="Describe this task…"
                  style={{
                    flex: 1,
                    minWidth: 140,
                    border: '1.5px solid var(--border)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    font: '400 14px DM Sans',
                    color: 'var(--text-heading)',
                    background: '#fff',
                    outline: 'none',
                  }}
                />
                <select
                  value={task.laborCategory}
                  onChange={(e) => onCustomTaskChange(task.id, 'laborCategory', e.target.value)}
                  aria-label="Labor category"
                  style={{
                    border: '1.5px solid var(--border)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    font: '400 13px DM Sans',
                    color: 'var(--text-heading)',
                    background: '#fff',
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
                  style={{
                    border: '1.5px solid var(--border)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    font: '400 13px DM Sans',
                    color: 'var(--text-heading)',
                    background: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {VALUE_BUCKET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ImpactBadge level="Medium" />
                <button
                  type="button"
                  onClick={() => onCustomTaskRemove(task.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 16,
                    lineHeight: 1,
                    padding: '2px 4px',
                    flexShrink: 0,
                  }}
                  aria-label="Remove task"
                >
                  ×
                </button>
              </div>
              <PeopleFreqControls
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
          style={{
            background: 'transparent',
            border: '1.5px solid #2D5E3A',
            color: '#2D5E3A',
            padding: '8px 18px',
            borderRadius: 6,
            cursor: 'pointer',
            font: '500 13px DM Sans',
          }}
        >
          + Add your own
        </button>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          style={{ color: '#2D5E3A', border: '1.5px solid #2D5E3A', background: 'transparent', padding: '12px 28px', borderRadius: 6, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Back
        </button>
        <button
          onClick={onContinue}
          style={{ background: '#2D5E3A', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 6, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Generate Assessment
        </button>
      </div>
    </div>
  )
}
