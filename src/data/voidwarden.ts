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
 * The 11 cards marked with a "1" in the crown icon on gloomhavencards.com —
 * these make up the full starting hand (hand size is 11), no choice involved.
 * Initiative values read directly from the card art.
 */
const STARTING_HAND: Array<{ name: string; initiative: number }> = [
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

/**
 * The 3 cards marked with an "X" (not a number) in the crown icon — gained
 * later via level-up, exact level not printed on the card itself. Seeded
 * into Reserve; move each to Hand once your rulebook confirms you've
 * unlocked it.
 */
const LEVEL_UP_POOL: Array<{ name: string; initiative: number }> = [
  { name: 'Resigned Frenzy', initiative: 26 },
  { name: 'Sap Warmth', initiative: 59 },
  { name: 'Cold Embrace', initiative: 71 },
]

export function buildVoidwardenActionCards(): ActionCard[] {
  const card = (name: string, initiative: number, status: ActionCard['status'], level: number): ActionCard => ({
    id: crypto.randomUUID(),
    name,
    level,
    initiative,
    topText: '',
    bottomText: '',
    topLoss: false,
    bottomLoss: false,
    tags: [],
    status,
  })

  return [
    ...STARTING_HAND.map((c) => card(c.name, c.initiative, 'hand', 1)),
    ...LEVEL_UP_POOL.map((c) => card(c.name, c.initiative, 'reserve', 0)),
  ]
}
