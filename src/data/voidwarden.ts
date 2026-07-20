import type { ActionCard, CardTag, PersistentEffect } from '../types'

/** Human Voidwarden (Jaws of the Lion) hit points by level, from the character mat. */
export const VOIDWARDEN_HP_BY_LEVEL: Record<number, number> = {
  1: 6,
  2: 7,
  3: 8,
  4: 9,
  5: 10,
  6: 11,
  7: 12,
  8: 13,
  9: 14,
}

/** Class keywords, from the character mat's Notes section. */
export const VOIDWARDEN_KEYWORDS = ['Arcane', 'Educated', 'Outcast']

/** XP required to reach each level, from the character mat. */
export const VOIDWARDEN_XP_BY_LEVEL: Record<number, number> = {
  1: 0,
  2: 45,
  3: 95,
  4: 150,
  5: 210,
  6: 275,
  7: 345,
  8: 420,
  9: 500,
}

export interface VoidwardenCardDetail {
  name: string
  initiative: number
  /** Paraphrased summary of the top action's mechanics — not the card's verbatim text. */
  topText: string
  /** Paraphrased summary of the bottom action's mechanics — not the card's verbatim text. */
  bottomText: string
  topLoss: boolean
  bottomLoss: boolean
  tags: CardTag[]
  defaultStatus: 'hand' | 'reserve'
  /** Set when the top action is a tracked persistent effect (active area + use slots). */
  topPersistent?: PersistentEffect
  /** Set when the bottom action is a tracked persistent effect (active area + use slots). */
  bottomPersistent?: PersistentEffect
}

/**
 * All 14 Human Voidwarden action cards — every card is available from level 1
 * (there's no per-level unlocking in Jaws of the Lion). Hand size is 11, so
 * players choose which 11 of these 14 make up their active hand; the rest
 * stay in Reserve. The default hand/reserve split is just a starting point —
 * swap freely in the Action Cards tab, it has no mechanical significance.
 *
 * Mechanics were read from the card scans in the gloomhaven-card-browser
 * image set (see DEVLOG References), zooming per-icon to confirm every
 * consume/infuse element and loss flag. Summaries are paraphrased in our own
 * words per the repo's copyright approach — mechanics only, no verbatim text.
 */
