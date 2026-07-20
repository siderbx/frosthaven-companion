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

export type ActionCardStatus = 'reserve' | 'hand' | 'used' | 'lost'

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
}

export type RoundSelection = {
  topCardId: string | null
  bottomCardId: string | null
}
