import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Perk } from '../types'

interface PerkListProps {
  perks: Perk[]
  onChange: Dispatch<SetStateAction<Perk[]>>
}

export function PerkList({ perks, onChange }: PerkListProps) {
  const [draftLabel, setDraftLabel] = useState('')
  const [draftTimes, setDraftTimes] = useState(1)

  const addPerk = () => {
    const label = draftLabel.trim()
    if (!label) return
    onChange((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label, timesAvailable: draftTimes, timesTaken: 0 },
    ])
    setDraftLabel('')
    setDraftTimes(1)
  }

  const setTimesTaken = (id: string, taken: number) =>
    onChange((prev) =>
      prev.map((p) => (p.id === id ? { ...p, timesTaken: Math.max(0, Math.min(taken, p.timesAvailable)) } : p)),
    )

  const remove = (id: string) => onChange((prev) => prev.filter((p) => p.id !== id))

  const picksSpent = perks.reduce((sum, p) => sum + p.timesTaken, 0)
  const picksTotal = perks.reduce((sum, p) => sum + p.timesAvailable, 0)

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Perks</h2>
        <span className="muted">
          {picksSpent} / {picksTotal} picks spent
        </span>
      </div>

      <p className="empty-hint">
        You earn one perk pick each time you level up, plus one more for every 3 Battle Goal checkmarks
        (track those on the Character tab) — up to 6 picks that way. Each pick checks one box below; perks
        with multiple boxes can be picked more than once.
      </p>

      <ul className="perk-list">
        {perks.map((perk) => (
          <li key={perk.id} className={`perk-row ${perk.timesTaken >= perk.timesAvailable ? 'checked' : ''}`}>
            <div className="perk-main">
              <span className="perk-label">{perk.label}</span>
              <div className="perk-boxes">
                {Array.from({ length: perk.timesAvailable }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`perk-box ${i < perk.timesTaken ? 'filled' : ''}`}
                    aria-label={`Pick ${i + 1} of ${perk.timesAvailable}`}
                    onClick={() => setTimesTaken(perk.id, i < perk.timesTaken ? i : i + 1)}
                  />
                ))}
              </div>
            </div>
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
          value={draftTimes}
          onChange={(e) => setDraftTimes(Number(e.target.value))}
          aria-label="Times this perk can be picked"
        />
        <button type="submit" className="primary-btn">
          Add
        </button>
      </form>
    </div>
  )
}
