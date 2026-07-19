import type { Dispatch, SetStateAction } from 'react'
import type { CharacterState } from '../types'
import { Counter } from './Counter'

interface CharacterSheetProps {
  character: CharacterState
  onChange: Dispatch<SetStateAction<CharacterState>>
}

export function CharacterSheet({ character, onChange }: CharacterSheetProps) {
  const set = <K extends keyof CharacterState>(key: K, value: CharacterState[K]) =>
    onChange((prev) => ({ ...prev, [key]: value }))

  const hpPct = character.maxHp > 0 ? Math.round((character.currentHp / character.maxHp) * 100) : 0

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
        <span className="class-tag">{character.className}</span>
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
      </div>

      <div className="stat-grid">
        <Counter label="Level" value={character.level} min={1} max={9} onChange={(v) => set('level', v)} />
        <Counter label="Experience" value={character.xp} min={0} step={5} onChange={(v) => set('xp', v)} />
        <Counter label="Gold" value={character.gold} min={0} step={5} onChange={(v) => set('gold', v)} />
      </div>
    </div>
  )
}
