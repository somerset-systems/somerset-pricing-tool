import { useState } from 'react'
import { NICHES } from '../data/niches.js'

const NICHE_ICONS = {
  hvac: '🔧',
  electrical: '⚡',
  legal: '⚖️',
  other: '🏢',
}

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
      style={{ background: 'var(--bg-card)', boxShadow: '0 2px 12px rgba(45,94,58,0.08)' }}
    >
      <h1
        className="text-2xl mb-2"
        style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-heading)', fontWeight: 400 }}
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
              onClick={() => handleCardClick(n.id)}
              className="text-left p-5 rounded-lg transition-colors"
              style={{
                background: isSelected ? '#F0F4F1' : 'var(--bg-card)',
                border: isSelected ? '1.5px solid #2D5E3A' : '1.5px solid var(--border)',
                borderLeft: isSelected ? '4px solid #2D5E3A' : '1.5px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div className="text-2xl mb-2">{NICHE_ICONS[n.id]}</div>
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
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          style={{
            background: canContinue ? '#2D5E3A' : '#D1D5DB',
            color: '#fff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: 6,
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
