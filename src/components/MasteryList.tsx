import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Mastery } from '../types'
import { CardText } from './CardText'

interface MasteryListProps {
  masteries: Mastery[]
  onChange: Dispatch<SetStateAction<Mastery[]>>
}

export function MasteryList({ masteries, onChange }: MasteryListProps) {
  // Masteries render as read-only decorated text (inline game icons); editing is
  // rare (house rules / errata), so the input only appears for the row being edited.
  const [editingId, setEditingId] = useState<string | null>(null)

  const updateText = (id: string, text: string) =>
    onChange((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)))

  const toggleAchieved = (id: string) =>
    onChange((prev) => prev.map((m) => (m.id === id ? { ...m, achieved: !m.achieved } : m)))

  const achievedCount = masteries.filter((m) => m.achieved).length

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Mastery</h2>
        <span className="muted">
          {achievedCount} / {masteries.length} achieved
        </span>
      </div>

      <p className="empty-hint">
        Each mastery must be completed entirely within a single scenario your party wins (Scenario 0 doesn't
        count). Wording matches the physical mat — check one off once earned.
      </p>

      <ul className="perk-list">
        {masteries.map((mastery) => (
          <li key={mastery.id} className={`perk-row ${mastery.achieved ? 'checked' : ''}`}>
            {editingId === mastery.id ? (
              <div className="mastery-edit">
                <input
                  className="text-input"
                  type="text"
                  placeholder="Mastery condition…"
                  value={mastery.text}
                  autoFocus
                  onChange={(e) => updateText(mastery.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') setEditingId(null)
                  }}
                />
                <button type="button" className="secondary-btn small" onClick={() => setEditingId(null)}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="perk-main">
                  <span className="perk-label">
                    {mastery.text.trim() ? (
                      <CardText text={mastery.text} />
                    ) : (
                      <span className="muted">Mastery condition…</span>
                    )}
                  </span>
                </div>
                <div className="head-right">
                  <button
                    type="button"
                    className="link-btn small"
                    aria-label="Edit mastery text"
                    onClick={() => setEditingId(mastery.id)}
                  >
                    ✎ Edit
                  </button>
                  <button
                    type="button"
                    className={`perk-box ${mastery.achieved ? 'filled level' : ''}`}
                    aria-label={mastery.achieved ? 'Achieved — tap to undo' : 'Mark achieved'}
                    onClick={() => toggleAchieved(mastery.id)}
                  />
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
