import { useState } from 'react'
import { NICHES } from '../data/niches.js'

export default function NicheSelector({ niche, nicheLabel, onSelect, onContinue }) {
  const [otherText, setOtherText] = useState(nicheLabel && niche === 'other' ? nicheLabel : '')

  function handleCardClick(id) {
    if (id === 'other') {
      onSelect('other', otherText)
    } else {
      const found = NICHES.find((n) => n.id === id)
      onSelect(id, found ? found.label : id)
    }
  }

  function handleOtherInput(e) {
    setOtherText(e.target.value)
    onSelect('other', e.target.value)
  }

  const canContinue = niche !== null && (niche !== 'other' || otherText.trim().length > 0)

  return (
    <div
      className="rounded-lg p-8"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-panel)' }}
    >
      <h1
        className="text-2xl mb-2"
        style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-heading)', fontWeight: 400, textWrap: 'balance' }}
      >
        What type of business do you own?
      </h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Select the option that best describes your business. This helps us tailor the assessment to your industry.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {NICHES.map((n) => {
          const isSelected = niche === n.id
          return (
            <button
              key={n.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleCardClick(n.id)}
              className="niche-card text-left p-5 transition-colors"
              style={{
                borderRadius: 5,
                background: isSelected ? 'var(--bg-active)' : 'var(--bg-card)',
                border: isSelected ? '1.5px solid var(--brand-green)' : '1.5px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div
                className="text-lg mb-1"
                style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-heading)', fontWeight: 400 }}
              >
                {n.label}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {n.description}
              </div>
            </button>
          )
        })}
      </div>

      {niche === 'other' && (
        <div className="mt-4">
          <label
            htmlFor="other-niche"
            className="block mb-1.5"
            style={{ font: '500 13px DM Sans', color: 'var(--brand-green)' }}
          >
            Business type
          </label>
          <input
            id="other-niche"
            type="text"
            value={otherText}
            onChange={handleOtherInput}
            placeholder="e.g. Plumbing Contractor, Accounting Firm…"
            className="w-full input-field"
            style={{
              border: '1.5px solid var(--border)',
              borderRadius: 5,
              padding: '10px 14px',
              font: '400 15px DM Sans',
              color: 'var(--text-heading)',
              background: '#fff',
              outline: 'none',
            }}
          />
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={canContinue ? 'btn-primary' : ''}
          style={{
            background: canContinue ? 'var(--brand-green)' : 'var(--btn-disabled)',
            color: canContinue ? 'var(--bg-card)' : 'var(--btn-disabled-ink)',
            border: 'none',
            padding: '12px 28px',
            borderRadius: 5,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            font: '500 15px DM Sans',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
