export interface CharacterState {
  name: string
  className: string
  level: number
  xp: number
  gold: number
  maxHp: number
  currentHp: number
}

export interface Perk {
  id: string
  label: string
  checked: boolean
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
