import type { Dispatch, SetStateAction } from 'react'
import type { Mastery } from '../types'
import { CardText } from './CardText'

interface MasteryListProps {
  masteries: Mastery[]
  onChange: Dispatch<SetStateAction<Mastery[]>>
}

export function MasteryList({ masteries, onChange }: MasteryListProps) {
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
            <div className="perk-main">
              <input
                className="text-input"
                type="text"
                placeholder="Mastery condition…"
                value={mastery.text}
                onChange={(e) => updateText(mastery.id, e.target.value)}
              />
              <button
                type="button"
                className={`perk-box ${mastery.achieved ? 'filled level' : ''}`}
                aria-label={mastery.achieved ? 'Achieved — tap to undo' : 'Mark achieved'}
                onClick={() => toggleAchieved(mastery.id)}
              />
            </div>
            {mastery.text.trim() && (
              <p className="mastery-preview">
                <CardText text={mastery.text} />
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
