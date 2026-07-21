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
  /** Printed unlock level: 1 covers both the level-1 and level-X starting cards; 2–9 are the cards gained via the level-up choice. */
  level: number
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
 * The Human Voidwarden action cards. The 14 level-1 cards (11 marked "1" plus 3
 * marked "X") are the starting pool: hand size is 11, so players choose which 11
 * make up their active hand and the rest sit in Reserve. The remaining cards are
 * marked level 2–9 — on each level-up the player adds one new card, chosen from
 * that level's two cards (Stand Fast is the lone level-5 card) or any lower-level
 * card they skipped. buildVoidwardenActionCards seeds only the level-1 cards; the
 * level-2–9 entries here are the catalog the level-up chooser draws from.
 *
 * Mechanics were read from the card scans in the gloomhaven-card-browser image
 * set (see DEVLOG References), zooming per-icon to confirm every consume/infuse
 * element and loss flag. Summaries are paraphrased in our own words per the
 * repo's copyright approach — mechanics only, no verbatim text.
 */
export const VOIDWARDEN_CARD_DETAILS: VoidwardenCardDetail[] = [
  {
    name: 'Signs of the Void',
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
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
    level: 1,
    initiative: 71,
    topText: 'Curse at range 3, three targets. +1 XP. Consume Dark: +1 range, +1 target, +1 XP.',
    bottomText:
      '(Consume Ice: Move 3 first.) All adjacent allies suffer 1 damage, then Bless all adjacent allies.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Control', 'Buff', 'AoE'],
    defaultStatus: 'reserve',
  },

  // ---- Level 2–9 cards: the "pick one" pool gained on level-up ----
  // Not part of a fresh character's starting cards (buildVoidwardenActionCards
  // filters to level 1). They live here as the catalog the level-up chooser
  // draws from; `defaultStatus` is unused until one is picked and instantiated.
  {
    name: 'Give and Take',
    level: 2,
    initiative: 21,
    topText:
      'Poison yourself or an ally within range 2. Then Bless and Strengthen a different ally within range 3. Infuse Dark.',
    bottomText:
      'Move 4 with Jump, Cursing every enemy you move through during the movement. Infuse Fire and Ice. +1 XP.',
    topLoss: false,
    bottomLoss: true,
    tags: ['Buff', 'Move', 'Control'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Crushing Cold',
    level: 2,
    initiative: 86,
    topText:
      'One ally within range 3 may Attack 4 (Target 2). Consume Ice: that attack also Muddles. +1 XP.',
    bottomText: 'Move 3, then Muddle an enemy at range 3. Infuse Ice.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Buff', 'Attack', 'Move'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Commanding Presence',
    level: 3,
    initiative: 75,
    topText:
      'At the start of your next five turns, one ally within range 3 may perform an "Attack 2" action (XP on the 3rd and 5th; card lost when the track ends).',
    bottomText:
      'Move 4, then Curse yourself (Consume Fire: skip the self-Curse). Then one ally within range 3 may Move 3.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Buff', 'Move'],
    defaultStatus: 'reserve',
    topPersistent: {
      charges: 5,
      endsIn: 'lost',
      note: 'At the start of each of your next five turns, an ally within range 3 may Attack 2 — XP on the 3rd and 5th use; card is lost when the track ends.',
    },
  },
  {
    name: 'Taunting Fate',
    level: 3,
    initiative: 13,
    topText:
      'Heal 6 at range 2. Then shuffle one Bless card into the monster attack modifier deck. +1 XP.',
    bottomText:
      'The next time you grant an attack this turn, add +1 Attack to the whole action (Consume Ice: +2 instead). All attacks targeting you this round add +2 Attack. Cannot be discarded before the end of the round.',
    topLoss: false,
    bottomLoss: false,
    tags: ['Heal', 'Buff'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Savage Instinct',
    level: 4,
    initiative: 51,
    topText:
      'Force one enemy within range 3 to Attack 3, targeting all other enemies adjacent to it; the acting enemy suffers 1 damage for each enemy targeted. +2 XP.',
    bottomText: 'Heal 3 at range 3 and Strengthen. Poison. Consume Ice: also Bless.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Control', 'Heal', 'Buff'],
    defaultStatus: 'reserve',
  },
  {
    name: 'The Last Journey',
    level: 4,
    initiative: 38,
    topText: 'Attack 4 at range 3 with Curse. Infuse Dark.',
    bottomText:
      'Move 4, then force one adjacent enemy to Move 3 with you steering; that enemy gains Immobilize. +1 XP.',
    topLoss: false,
    bottomLoss: true,
    tags: ['Attack', 'Control', 'Move'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Stand Fast',
    level: 5,
    initiative: 90,
    topText:
      'Place the Ward in an adjacent empty hex; it is an obstacle for all purposes. Enemies entering a hex adjacent to the Ward gain Poison, and enemies within range 3 of the Ward have Disadvantage on all attacks not granted by you. Infuse Earth. +2 XP.',
    bottomText:
      'One ally or enemy within range 3 may Attack 3 at range 3, targeting an enemy of your choice.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Summon', 'Control', 'Buff'],
    defaultStatus: 'reserve',
    topPersistent: {
      charges: null,
      endsIn: 'lost',
      note: 'The Ward stays in play as an obstacle for the rest of the scenario (no use slots).',
    },
  },
  {
    name: 'Surge of Power',
    level: 6,
    initiative: 81,
    topText:
      'Heal all damage on one ally within range 3; if you do, that ally gains Muddle. Infuse Dark. +2 XP.',
    bottomText:
      'Persistent: any time you or an ally loses Poison, that figure gains Strengthen. +2 XP.',
    topLoss: true,
    bottomLoss: true,
    tags: ['Heal', 'Buff', 'Control'],
    defaultStatus: 'reserve',
    bottomPersistent: {
      charges: null,
      endsIn: 'lost',
      note: 'Lasts the rest of the scenario — triggers whenever you or an ally loses Poison (no use slots).',
    },
  },
  {
    name: 'Withering Conviction',
    level: 6,
    initiative: 44,
    topText:
      'Two allies within range 2 may each suffer 2 damage; each ally who does may Attack 6 at range 3. +2 XP.',
    bottomText:
      'Curse yourself (Consume Fire: skip the self-Curse). Then Curse at range 4, Target 2.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Buff', 'Attack', 'Control'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Hateful Blast',
    level: 7,
    initiative: 29,
    topText: 'Attack 5 at range 3 with Muddle. Consume Fire: also Wound. +1 XP.',
    bottomText:
      'Force one enemy within range 3 to Attack 2 at range 2 with Wound (Consume Fire: +1 range), targeting three enemies of your choice. +2 XP.',
    topLoss: false,
    bottomLoss: true,
    tags: ['Attack', 'Control'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Spirit Hunger',
    level: 7,
    initiative: 68,
    topText:
      "One ally within range 2 may Attack 5; if they do, that ally may Heal X, where X is the damage suffered by the attack's target. +2 XP.",
    bottomText: 'Move 4. Then Heal 2 at range 2. Consume Ice: +1 Heal and +1 range.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Buff', 'Heal', 'Move'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Empowered Link',
    level: 8,
    initiative: 59,
    topText:
      'On each of your next three Heal abilities, when possible, target one additional ally (XP on the 1st and 3rd; card lost when the track ends).',
    bottomText: 'Move 2. Then Bless yourself and all adjacent allies. Infuse Ice.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Buff', 'Move'],
    defaultStatus: 'reserve',
    topPersistent: {
      charges: 3,
      endsIn: 'lost',
      note: 'Your next three Heal abilities each target one extra ally — XP on the 1st and 3rd use; card is lost when the track ends.',
    },
  },
  {
    name: 'Lull into Oblivion',
    level: 8,
    initiative: 11,
    topText:
      'Stun and Curse at range 3, Target 2. If this card is discarded before the end of the round, or either target suffers damage this round, both targets lose Stun. Infuse Dark.',
    bottomText:
      'You and all allies within range 2 may Move 3 (Consume Fire: +1 Move). +1 XP.',
    topLoss: false,
    bottomLoss: false,
    tags: ['Control', 'Move'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Possessed by Fate',
    level: 9,
    initiative: 66,
    topText:
      'Attack 2 at range 2, Target 3, with Poison and Wound. Consume Fire: also Curse. +1 XP.',
    bottomText:
      'One ally within range 3 may Attack 8 at range 3 (Consume Ice: also Stun, +1 XP); if they do, gain +1 XP and that ally gains Poison.',
    topLoss: false,
    bottomLoss: true,
    tags: ['Attack', 'Control', 'Buff'],
    defaultStatus: 'reserve',
  },
  {
    name: 'Eye of the Void',
    level: 9,
    initiative: 19,
    topText:
      'Poison at range 4, then force all other enemies within range 3 of that target to Attack 2 (range 3) against it. Infuse Dark. +2 XP.',
    bottomText:
      'Move 2. All allies and enemies within range 3 suffer 1 damage. Then Strengthen all allies within range 3.',
    topLoss: true,
    bottomLoss: false,
    tags: ['Control', 'Attack', 'Buff'],
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

/** Instantiate a fresh owned ActionCard from a catalog detail (new id each call). */
export function voidwardenActionCardFrom(
  detail: VoidwardenCardDetail,
  status: ActionCard['status'] = detail.defaultStatus,
): ActionCard {
  return {
    id: crypto.randomUUID(),
    name: detail.name,
    level: detail.level,
    initiative: detail.initiative,
    topText: detail.topText,
    bottomText: detail.bottomText,
    topLoss: detail.topLoss,
    bottomLoss: detail.bottomLoss,
    tags: detail.tags,
    status,
  }
}

export function buildVoidwardenActionCards(): ActionCard[] {
  // Seed only the level-1/X starting pool. Level 2–9 cards are added later,
  // one per level-up, via the card chooser — they aren't owned at level 1.
  return VOIDWARDEN_CARD_DETAILS.filter((c) => c.level === 1).map((c) => voidwardenActionCardFrom(c))
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
