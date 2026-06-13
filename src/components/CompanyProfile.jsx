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
      style={{ font: '500 13px DM Sans', color: 'var(--brand-green)' }}
    >
      {children}
    </label>
  )
}

function FieldError({ message, id }) {
  if (!message) return null
  return <p id={id} className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{message}</p>
}

function NumberInput({ id, value, onChange, placeholder, max = 2000, hasError, describedBy }) {
  function handleChange(e) {
    const raw = e.target.value
    if (raw === '') return onChange('')
    // Clamp out typos like 99999 that would distort the ROI cap; keep the field sane.
    const n = Math.min(Math.max(0, Math.floor(Number(raw) || 0)), max)
    onChange(String(n))
  }
  return (
    <input
      id={id}
      type="number"
      min="0"
      max={max}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      className="w-full input-field"
      style={{
        border: `1.5px solid ${hasError ? 'var(--error)' : 'var(--border)'}`,
        borderRadius: 5,
        padding: '10px 14px',
        font: '400 15px DM Sans',
        color: 'var(--text-heading)',
        background: 'var(--bg-card)',
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
    borderRadius: 5,
    padding: '10px 16px',
    font: '500 14px DM Sans',
    cursor: 'pointer',
    transition: 'background 0.1s',
  }

  return (
    <div
      className="rounded-lg p-8"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <h1
        className="text-2xl mb-2"
        style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-heading)', fontWeight: 400, textWrap: 'balance' }}
      >
        Company Profile
      </h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        This information shapes the context for your operational assessment.
      </p>

      {/* Revenue range */}
      <fieldset className="mb-5" style={{ border: 0, padding: 0, minInlineSize: 0 }}>
        <legend style={{ font: '500 13px DM Sans', color: 'var(--brand-green)', marginBottom: 6, display: 'block', width: '100%', lineHeight: 1.4, padding: 0 }}>
          Annual revenue
        </legend>
        <div className="flex flex-wrap gap-2">
          {REVENUE_OPTIONS.map((opt) => {
            const isSelected = company.revenueRange === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleChange('revenueRange', opt.value)}
                style={{
                  ...pillBase,
                  background: isSelected ? 'var(--brand-green)' : 'var(--bg-card)',
                  borderColor: isSelected ? 'var(--brand-green)' : 'var(--border)',
                  color: isSelected ? 'var(--bg-card)' : 'var(--text-body)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        <FieldError message={errors.revenueRange} />
      </fieldset>

      {/* Employees */}
      <div className="mb-5">
        <FieldLabel htmlFor="employees">Number of employees</FieldLabel>
        <NumberInput
          id="employees"
          value={company.employees}
          onChange={(v) => handleChange('employees', v)}
          placeholder="e.g. 12"
          hasError={!!errors.employees}
          describedBy={errors.employees ? 'employees-error' : undefined}
        />
        <FieldError id="employees-error" message={errors.employees} />
      </div>

      {/* Billable / field staff */}
      <div className="mb-5">
        <FieldLabel htmlFor="billableStaff">{staffLabel}</FieldLabel>
        <NumberInput
          id="billableStaff"
          value={company.billableStaff}
          onChange={(v) => handleChange('billableStaff', v)}
          placeholder="e.g. 6"
          hasError={!!errors.billableStaff}
          describedBy={errors.billableStaff ? 'billableStaff-error' : undefined}
        />
        <FieldError id="billableStaff-error" message={errors.billableStaff} />
      </div>

      {/* Owner-operated */}
      <fieldset className="mb-5" style={{ border: 0, padding: 0, minInlineSize: 0 }}>
        <legend style={{ font: '500 13px DM Sans', color: 'var(--brand-green)', marginBottom: 6, display: 'block', width: '100%', lineHeight: 1.4, padding: 0 }}>
          Owner-operated?
        </legend>
        <div className="flex gap-3">
          {[{ value: true, label: 'Yes' }, { value: false, label: 'No' }].map((opt) => {
            const isSelected = company.ownerOperated === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleChange('ownerOperated', opt.value)}
                style={{
                  ...pillBase,
                  background: isSelected ? 'var(--brand-green)' : 'var(--bg-card)',
                  borderColor: isSelected ? 'var(--brand-green)' : 'var(--border)',
                  color: isSelected ? 'var(--bg-card)' : 'var(--text-body)',
                  minWidth: 80,
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        <FieldError message={errors.ownerOperated} />
      </fieldset>

      {/* Years in business (optional) */}
      <fieldset className="mb-2" style={{ border: 0, padding: 0, minInlineSize: 0 }}>
        <legend style={{ font: '500 13px DM Sans', color: 'var(--brand-green)', marginBottom: 6, display: 'block', width: '100%', lineHeight: 1.4, padding: 0 }}>
          Years in business <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {YEARS_OPTIONS.map((opt) => {
            const isSelected = company.yearsInBusiness === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleChange('yearsInBusiness', isSelected ? '' : opt.value)}
                style={{
                  ...pillBase,
                  background: isSelected ? 'var(--brand-green)' : 'var(--bg-card)',
                  borderColor: isSelected ? 'var(--brand-green)' : 'var(--border)',
                  color: isSelected ? 'var(--bg-card)' : 'var(--text-body)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary"
          style={{ color: 'var(--text-body)', border: '1.5px solid var(--border)', background: 'transparent', padding: '12px 28px', borderRadius: 5, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="btn-primary"
          style={{ background: 'var(--brand-green)', color: 'var(--bg-card)', border: 'none', padding: '12px 28px', borderRadius: 5, cursor: 'pointer', font: '500 15px DM Sans' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
