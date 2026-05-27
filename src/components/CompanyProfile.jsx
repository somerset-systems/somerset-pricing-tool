import { useState } from 'react'
import { NICHES } from '../data/niches.js'

const REVENUE_OPTIONS = [
  { value: '<2m',   label: '< $2M' },
  { value: '2-5m',  label: '$2 – $5M' },
  { value: '5-10m', label: '$5 – $10M' },
  { value: '10m+',  label: '$10M+' },
]

const YEARS_OPTIONS = [
  { value: 'under5',  label: 'Under 5 years' },
  { value: '5-15',    label: '5–15 years' },
  { value: '16-30',   label: '16–30 years' },
  { value: '30+',     label: '30+ years' },
]

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block mb-1.5"
      style={{ font: '500 13px DM Sans', color: '#2D5E3A' }}
    >
      {children}
    </label>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{message}</p>
}

function NumberInput({ id, value, onChange, placeholder }) {
  return (
    <input
      id={id}
      type="number"
      min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
      style={{
        border: '1.5px solid var(--border)',
        borderRadius: 6,
        padding: '10px 14px',
        font: '400 15px DM Sans',
        color: 'var(--text-heading)',
        background: '#fff',
        outline: 'none',
      }}
    />
  )
}

export default function CompanyProfile({ company, niche, onChange, onBack, onContinue }) {
  const [errors, setErrors] = useState({})

  const nicheData = NICHES.find((n) => n.id === niche)
  const staffLabel = nicheData ? nicheData.staffLabel : 'Number of billable staff'

  function validate() {
    const e = {}
    if (!company.revenueRange) e.revenueRange = 'Select a revenue range'
    if (!company.employees || company.employees === '') e.employees = 'Enter number of employees'
    if (!company.billableStaff || company.billableStaff === '') e.billableStaff = 'Enter number of staff'
    if (company.ownerOperated === null) e.ownerOperated = 'Select yes or no'
    return e
  }

  function handleContinue() {
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    setErrors({})
    onContinue()
  }

  function handleChange(field, value) {
    onChange(field, value)
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
  }

  const pillBase = {
    border: '1.5px solid var(--border)',
    borderRadius: 6,
    padding: '10px 16px',
    font: '500 14px DM Sans',
    cursor: 'pointer',
    transition: 'background 0.1s',
  }

  return (
    <div
      className="rounded-lg p-8"
      style={{ background: 'var(--bg-card)', boxShadow: '0 2px 12px rgba(45,94,58,0.08)' }}
    >
      <h2
        className="text-2xl mb-2"
        style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-heading)', fontWeight: 400 }}
      >
        Company Profile
      </h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        This information shapes the context for your operational assessment.
      </p>

      {/* Revenue range */}
      <div className="mb-5">
        <FieldLabel>Annual revenue</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {REVENUE_OPTIONS.map((opt) => {
            const isSelected = company.revenueRange === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('revenueRange', opt.value)}
                style={{
                  ...pillBase,
                  background: isSelected ? '#2D5E3A' : '#fff',
                  borderColor: isSelected ? '#2D5E3A' : 'var(--border)',
                  color: isSelected ? '#fff' : 'var(--text-body)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        <FieldError message={errors.revenueRange} />
      </div>

      {/* Employees */}
      <div className="mb-5">
        <FieldLabel htmlFor="employees">Number of employees</FieldLabel>
        <NumberInput
          id="employees"
          value={company.employees}
          onChange={(v) => handleChange('employees', v)}
          placeholder="e.g. 12"
        />
        <FieldError message={errors.employees} />
      </div>

      {/* Billable / field staff */}
      <div className="mb-5">
        <FieldLabel htmlFor="billableStaff">{staffLabel}</FieldLabel>
        <NumberInput
          id="billableStaff"
          value={company.billableStaff}
          onChange={(v) => handleChange('billableStaff', v)}
          placeholder="e.g. 6"
        />
        <FieldError message={errors.billableStaff} />
      </div>

      {/* Owner-operated */}
      <div className="mb-5">
        <FieldLabel>Owner-operated?</FieldLabel>
        <div className="flex gap-3">
          {[{ value: true, label: 'Yes' }, { value: false, label: 'No' }].map((opt) => {
            const isSelected = company.ownerOperated === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => handleChange('ownerOperated', opt.value)}
                style={{
                  ...pillBase,
                  background: isSelected ? '#2D5E3A' : '#fff',
                  borderColor: isSelected ? '#2D5E3A' : 'var(--border)',
                  color: isSelected ? '#fff' : 'var(--text-body)',
                  minWidth: 80,
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        <FieldError message={errors.ownerOperated} />
      </div>

      {/* Years in business (optional) */}
      <div className="mb-2">
        <FieldLabel htmlFor="yearsInBusiness">
          Years in business <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
        </FieldLabel>
        <select
          id="yearsInBusiness"
          value={company.yearsInBusiness}
          onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
          style={{
            border: '1.5px solid var(--border)',
            borderRadius: 6,
            padding: '10px 14px',
            font: '400 15px DM Sans',
            color: company.yearsInBusiness ? 'var(--text-heading)' : 'var(--text-muted)',
            background: '#fff',
            outline: 'none',
            width: '100%',
            cursor: 'pointer',
          }}
        >
          <option value="">Select…</option>
          {YEARS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          style={{ color: '#2D5E3A', border: '1.5px solid #2D5E3A', background: 'transparent', padding: '12px 28px', borderRadius: 6, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          style={{ background: '#2D5E3A', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 6, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
