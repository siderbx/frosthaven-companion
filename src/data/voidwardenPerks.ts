/**
 * Human Voidwarden perk sheet, transcribed from the physical perk sheet.
 * Per the rulebook (p.44-45): every level-up grants one perk pick, and every
 * 3 Battle Goal checkmarks grant another (up to 6 that way) — either source
 * can be spent to check a box on any perk below. `timesAvailable` is the
 * number of boxes printed next to that perk, i.e. how many separate times
 * it can be picked.
 */
import type { Perk, PerkDeckEffect } from '../types'

/**
 * Each perk's `deckEffect` is what one pick of it does to the attack modifier
 * deck — card-kind ids to remove/add (base ids like `minus1`/`plus0`, or perk-card
 * kinds defined in `lib/modifierDeck.ts` like `frost1`). Perks with no deck impact
 * (Ignore scenario effects, Grave Defense) omit it. The deck composition is derived
 * from the picks of all perks, so these are the single source of truth for the wiring.
 */
export const VOIDWARDEN_PERKS: Array<{
  label: string
  timesAvailable: number
  deckEffect?: PerkDeckEffect
}> = [
  { label: 'Remove two −1 cards', timesAvailable: 1, deckEffect: { remove: ['minus1', 'minus1'] } },
  { label: 'Remove one −2 card', timesAvailable: 1, deckEffect: { remove: ['minus2'] } },
  {
    label: 'Replace one −1 card with one +0 "Heal 1, Target 1 ally" card',
    timesAvailable: 2,
    deckEffect: { remove: ['minus1'], add: ['heal-target0'] },
  },
  {
    label: 'Replace one +0 card with one +1 "Heal 1, Target 1 ally" card',
    timesAvailable: 3,
    deckEffect: { remove: ['plus0'], add: ['heal-target1'] },
  },
  {
    label: 'Replace one +0 card with one +1 Poison card',
    timesAvailable: 1,
    deckEffect: { remove: ['plus0'], add: ['poison1'] },
  },
  {
    label: 'Replace one +0 card with one +1 Curse card',
    timesAvailable: 2,
    deckEffect: { remove: ['plus0'], add: ['curse1'] },
  },
  { label: 'Add two +1 Frost cards', timesAvailable: 1, deckEffect: { add: ['frost1', 'frost1'] } },
  { label: 'Add two +1 Dark cards', timesAvailable: 1, deckEffect: { add: ['dark1', 'dark1'] } },
  { label: 'Add one +3 card', timesAvailable: 1, deckEffect: { add: ['plus3'] } },
  { label: 'Ignore scenario effects', timesAvailable: 1 },
  {
    label: 'Grave Defense: whenever you rest, you may consume Frost + Dark to give Ward to one ally who has Poison',
    timesAvailable: 1,
  },
]

/**
 * Old→new perk labels for the icon-correctness fixes (Shield→Target, the −1
 * replacement being a +0 card, Frost→Curse, and the Grave Defense give/has
 * icons). Perks persist in localStorage across a seed change, and the deck
 * wiring keys off the label, so `withVoidwardenPerkFixes` renames stored perks
 * once on mount — preserving picks. Idempotent: only exact old labels are hit,
 * so user-added perks and already-fixed perks are untouched.
 */
const PERK_LABEL_FIXES: Record<string, string> = {
  'Replace one −1 card with one +1 "Heal 1, Shield 1 ally" card':
    'Replace one −1 card with one +0 "Heal 1, Target 1 ally" card',
  'Replace one +0 card with one +1 "Heal 1, Shield 1 ally" card':
    'Replace one +0 card with one +1 "Heal 1, Target 1 ally" card',
  'Replace one +0 card with one +1 Frost card': 'Replace one +0 card with one +1 Curse card',
  'Grave Defense: whenever you rest, you may consume Frost + Dark to give Dark to one ally who has Dark':
    'Grave Defense: whenever you rest, you may consume Frost + Dark to give Ward to one ally who has Poison',
}

export function withVoidwardenPerkFixes(perks: Perk[]): Perk[] {
  return perks.map((p) => {
    const renamed = PERK_LABEL_FIXES[p.label]
    return renamed ? { ...p, label: renamed } : p
  })
}

/** Lookup of deck effect by perk label, built from the seed so the strings can never drift apart. */
const DECK_EFFECT_BY_LABEL: Record<string, PerkDeckEffect> = Object.fromEntries(
  VOIDWARDEN_PERKS.filter((p) => p.deckEffect).map((p) => [p.label, p.deckEffect as PerkDeckEffect]),
)

/**
 * Flatten the perks into the list of deck effects actually in force — one entry per
 * pick taken. A perk picked twice contributes its effect twice; user-added perks
 * (no matching label) contribute nothing. Matched by label, mirroring how card text
 * is filled by name, so retroactive data fixes need no migration.
 */
export function deckEffectsFromPerks(perks: Perk[]): PerkDeckEffect[] {
  const effects: PerkDeckEffect[] = []
  for (const perk of perks) {
    const effect = DECK_EFFECT_BY_LABEL[perk.label]
    if (!effect) continue
    for (let i = 0; i < perk.picks.length; i++) effects.push(effect)
  }
  return effects
}
