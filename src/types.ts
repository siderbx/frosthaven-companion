/** The 9 gatherable crafting resources shown on every character mat, in the mat's grid order. */
export const RESOURCE_TYPES = [
  'Lumber',
  'Metal',
  'Hide',
  'Arrowvine',
  'Axenut',
  'Corpsecap',
  'Flamefruit',
  'Rockroot',
  'Snowthistle',
] as const

export type ResourceType = (typeof RESOURCE_TYPES)[number]

export interface CharacterState {
  name: string
  className: string
  level: number
  xp: number
  gold: number
  maxHp: number
  currentHp: number
  /** Battle Goal checkmarks earned — every 3 grants one perk pick (up to 6 perk picks this way) */
  battleGoalCheckmarks: number
  /** How many of each crafting resource the character has collected. */
  resources: Record<ResourceType, number>
}

export type PerkPickSource = 'level' | 'points'

export interface Perk {
  id: string
  label: string
  /** How many times this perk can be picked (the boxes printed on the sheet) — usually 1, sometimes more */
  timesAvailable: number
  /** One entry per pick spent on this perk, recording where that pick came from */
  picks: PerkPickSource[]
}

/**
 * A mastery goal from the character mat. Text isn't hardcoded (see voidwardenPerks.ts
 * header for why) — the user fills it in from their physical mat and checks it off
 * once earned in a won scenario.
 */
export interface Mastery {
  id: string
  text: string
  achieved: boolean
}

export interface ModifierCardType {
  id: string
  label: string
  /** Display value shown on the card face, e.g. "+1", "-1", "x2", "Null" */
  value: string
  count: number
  /** Cards like the crit (x2) and miss (Null) trigger a reshuffle after being drawn */
  reshuffle: boolean
  /** True for the special cards a perk adds (not part of the base 20) — surfaced in the deck breakdown. */
  fromPerk?: boolean
  /**
   * Extra game-term glyphs the card carries beyond its numeric value — the element or
   * effect a perk card applies (e.g. `['Poison']`, `['Heal', 'Target']`). Rendered as
   * small badges on the card face; the terms map through GAME_ICONS.
   */
  icons?: string[]
}

/**
 * The change one pick of a perk makes to the attack modifier deck. `remove`/`add`
 * list card-kind ids (base ids like `minus1`/`plus0`, or perk-card-kind ids like
 * `frost1`), one entry per card affected. A perk with no deck impact (e.g. "Ignore
 * scenario effects") simply has no entry in the effect table.
 */
export interface PerkDeckEffect {
  remove?: string[]
  add?: string[]
}

export interface ModifierDeckState {
  composition: ModifierCardType[]
  drawPile: string[]
  discardPile: string[]
  lastDrawnId: string | null
  lastDrawWasReshuffle: boolean
}

export const CARD_TAGS = [
  'Attack',
  'Move',
  'Heal',
  'Buff',
  'Control',
  'AoE',
  'Summon',
  'Other',
] as const

export type CardTag = (typeof CARD_TAGS)[number]

export type ActionCardStatus = 'reserve' | 'hand' | 'used' | 'lost' | 'active'

/**
 * A persistent effect printed on one half of a card: played to the active area
 * instead of discard/lost, tracked with use slots, and moved to its final pile
 * only when the track is exhausted (or the scenario ends).
 */
export interface PersistentEffect {
  /** Number of use slots on the track; null = lasts the whole scenario (no slots). */
  charges: number | null
  /** Which pile the card goes to when the effect ends. */
  endsIn: 'used' | 'lost'
  /** Reminder of what each charge does / when XP is earned. */
  note?: string
}

export interface ActionCard {
  id: string
  name: string
  level: number
  initiative: number
  topText: string
  bottomText: string
  topLoss: boolean
  bottomLoss: boolean
  tags: CardTag[]
  status: ActionCardStatus
  /** Remaining charges while status is 'active'; null = whole-scenario effect. */
  activeCharges?: number | null
  /** Which half's persistent effect is active while status is 'active'. */
  activeHalf?: 'top' | 'bottom'
}

export type RoundSelection = {
  topCardId: string | null
  bottomCardId: string | null
}
