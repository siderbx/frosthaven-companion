import type { Dispatch, SetStateAction } from 'react'
import { VOIDWARDEN_HP_BY_LEVEL, VOIDWARDEN_KEYWORDS, VOIDWARDEN_XP_BY_LEVEL, levelForXp } from '../data/voidwarden'
import type { CharacterState } from '../types'
import { ConditionTracker } from './ConditionTracker'
import { Counter } from './Counter'
import { ResourceTracker } from './ResourceTracker'

interface CharacterSheetProps {
  character: CharacterState
  onChange: Dispatch<SetStateAction<CharacterState>>
}

export function CharacterSheet({ character, onChange }: CharacterSheetProps) {
  const set = <K extends keyof CharacterState>(key: K, value: CharacterState[K]) =>
    onChange((prev) => ({ ...prev, [key]: value }))

  // Level is derived from XP (per the mat's thresholds), so XP edits are the only
  // way level moves. Crossing a threshold cascades into Max HP: a character at
  // full health stays full at the new max, otherwise current HP just clamps.
  const applyXp = (xp: number) => {
    onChange((prev) => {
      const level = levelForXp(xp)
      if (level === prev.level) return { ...prev, xp }
      const maxHp = VOIDWARDEN_HP_BY_LEVEL[level] ?? prev.maxHp
      const wasFull = prev.currentHp >= prev.maxHp
      return { ...prev, xp, level, maxHp, currentHp: wasFull ? maxHp : Math.min(prev.currentHp, maxHp) }
    })
  }

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
          <Counter
            label="Max HP"
            value={character.maxHp}
            min={1}
            onChange={(v) => set('maxHp', v)}
          />
        </div>
        <p className="field-hint">Max HP auto-fills from Level (per the Voidwarden mat) — adjust it directly if an item or effect changes it.</p>
      </div>

      <ConditionTracker character={character} onChange={onChange} />

      <div className="stat-grid">
        <div>
          <div className="counter-row">
            <span className="counter-label">Level</span>
            <div className="counter-controls">
              <span className="counter-value static">{character.level}</span>
            </div>
          </div>
          <p className="field-hint">Set by Experience — level-ups surface the card pick on the Action Cards tab.</p>
        </div>
        <div>
          <Counter label="Experience" value={character.xp} min={0} step={5} onChange={applyXp} />
          {nextLevelXp !== undefined && (
            <p className="field-hint">{`${nextLevelXp - character.xp} XP to level ${character.level + 1}`}</p>
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
