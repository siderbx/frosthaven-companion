import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Perk } from '../types'

interface PerkListProps {
  perks: Perk[]
  onChange: Dispatch<SetStateAction<Perk[]>>
}

export function PerkList({ perks, onChange }: PerkListProps) {
  const [draftLabel, setDraftLabel] = useState('')
  const [draftBoxes, setDraftBoxes] = useState(1)

  const addPerk = () => {
    const label = draftLabel.trim()
    if (!label) return
    onChange((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label, boxesRequired: draftBoxes, boxesFilled: 0, checked: false },
    ])
    setDraftLabel('')
    setDraftBoxes(1)
  }

  const setBoxesFilled = (id: string, filled: number) =>
    onChange((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const boxesFilled = Math.max(0, Math.min(filled, p.boxesRequired))
        return { ...p, boxesFilled, checked: boxesFilled >= p.boxesRequired ? true : p.checked }
      }),
    )

  const toggleTaken = (id: string) =>
    onChange((prev) => prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)))

  const remove = (id: string) => onChange((prev) => prev.filter((p) => p.id !== id))

  const checkedCount = perks.filter((p) => p.checked).length

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Perks</h2>
        <span className="muted">
          {checkedCount} / {perks.length} taken
        </span>
      </div>

      <p className="empty-hint">
        Two ways to earn a perk: pick any perk outright at a level-up (the "Taken" toggle), or spend Battle
        Goal checkmarks on a specific perk's boxes — filling them all earns it too.
      </p>

      <ul className="perk-list">
        {perks.map((perk) => (
          <li key={perk.id} className={`perk-row ${perk.checked ? 'checked' : ''}`}>
            <div className="perk-main">
              <span className="perk-label">{perk.label}</span>
              <div className="perk-boxes">
                {Array.from({ length: perk.boxesRequired }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`perk-box ${i < perk.boxesFilled ? 'filled' : ''}`}
                    aria-label={`Battle goal checkmark ${i + 1} of ${perk.boxesRequired}`}
                    onClick={() => setBoxesFilled(perk.id, i < perk.boxesFilled ? i : i + 1)}
                  />
                ))}
              </div>
            </div>
            <label className="taken-toggle">
              <input type="checkbox" checked={perk.checked} onChange={() => toggleTaken(perk.id)} />
              Taken
            </label>
            <button type="button" className="remove-btn" onClick={() => remove(perk.id)} aria-label="Remove perk">
              ×
            </button>
          </li>
        ))}
      </ul>

      <form
        className="add-row perk-add-row"
        onSubmit={(e) => {
          e.preventDefault()
          addPerk()
        }}
      >
        <input
          className="text-input"
          type="text"
          placeholder="Add a perk…"
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
        />
        <input
          className="text-input tiny"
          type="number"
          min={1}
          max={3}
          value={draftBoxes}
          onChange={(e) => setDraftBoxes(Number(e.target.value))}
          aria-label="Battle goal boxes required"
        />
        <button type="submit" className="primary-btn">
          Add
        </button>
      </form>
    </div>
  )
}
