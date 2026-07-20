import { useState, type Dispatch, type SetStateAction } from 'react'
import type { CharacterState, Perk, PerkPickSource } from '../types'

const POINTS_PER_PICK = 3

interface PerkListProps {
  perks: Perk[]
  onChange: Dispatch<SetStateAction<Perk[]>>
  character: CharacterState
  onCharacterChange: Dispatch<SetStateAction<CharacterState>>
}

export function PerkList({ perks, onChange, character, onCharacterChange }: PerkListProps) {
  const [draftLabel, setDraftLabel] = useState('')
  const [draftTimes, setDraftTimes] = useState(1)
  const [pendingPerkId, setPendingPerkId] = useState<string | null>(null)

  const addPerk = () => {
    const label = draftLabel.trim()
    if (!label) return
    onChange((prev) => [...prev, { id: crypto.randomUUID(), label, timesAvailable: draftTimes, picks: [] }])
    setDraftLabel('')
    setDraftTimes(1)
  }

  const remove = (id: string) => onChange((prev) => prev.filter((p) => p.id !== id))

  const confirmPick = (perkId: string, source: PerkPickSource) => {
    onChange((prev) => prev.map((p) => (p.id === perkId ? { ...p, picks: [...p.picks, source] } : p)))
    if (source === 'points') {
      onCharacterChange((prev) => ({
        ...prev,
        battleGoalCheckmarks: Math.max(0, prev.battleGoalCheckmarks - POINTS_PER_PICK),
      }))
    }
    setPendingPerkId(null)
  }

  const undoPick = (perkId: string, index: number) => {
    const perk = perks.find((p) => p.id === perkId)
    if (!perk) return
    const source = perk.picks[index]
    onChange((prev) =>
      prev.map((p) => (p.id === perkId ? { ...p, picks: p.picks.filter((_, i) => i !== index) } : p)),
    )
    if (source === 'points') {
      onCharacterChange((prev) => ({ ...prev, battleGoalCheckmarks: prev.battleGoalCheckmarks + POINTS_PER_PICK }))
    }
  }

  const picksSpent = perks.reduce((sum, p) => sum + p.picks.length, 0)
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
        You earn one perk pick each time you level up, plus one more for every {POINTS_PER_PICK} Battle Goal
        checkmarks (tracked on the Character tab) — up to 6 picks that way. Tapping an empty box asks which
        source it came from; picking "Points" deducts {POINTS_PER_PICK} checkmarks from the Character tab.
      </p>

      <ul className="perk-list">
        {perks.map((perk) => (
          <li key={perk.id} className={`perk-row ${perk.picks.length >= perk.timesAvailable ? 'checked' : ''}`}>
            <div className="perk-main">
              <span className="perk-label">{perk.label}</span>
              <div className="perk-boxes">
                {Array.from({ length: perk.timesAvailable }).map((_, i) => {
                  const source = perk.picks[i]
                  const isNext = i === perk.picks.length
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`perk-box ${source ? `filled ${source}` : ''}`}
                      disabled={!source && !isNext}
                      aria-label={source ? `Pick ${i + 1}, from ${source} — tap to undo` : `Pick ${i + 1} of ${perk.timesAvailable}`}
                      onClick={() => (source ? undoPick(perk.id, i) : setPendingPerkId(perk.id))}
                    />
                  )
                })}
              </div>
            </div>
            {pendingPerkId === perk.id && (
              <div className="pick-source-picker">
                <span className="muted">Take via:</span>
                <button type="button" className="secondary-btn" onClick={() => confirmPick(perk.id, 'level')}>
                  Level
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={character.battleGoalCheckmarks < POINTS_PER_PICK}
                  onClick={() => confirmPick(perk.id, 'points')}
                >
                  Points (−{POINTS_PER_PICK}, have {character.battleGoalCheckmarks})
                </button>
                <button type="button" className="link-btn" onClick={() => setPendingPerkId(null)}>
                  Cancel
                </button>
              </div>
            )}
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
