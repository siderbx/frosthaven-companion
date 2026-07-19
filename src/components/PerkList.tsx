import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Perk } from '../types'

interface PerkListProps {
  perks: Perk[]
  onChange: Dispatch<SetStateAction<Perk[]>>
}

export function PerkList({ perks, onChange }: PerkListProps) {
  const [draft, setDraft] = useState('')

  const addPerk = () => {
    const label = draft.trim()
    if (!label) return
    onChange((prev) => [...prev, { id: crypto.randomUUID(), label, checked: false }])
    setDraft('')
  }

  const toggle = (id: string) =>
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

      {perks.length === 0 && (
        <p className="empty-hint">
          Add each perk from your physical perk sheet below — check them off as you take them during
          level-up.
        </p>
      )}

      <ul className="perk-list">
        {perks.map((perk) => (
          <li key={perk.id} className={`perk-row ${perk.checked ? 'checked' : ''}`}>
            <label className="perk-checkbox">
              <input type="checkbox" checked={perk.checked} onChange={() => toggle(perk.id)} />
              <span>{perk.label}</span>
            </label>
            <button type="button" className="remove-btn" onClick={() => remove(perk.id)} aria-label="Remove perk">
              ×
            </button>
          </li>
        ))}
      </ul>

      <form
        className="add-row"
        onSubmit={(e) => {
          e.preventDefault()
          addPerk()
        }}
      >
        <input
          className="text-input"
          type="text"
          placeholder="Add a perk…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="primary-btn">
          Add
        </button>
      </form>
    </div>
  )
}
