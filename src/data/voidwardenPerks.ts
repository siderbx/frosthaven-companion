/**
 * Human Voidwarden perk sheet, transcribed from the physical perk sheet.
 * Each perk can be earned two ways: leveling up (pick any perk, no box
 * requirement), or completing Battle Goals — the box count is how many
 * Battle Goal checkmarks need to be spent on that specific perk to earn it
 * that way.
 */
export const VOIDWARDEN_PERKS: Array<{ label: string; boxesRequired: number }> = [
  { label: 'Remove two −1 cards', boxesRequired: 1 },
  { label: 'Remove one −2 card', boxesRequired: 1 },
  { label: 'Replace one −1 card with one +1 "Heal 1, Shield 1 ally" card', boxesRequired: 2 },
  { label: 'Replace one +0 card with one +1 "Heal 1, Shield 1 ally" card', boxesRequired: 3 },
  { label: 'Replace one +0 card with one +1 Dark card', boxesRequired: 1 },
  { label: 'Replace one +0 card with one +1 Frost card', boxesRequired: 2 },
  { label: 'Add two +1 Frost cards', boxesRequired: 1 },
  { label: 'Add two +1 Dark cards', boxesRequired: 1 },
  { label: 'Add one +3 card', boxesRequired: 1 },
  { label: 'Ignore scenario effects', boxesRequired: 1 },
  {
    label: 'Grave Defense: whenever you rest, you may consume Frost + Dark to give Dark to one ally who has Dark',
    boxesRequired: 1,
  },
]
