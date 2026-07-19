import type { ActionCard } from '../types'

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

/**
 * All 14 Human Voidwarden action cards — every card is available from level 1
 * (there's no per-level unlocking in Jaws of the Lion). Hand size is 11, so
 * players choose which 11 of these 14 make up their active hand; the rest
 * stay in Reserve. Initiative values read directly from the card art.
 *
 * The default hand/reserve split below is just a starting point — swap
 * freely in the Action Cards tab, it has no mechanical significance.
 */
const DEFAULT_HAND: Array<{ name: string; initiative: number }> = [
  { name: 'Signs of the Void', initiative: 15 },
  { name: 'Suggestion', initiative: 23 },
  { name: 'Grasp of Doom', initiative: 36 },
  { name: 'Black Boon', initiative: 43 },
  { name: 'Turn Out the Lights', initiative: 49 },
  { name: 'Freeze the Soul', initiative: 58 },
  { name: 'Lure of the Void', initiative: 67 },
  { name: 'Wicked Scratch', initiative: 68 },
  { name: 'Close to the Abyss', initiative: 72 },
  { name: 'Master Influence', initiative: 83 },
  { name: 'Gift of the Void', initiative: 89 },
]

const DEFAULT_RESERVE: Array<{ name: string; initiative: number }> = [
  { name: 'Resigned Frenzy', initiative: 26 },
  { name: 'Sap Warmth', initiative: 59 },
  { name: 'Cold Embrace', initiative: 71 },
]

export function buildVoidwardenActionCards(): ActionCard[] {
  const card = (name: string, initiative: number, status: ActionCard['status']): ActionCard => ({
    id: crypto.randomUUID(),
    name,
    level: 1,
    initiative,
    topText: '',
    bottomText: '',
    topLoss: false,
    bottomLoss: false,
    tags: [],
    status,
  })

  return [
    ...DEFAULT_HAND.map((c) => card(c.name, c.initiative, 'hand')),
    ...DEFAULT_RESERVE.map((c) => card(c.name, c.initiative, 'reserve')),
  ]
}
