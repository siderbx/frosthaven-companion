// Condition (status effect) rules for the character, per the Frosthaven rulebook's
// condition glossary (verified against pikdonker.github.io/frosthaven-rule-book).
// All removal timing lives in these pure functions so the UI never has to know the
// rules: the component just calls startTurn/endTurn/sufferDamage/heal and renders
// the returned state + event log.
//
// The subtle timings encoded here:
// - Round conditions (and Bane's damage clock) expire at the end of the figure's
//   NEXT turn: gained during the figure's own turn they survive the current turn's
//   end (2 turn-ends), gained between turns they expire at the first (1 turn-end).
// - Heal removes any combination of Wound, Brittle, Bane, and Poison — but if
//   Poison was present, the hit-point increase is prevented.
// - Regenerate is "Heal 1, self" at the start of each turn, and is removed when the
//   figure suffers damage. With Wound, Regenerate applies first (its heal removes
//   the Wound before the Wound deals its damage).
// - Bane: 10 damage at the end of the figure's next turn, then removed.
// - Brittle doubles / Ward halves (rounded down) the next damage suffered, then is
//   removed; a figure with both suffers normal damage and loses both.

import type { CharacterState, ConditionMap, ConditionType } from '../types'
import { ROUND_CONDITIONS } from '../types'

/** One-line rule reminder per condition, shown as the toggle's tooltip. */
export const CONDITION_RULES: Record<ConditionType, string> = {
  Stun: 'Cannot perform abilities or use items on their turn. Removed at the end of their next turn.',
  Immobilize: 'Cannot perform move abilities. Removed at the end of their next turn.',
  Disarm: 'Cannot perform attack abilities. Removed at the end of their next turn.',
  Muddle: 'Draws attack modifiers with disadvantage. Removed at the end of their next turn.',
  Impair: 'Cannot use items. Removed at the end of their next turn.',
  Strengthen: 'Draws attack modifiers with advantage. Removed at the end of their next turn.',
  Invisible: 'Cannot be targeted by enemies. Removed at the end of their next turn.',
  Wound: 'Suffers 1 damage at the start of each turn. Removed by any Heal.',
  Poison: 'Enemy attacks against them get +1. The next Heal removes it instead of restoring HP.',
  Bane: 'Suffers 10 damage at the end of their next turn, then removed. Also removed by any Heal.',
  Brittle: 'The next damage suffered is doubled, then removed. Also removed by any Heal. Negates Ward.',
  Regenerate: 'Heal 1, self at the start of each turn. Removed on suffering damage.',
  Ward: 'The next damage suffered is halved (rounded down), then removed. Negates Brittle.',
}

/** Conditions whose stored value is a turn-end countdown rather than null. */
const isTimed = (type: ConditionType) =>
  type === 'Bane' || (ROUND_CONDITIONS as readonly ConditionType[]).includes(type)

export interface ConditionOutcome {
  character: CharacterState
  /** Human-readable log of what the rules did, for the UI to surface. */
  events: string[]
}

/** Add the condition if absent (starting its expiry clock), or remove it manually. */
export function toggleCondition(char: CharacterState, type: ConditionType): CharacterState {
  const conditions: ConditionMap = { ...char.conditions }
  if (type in conditions) {
    delete conditions[type]
  } else {
    conditions[type] = isTimed(type) ? (char.inTurn ? 2 : 1) : null
  }
  return { ...char, conditions }
}

/** Scenario end / rest between scenarios: every condition drops, turn state resets. */
export function clearConditions(char: CharacterState): CharacterState {
  return { ...char, conditions: {}, inTurn: false }
}

/**
 * Damage after modifiers/shield — applies Brittle/Ward, removes Regenerate, and
 * reduces HP (never below 0).
 */
export function sufferDamage(char: CharacterState, amount: number): ConditionOutcome {
  const events: string[] = []
  const conditions: ConditionMap = { ...char.conditions }
  let dmg = amount
  const brittle = 'Brittle' in conditions
  const ward = 'Ward' in conditions
  if (brittle && ward) {
    delete conditions.Brittle
    delete conditions.Ward
    events.push('Brittle and Ward negate each other — both removed')
  } else if (brittle) {
    dmg *= 2
    delete conditions.Brittle
    events.push(`Brittle doubles it to ${dmg} — Brittle removed`)
  } else if (ward) {
    dmg = Math.floor(dmg / 2)
    delete conditions.Ward
    events.push(`Ward halves it to ${dmg} — Ward removed`)
  }
  if (dmg > 0 && 'Regenerate' in conditions) {
    delete conditions.Regenerate
    events.push('Regenerate removed (suffered damage)')
  }
  const currentHp = Math.max(0, char.currentHp - dmg)
  events.unshift(`Suffered ${dmg} damage (${currentHp} HP left)`)
  if (currentHp === 0) events.push('At 0 HP — exhausted!')
  return { character: { ...char, conditions, currentHp }, events }
}

/**
 * A Heal ability targeting the figure. Removes Wound, Brittle, Bane, and Poison;
 * if Poison was present the hit-point increase is prevented.
 */
export function heal(char: CharacterState, amount: number): ConditionOutcome {
  const events: string[] = []
  const conditions: ConditionMap = { ...char.conditions }
  const poisoned = 'Poison' in conditions
  for (const type of ['Wound', 'Brittle', 'Bane', 'Poison'] as const) {
    if (type in conditions) {
      delete conditions[type]
      events.push(`${type} removed`)
    }
  }
  let currentHp = char.currentHp
  if (poisoned) {
    events.push('Poison consumed the heal — no HP restored')
  } else {
    currentHp = Math.min(char.maxHp, currentHp + amount)
    events.unshift(`Healed ${currentHp - char.currentHp} (${currentHp} HP)`)
  }
  return { character: { ...char, conditions, currentHp }, events }
}

/**
 * Start the figure's turn: Regenerate's heal first (it can remove the Wound before
 * the Wound deals damage), then Wound's 1 damage if still present.
 */
export function startTurn(char: CharacterState): ConditionOutcome {
  const events: string[] = []
  let state: CharacterState = { ...char, inTurn: true }
  if ('Regenerate' in state.conditions) {
    const r = heal(state, 1)
    state = r.character
    events.push(`Regenerate: ${r.events.join('; ')}`)
  }
  if ('Wound' in state.conditions) {
    const r = sufferDamage(state, 1)
    state = r.character
    events.push(`Wound: ${r.events.join('; ')}`)
  }
  if (events.length === 0) events.push('Turn started — no start-of-turn effects')
  return { character: state, events }
}

/**
 * End the figure's turn: tick down every timed condition, expiring those that hit
 * zero — which for Bane means suffering its 10 damage (Brittle/Ward apply to it).
 */
export function endTurn(char: CharacterState): ConditionOutcome {
  const events: string[] = []
  const conditions: ConditionMap = { ...char.conditions }
  let baneTriggered = false
  for (const type of Object.keys(conditions) as ConditionType[]) {
    const left = conditions[type]
    if (typeof left !== 'number') continue
    if (left <= 1) {
      delete conditions[type]
      if (type === 'Bane') baneTriggered = true
      else events.push(`${type} expired`)
    } else {
      conditions[type] = left - 1
    }
  }
  let state: CharacterState = { ...char, conditions, inTurn: false }
  if (baneTriggered) {
    const r = sufferDamage(state, 10)
    state = r.character
    events.push(`Bane triggers — ${r.events.join('; ')} — Bane removed`)
  }
  if (events.length === 0) events.push('Turn ended — nothing expired')
  return { character: state, events }
}
