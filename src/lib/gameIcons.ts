// Maps Gloomhaven/Frosthaven game terms to the Voidwarden glyph tiles served from
// public/icons/ (sliced from docs/reference/glyph-lexicon.png — the user's own art).
// All icon knowledge lives here and in CardText, so the stored card/perk/mastery
// text stays plain paraphrase and the artwork can be re-sliced or replaced without
// touching any data.
//
// Matching is case-sensitive on the capitalized forms — our paraphrases capitalize a
// word only when it means the game concept (e.g. "Attack 3", "Consume Ice"), and leave
// incidental uses lowercase ("your attack modifier deck", "move through"), so case is a
// reliable signal and avoids decorating the wrong words. Numbers stay as plain text next
// to the glyph, so "Shield 1" / "Move 4" render as <glyph> + "Shield 1" / "Move 4".

/** The red X the physical cards print on a lost half. Kept out of GAME_ICONS so it
 *  never matches text — it's rendered explicitly where a loss is shown, and it's a UI
 *  marker rather than a lexicon glyph, so it stays an emoji. */
export const LOSS_ICON = '❌'

const ICON_BASE = '/icons'

// term -> tile filename (without extension) under public/icons/.
const ICON_FILES: Record<string, string> = {
  // Elements
  Fire: 'fire',
  Ice: 'ice',
  Frost: 'frost',
  Dark: 'dark',
  Earth: 'earth',
  Light: 'light',
  Air: 'air',
  // Conditions
  Poison: 'poison',
  Wound: 'wound',
  Curse: 'curse',
  Bless: 'bless',
  Stun: 'stun',
  Muddle: 'muddle',
  Immobilize: 'immobilize',
  Disarm: 'disarm',
  Strengthen: 'strengthen',
  Ward: 'ward',
  Regenerate: 'regenerate',
  // Actions / attributes
  Attack: 'attack',
  Move: 'move',
  Heal: 'heal',
  Shield: 'shield',
  Loot: 'loot',
  Jump: 'jump',
  Target: 'target',
  // Meta
  XP: 'xp',
}

/** term -> public image path for its glyph tile. */
export const GAME_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(ICON_FILES).map(([term, file]) => [term, `${ICON_BASE}/${file}.png`]),
)

// Longest terms first so a multi-word term would win over a prefix (none today,
// but keeps the regex correct if compound terms are added).
const TERMS = Object.keys(GAME_ICONS).sort((a, b) => b.length - a.length)
const ICON_RE = new RegExp(`\\b(${TERMS.join('|')})\\b`, 'g')

export interface TextSegment {
  text: string
  /** Set when this segment is a recognized game term; the image path of its glyph. */
  icon?: string
}

/** Split a paraphrase into plain-text and icon segments for CardText to render. */
export function toIconSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  let last = 0
  for (const m of text.matchAll(ICON_RE)) {
    const i = m.index ?? 0
    if (i > last) segments.push({ text: text.slice(last, i) })
    segments.push({ text: m[0], icon: GAME_ICONS[m[0]] })
    last = i + m[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last) })
  return segments
}