export const VOIDWARDEN_CARD_DETAILS: VoidwardenCardDetail[] = [
  {
    name: 'Signs of the Void',
    initiative: 15,
    topText: 'An ally within range 3 may Shield 1; that same ally may also Move 2.',
    bottomText:
      'At the start of your next five turns, Curse an enemy at range 2 (XP on 3rd and 5th; card lost when the track ends).',
    topLoss: false,
    bottomLoss: true,
    tags: ['Buff', 'Control'],
    defaultStatus: 'hand',
    bottomPersistent: {
      charges: 5,
      endsIn: 'lost',
      note: 'Curse at range 2 at the start of each of your turns — XP on the 3rd and 5th use; card is lost when the track ends.',
    },
  },
  {
    name: 'Suggestion',
    initiative: 23,
    topText:
      'Force an enemy within range 4 to Move 3 (you steer) then Attack 3 at an adjacent enemy of your choice. +2 XP. Consume Ice: also Stun the acting enemy.',
    bottomText: 'Move 3. Consume Dark: Curse an enemy at range 3.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Control', 'Move'],
    defaultStatus: 'hand',
  },
  {
    name: 'Grasp of Doom',
    initiative: 36,
    topText: 'Attack 2 inflicting Poison, Wound, Curse, and Stun. Infuse Ice and Dark. +2 XP.',
    bottomText: 'Move 3. Consume Dark: +2 Move.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Attack', 'Move'],
    defaultStatus: 'hand',
  },
  {
    name: 'Black Boon',
    initiative: 43,
    topText: 'Heal 5 at range 3, but the target also gains Poison. Infuse Dark.',
    bottomText: 'Move 2, then one ally within range 3 may Move 2.',
    topLoss: false,
    bottomLoss: false,
    tags: ['Heal', 'Move'],
    defaultStatus: 'hand',
  },
  {
    name: 'Turn Out the Lights',
    initiative: 49,
    topText: 'Attack 2 at range 3. Consume Dark: +1 Attack, Curse, +1 XP.',
    bottomText:
      'Force an enemy within range 3 to Attack 3 (range 3) at an enemy of your choice; the acting enemy then suffers as much damage as it dealt. Infuse Ice. +1 XP.',
    topLoss: false,
    bottomLoss: true,
    tags: ['Attack', 'Control'],
    defaultStatus: 'hand',
  },
  {
    name: 'Freeze the Soul',
    initiative: 58,
    topText: 'Attack 3 with Poison. Consume Ice: +1 Attack and Muddle, +1 XP.',
    bottomText: 'Stun an enemy at range 3, then Curse yourself. Consume Dark: skip the self-Curse.',
    topLoss: false,
    bottomLoss: false,
    tags: ['Attack', 'Control'],
    defaultStatus: 'hand',
  },
  {
    name: 'Lure of the Void',
    initiative: 67,
    topText:
      'Disarm an enemy at range 3, then force it to Move 1 (you steer). Consume Dark: +2 Move, +1 XP.',
    bottomText:
      'An ally within range 3 may Attack 5 (Consume Dark: +2 Attack, +1 XP); if they attack, you gain 1 XP and that ally suffers 2 damage.',
    topLoss: false,
    bottomLoss: true,
    tags: ['Control', 'Attack'],
    defaultStatus: 'hand',
  },
  {
    name: 'Wicked Scratch',
    initiative: 68,
    topText: 'An ally within range 2 may Attack 3. Infuse Dark. +1 XP.',
    bottomText: 'Loot 1, then Strengthen an ally at range 3.',
    topLoss: false,
    bottomLoss: false,
    tags: ['Attack', 'Buff'],
    defaultStatus: 'hand',
  },
  {
    name: 'Close to the Abyss',
    initiative: 72,
    topText:
      'Heal 2 at range 2, two targets; any ally whose Poison this heal removes gains Bless.',
    bottomText: 'Force every enemy within range 3 to Move 1, with you steering each move.',
    topLoss: false,
    bottomLoss: false,
    tags: ['Heal', 'Control', 'AoE'],
    defaultStatus: 'hand',
  },
  {
    name: 'Master Influence',
    initiative: 83,
    topText:
      'Persistent: the first attack of each of your attack-granting actions gains Advantage, and you may consume any element to give it +1 Attack; monsters attacking on your grants use your modifier deck. +2 XP.',
    bottomText: 'Bless an ally at range 2, then Poison an enemy at range 2. Infuse Ice.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Buff', 'Control'],
    defaultStatus: 'hand',
    topPersistent: {
      charges: null,
      endsIn: 'lost',
      note: 'Lasts the rest of the scenario — no use slots to spend.',
    },
  },
  {
    name: 'Gift of the Void',
    initiative: 89,
    topText:
      'Poison an enemy at range 3 (Infuse Dark); then one adjacent ally may Attack 3 at range 4 against that poisoned enemy — if they do, that ally suffers 2 damage.',
    bottomText: 'Heal 2 at range 3.',
    topLoss: false,
    bottomLoss: false,
    tags: ['Attack', 'Heal'],
    defaultStatus: 'hand',
  },
  {
    name: 'Resigned Frenzy',
    initiative: 26,
    topText:
      'Force all enemies within range 3 to Attack 2 at enemies of your choice adjacent to them. +2 XP.',
    bottomText: 'Move 4. Consume Dark: −1 Move, +1 XP, then Attack 2.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Control', 'AoE', 'Move'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Sap Warmth',
    initiative: 59,
    topText:
      'Poison an enemy at range 3 (Infuse Dark). Then, the next three times an ally attacks a Poisoned enemy, that ally may Heal 1 Self (XP when the track ends).',
    bottomText:
      'Move 2, then Heal 3 targeting yourself and all allies within range 2. Infuse Ice. +1 XP.',
    topLoss: false,
    bottomLoss: true,
    tags: ['Heal', 'Buff'],
    defaultStatus: 'reserve',
    topPersistent: {
      charges: 3,
      endsIn: 'used',
      note: 'After an ally attacks a Poisoned enemy, that ally may Heal 1 Self — XP when the last charge is spent; card is then discarded (this half is not a loss).',
    },
  },
  {
    name: 'Cold Embrace',
    initiative: 71,
    topText: 'Curse at range 3, three targets. +1 XP. Consume Dark: +1 range, +1 target, +1 XP.',
    bottomText:
      '(Consume Ice: Move 3 first.) All adjacent allies suffer 1 damage, then Bless all adjacent allies.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Control', 'Buff', 'AoE'],
    defaultStatus: 'reserve',
  },
]

/**
 * Look up the persistent-effect config for one half of a card, by name.
 * Kept in the data table (not on stored ActionCards) so no migration is
 * needed and corrections here apply retroactively. Custom cards return
 * undefined and follow the normal discard/lost flow.
 */
export function persistentEffectFor(
  cardName: string,
  half: 'top' | 'bottom',
): PersistentEffect | undefined {
  const detail = VOIDWARDEN_CARD_DETAILS.find(
    (c) => c.name.toLowerCase() === cardName.trim().toLowerCase(),
  )
  return half === 'top' ? detail?.topPersistent : detail?.bottomPersistent
}

export function buildVoidwardenActionCards(): ActionCard[] {
  return VOIDWARDEN_CARD_DETAILS.map((c) => ({
    id: crypto.randomUUID(),
    name: c.name,
    level: 1,
    initiative: c.initiative,
    topText: c.topText,
    bottomText: c.bottomText,
    topLoss: c.topLoss,
    bottomLoss: c.bottomLoss,
    tags: c.tags,
    status: c.defaultStatus,
  }))
}

/**
 * Fill in canonical card text on already-stored cards (from before the text
 * existed). Only blank fields are filled — user-entered text is never
 * overwritten. Loss flags ride along with their half's text fill, and tags
 * fill only when empty, so intentional edits survive. Idempotent.
 */
export function withVoidwardenCardText(cards: ActionCard[]): ActionCard[] {
  const byName = new Map(VOIDWARDEN_CARD_DETAILS.map((c) => [c.name.toLowerCase(), c]))
  return cards.map((card) => {
    const detail = byName.get(card.name.trim().toLowerCase())
    if (!detail) return card
    const next = { ...card }
    if (!next.topText.trim()) {
      next.topText = detail.topText
      next.topLoss = detail.topLoss
    }
    if (!next.bottomText.trim()) {
      next.bottomText = detail.bottomText
      next.bottomLoss = detail.bottomLoss
    }
    if (next.tags.length === 0) next.tags = detail.tags
    return next
  })
}
