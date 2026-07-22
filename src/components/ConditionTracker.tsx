import { useState, type Dispatch, type SetStateAction } from 'react'
import { CONDITION_TYPES, ROUND_CONDITIONS, TRIGGER_CONDITIONS } from '../types'
import type { CharacterState, ConditionType } from '../types'
import {
  CONDITION_RULES,
  clearConditions,
  endTurn,
  heal,
  startTurn,
  sufferDamage,
  toggleCondition,
  type ConditionOutcome,
} from '../lib/conditions'
import { GAME_ICONS } from '../lib/gameIcons'

interface ConditionTrackerProps {
  character: CharacterState
  onChange: Dispatch<SetStateAction<CharacterState>>
}

const NEGATIVE: readonly ConditionType[] = CONDITION_TYPES.filter(
  (c) => !['Strengthen', 'Invisible', 'Regenerate', 'Ward'].includes(c),
)
const POSITIVE: readonly ConditionType[] = CONDITION_TYPES.filter((c) => !NEGATIVE.includes(c))

export function ConditionTracker({ character, onChange }: ConditionTrackerProps) {
  const [amount, setAmount] = useState(1)
  const [log, setLog] = useState<string[]>([])

  // The functional update keeps rapid taps correct (see the stale-closure note in
  // the DEVLOG); the log is recomputed from the current prop, which at worst shows
  // the last tap's events — the state itself never drops an action.
  const run = (fn: (c: CharacterState) => ConditionOutcome) => {
    setLog(fn(character).events)
    onChange((prev) => fn(prev).character)
  }

  const toggle = (type: ConditionType) => {
    setLog([])
    onChange((prev) => toggleCondition(prev, type))
  }

  const clearAll = () => {
    setLog([])
    onChange((prev) => clearConditions(prev))
  }

  const anyActive = Object.keys(character.conditions).length > 0

  const conditionButton = (type: ConditionType) => {
    const value = character.conditions[type]
    const active = type in character.conditions
    return (
      <button
        key={type}
        type="button"
        className={`condition-btn ${active ? 'active' : ''}`}
        title={CONDITION_RULES[type]}
        aria-pressed={active}
        onClick={() => toggle(type)}
      >
        <img className="condition-icon" src={GAME_ICONS[type]} alt="" aria-hidden="true" />
        <span className="condition-name">{type}</span>
        {typeof value === 'number' && (
          <span className="condition-timer" title={`Expires after ${value} more of your turn end${value === 1 ? '' : 's'}`}>
            {value}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="condition-tracker">
      <div className="panel-header condition-header">
        <h3 className="condition-title">Conditions</h3>
        {anyActive && (
          <button type="button" className="link-btn small" onClick={clearAll}>
            Clear all (scenario end)
          </button>
        )}
      </div>

      <span className="condition-group-label negative">Negative</span>
      <div className="condition-grid">{NEGATIVE.map(conditionButton)}</div>
      <span className="condition-group-label positive">Positive</span>
      <div className="condition-grid">{POSITIVE.map(conditionButton)}</div>

      <div className="turn-controls">
        {character.inTurn ? (
          <button type="button" className="secondary-btn turn-btn in-turn" onClick={() => run(endTurn)}>
            End Turn
          </button>
        ) : (
          <button type="button" className="secondary-btn turn-btn" onClick={() => run(startTurn)}>
            Start Turn
          </button>
        )}
        <div className="amount-actions">
          <div className="counter-controls compact">
            <button
              type="button"
              className="counter-btn"
              onClick={() => setAmount((a) => Math.max(1, a - 1))}
              aria-label="Decrease amount"
            >
              −
            </button>
            <span className="counter-value amount-value">{amount}</span>
            <button
              type="button"
              className="counter-btn"
              onClick={() => setAmount((a) => a + 1)}
              aria-label="Increase amount"
            >
              +
            </button>
          </div>
          <button type="button" className="secondary-btn amount-btn" onClick={() => run((c) => sufferDamage(c, amount))}>
            <img className="condition-icon" src={GAME_ICONS.Attack} alt="" aria-hidden="true" />
            Suffer {amount}
          </button>
          <button type="button" className="secondary-btn amount-btn" onClick={() => run((c) => heal(c, amount))}>
            <img className="condition-icon" src={GAME_ICONS.Heal} alt="" aria-hidden="true" />
            Heal {amount}
          </button>
        </div>
      </div>

      {log.length > 0 && (
        <ul className="condition-log">
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      <p className="field-hint">
        Suffer / Heal apply the condition rules (Brittle, Ward, Poison, Wound…) — use them instead of editing HP
        directly when damage or healing hits the Voidwarden. Start / End Turn drive Wound, Bane, Regenerate, and
        round-condition expiry.
      </p>
    </div>
  )
}

// Sanity guard: every condition type renders from a real tile; a missing entry in
// GAME_ICONS would show as a broken image, so fail loudly in dev instead.
if (import.meta.env.DEV) {
  for (const type of [...ROUND_CONDITIONS, ...TRIGGER_CONDITIONS]) {
    if (!GAME_ICONS[type]) console.warn(`ConditionTracker: no icon mapped for ${type}`)
  }
}
