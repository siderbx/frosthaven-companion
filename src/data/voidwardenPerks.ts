/**
 * Human Voidwarden perk sheet, transcribed from the physical perk sheet.
 * Per the rulebook (p.44-45): every level-up grants one perk pick, and every
 * 3 Battle Goal checkmarks grant another (up to 6 that way) — either source
 * can be spent to check a box on any perk below. `timesAvailable` is the
 * number of boxes printed next to that perk, i.e. how many separate times
 * it can be picked.
 */
export const VOIDWARDEN_PERKS: Array<{ label: string; timesAvailable: number }> = [
  { label: 'Remove two −1 cards', timesAvailable: 1 },
  { label: 'Remove one −2 card', timesAvailable: 1 },
  { label: 'Replace one −1 card with one +1 "Heal 1, Shield 1 ally" card', timesAvailable: 2 },
  { label: 'Replace one +0 card with one +1 "Heal 1, Shield 1 ally" card', timesAvailable: 3 },
  { label: 'Replace one +0 card with one +1 Poison card', timesAvailable: 1 },
  { label: 'Replace one +0 card with one +1 Frost card', timesAvailable: 2 },
  { label: 'Add two +1 Frost cards', timesAvailable: 1 },
  { label: 'Add two +1 Dark cards', timesAvailable: 1 },
  { label: 'Add one +3 card', timesAvailable: 1 },
  { label: 'Ignore scenario effects', timesAvailable: 1 },
  {
    label: 'Grave Defense: whenever you rest, you may consume Frost + Dark to give Dark to one ally who has Dark',
    timesAvailable: 1,
  },
]
