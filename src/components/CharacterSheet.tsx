import { useState, type Dispatch, type SetStateAction } from 'react'
import { VOIDWARDEN_HP_BY_LEVEL, VOIDWARDEN_KEYWORDS, VOIDWARDEN_XP_BY_LEVEL, levelForXp } from '../data/voidwarden'
import type { CharacterState } from '../types'
import { ConditionTracker } from './ConditionTracker'
import { Counter } from './Counter'
import { ResourceTracker } from './ResourceTracker'

interface CharacterSheetProps {
  character: CharacterState
  onChange: Dispatch<SetStateAction<CharacterState>>
  /** Called after a confirmed manual level change so the app can surface the level-up card pick. */
  onLevelChange?: () => void
}

export function CharacterSheet({ character, onChange, onLevelChange }: CharacterSheetProps) {
  // Manual level changes cascade into Max HP (and the card pool), so a stray tap
  // shouldn't silently rewrite state. The Level counter stages its value here and
  // nothing is applied until the user confirms the change below.
  const [pendingLevel, setPendingLevel] = useState<number | null>(null)

  const set = <K extends keyof CharacterState>(key: K, value: CharacterState[K]) =>
    onChange((prev) => ({ ...prev, [key]: value }))

  // Max HP is not directly editable: it always follows Level per the mat's table.
  // A character at full health stays full at the new max; otherwise current HP
  // just clamps.
  const cascadeLevel = (prev: CharacterState, level: number): CharacterState => {
    const maxHp = VOIDWARDEN_HP_BY_LEVEL[level] ?? prev.maxHp
    const wasFull = prev.currentHp >= prev.maxHp
    return { ...prev, level, maxHp, currentHp: wasFull ? maxHp : Math.min(prev.currentHp, maxHp) }
  }

  const applyLevel = (level: number) => {
    onChange((prev) => cascadeLevel(prev, level))
    setPendingLevel(null)
    // Surface the card pick (level up) or the over-cap remover (level down).
    onLevelChange?.()
  }

  // XP reaching a threshold levels up automatically. It never levels *down* —
  // lowering XP (or playing at a manually raised level) is corrected by hand via
  // the Level counter, so a manual level is never clobbered by an XP tick.
  const applyXp = (xp: number) => {
    onChange((prev) => {
      const level = levelForXp(xp)
      return level > prev.level ? cascadeLevel({ ...prev, xp }, level) : { ...prev, xp }
    })
  }

  const levelDraft = pendingLevel ?? character.level
  const levelPending = pendingLevel !== null && pendingLevel !== character.level
  const previewMaxHp = VOIDWARDEN_HP_BY_LEVEL[levelDraft] ?? character.maxHp

  const hpPct = character.maxHp > 0 ? Math.round((character.currentHp / character.maxHp) * 100) : 0
  const nextLevelXp = VOIDWARDEN_XP_BY_LEVEL[character.level + 1]

  return (
    <div className="panel character-sheet">
      <div className="field-group">
        <label className="field-label" htmlFor="char-name">
          Character Name
        </label>
        <input
          id="char-name"
          className="text-input name-input"
          type="text"
          placeholder="Name your Voidwarden…"
          value={character.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <div className="class-line">
          <span className="class-tag">{character.className}</span>
          <span className="keyword-chips">
            {VOIDWARDEN_KEYWORDS.map((kw) => (
              <span key={kw} className="keyword-chip">
                {kw}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className="hp-block">
        <div className="hp-bar-track">
          <div className="hp-bar-fill" style={{ width: `${Math.min(100, Math.max(0, hpPct))}%` }} />
          <span className="hp-bar-text">
            {character.currentHp} / {character.maxHp} HP
          </span>
        </div>
        <div className="hp-controls">
          <Counter
            label="Current HP"
            value={character.currentHp}
            min={0}
            max={character.maxHp}
            onChange={(v) => set('currentHp', v)}
          />
          <div className="counter-row">
            <span className="counter-label">Max HP</span>
            <div className="counter-controls">
              <span className="counter-value static">{character.maxHp}</span>
            </div>
          </div>
        </div>
        <p className="field-hint">Max HP follows Level, per the Voidwarden mat's table.</p>
      </div>

      <ConditionTracker character={character} onChange={onChange} />

      <div className="stat-grid">
        <div>
          <Counter label="Level" value={levelDraft} min={1} max={9} onChange={setPendingLevel} />
          {levelPending && (
            <div className="pick-source-picker level-confirm">
              <span className="muted">
                Level {character.level} → {pendingLevel}
                {previewMaxHp !== character.maxHp && ` · Max HP ${character.maxHp} → ${previewMaxHp}`}
              </span>
              <button type="button" className="secondary-btn" onClick={() => applyLevel(pendingLevel!)}>
                Confirm
              </button>
              <button type="button" className="link-btn" onClick={() => setPendingLevel(null)}>
                Cancel
              </button>
            </div>
          )}
          <p className="field-hint">Levels up on its own when Experience hits the threshold — adjust here to correct.</p>
        </div>
        <div>
          <Counter label="Experience" value={character.xp} min={0} step={5} onChange={applyXp} />
          {nextLevelXp !== undefined && (
            <p className="field-hint">
              {character.xp >= nextLevelXp
                ? `Enough XP for level ${character.level + 1}`
                : `${nextLevelXp - character.xp} XP to level ${character.level + 1}`}
            </p>
          )}
        </div>
        <Counter label="Gold" value={character.gold} min={0} step={5} onChange={(v) => set('gold', v)} />
        <div>
          <Counter
            label="Battle Goal Checkmarks"
            value={character.battleGoalCheckmarks}
            min={0}
            onChange={(v) => set('battleGoalCheckmarks', v)}
          />
          <p className="field-hint">
            {character.battleGoalCheckmarks % 3 === 0 && character.battleGoalCheckmarks > 0
              ? 'Enough for a perk pick — check a box on the Perks tab.'
              : `${3 - (character.battleGoalCheckmarks % 3)} more for a perk pick`}
          </p>
        </div>
      </div>

      <ResourceTracker character={character} onChange={onChange} />
    </div>
  )
}
