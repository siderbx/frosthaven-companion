/**
 * Human Voidwarden masteries, transcribed from the physical character mat
 * (docs/reference/voidwarden-character-mat.jpg). Mastery 2's four condition
 * icons were read at high zoom: Poison (skull) and Strengthen (flexed arm) are
 * unambiguous; Regenerate (cyclic arrows) and Ward (shield/flame — the same
 * glyph as the Grave Defense perk's "give" icon) are the confident best reading.
 */
import type { Mastery } from '../types'

export const VOIDWARDEN_MASTERIES: string[] = [
  'Cause enemies to suffer 20 or more damage in a single turn with granted or commanded attacks',
  'Give at least one ally or enemy Poison, Strengthen, Regenerate, or Ward each round',
]

/**
 * Old→new mastery text for the Mastery 2 icon identifications. Masteries persist
 * in localStorage and are user-editable, so this renames only the exact stale
 * seed placeholder — any text the user has since typed is left untouched.
 */
const MASTERY_TEXT_FIXES: Record<string, string> = {
  'Give at least one ally or enemy Poison, [icon 2 unconfirmed], [icon 3 unconfirmed], or [icon 4 unconfirmed] each round':
    'Give at least one ally or enemy Poison, Strengthen, Regenerate, or Ward each round',
}

export function withVoidwardenMasteryFixes(masteries: Mastery[]): Mastery[] {
  return masteries.map((m) => {
    const fixed = MASTERY_TEXT_FIXES[m.text]
    return fixed ? { ...m, text: fixed } : m
  })
}
