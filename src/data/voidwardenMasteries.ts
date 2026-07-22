/**
 * Human Voidwarden masteries, transcribed from the physical character mat
 * (docs/reference/voidwarden-character-mat.jpg). Mastery 2's four condition
 * icons were identified by matching the mat's diamond glyphs against the
 * official condition icons (frosthaven-reference.github.io/assets/icons/):
 * Poison (skull), Strengthen (flexed arm), Bless (triangle-in-circle with
 * orbiting motes), and Ward (flame-wreathed shield — the same glyph as the
 * Grave Defense perk's "give" icon). An earlier pass misread the Bless glyph
 * as Regenerate; the official Regenerate icon (a dissolving hand) looks
 * nothing like it, and the Voidwarden can grant Bless but not Regenerate.
 */
import type { Mastery } from '../types'

export const VOIDWARDEN_MASTERIES: string[] = [
  'Cause enemies to suffer 20 or more damage in a single turn with granted or commanded attacks',
  'Give at least one ally or enemy Poison, Strengthen, Bless, or Ward each round',
]

/**
 * Old→new mastery text for the Mastery 2 icon identifications. Masteries persist
 * in localStorage and are user-editable, so this renames only the exact stale
 * seed texts — any text the user has since typed is left untouched.
 */
const MASTERY_TEXT_FIXES: Record<string, string> = {
  'Give at least one ally or enemy Poison, [icon 2 unconfirmed], [icon 3 unconfirmed], or [icon 4 unconfirmed] each round':
    'Give at least one ally or enemy Poison, Strengthen, Bless, or Ward each round',
  'Give at least one ally or enemy Poison, Strengthen, Regenerate, or Ward each round':
    'Give at least one ally or enemy Poison, Strengthen, Bless, or Ward each round',
}

export function withVoidwardenMasteryFixes(masteries: Mastery[]): Mastery[] {
  return masteries.map((m) => {
    const fixed = MASTERY_TEXT_FIXES[m.text]
    return fixed ? { ...m, text: fixed } : m
  })
}
