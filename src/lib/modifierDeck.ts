import type { ModifierCardType, ModifierDeckState, PerkDeckEffect } from '../types'

/** The standard 20-card base attack modifier deck used across the Gloomhaven family of games. */
export function defaultComposition(): ModifierCardType[] {
  return [
    { id: 'minus2', label: 'Minus 2', value: '-2', count: 1, reshuffle: false },
    { id: 'minus1', label: 'Minus 1', value: '-1', count: 5, reshuffle: false },
    { id: 'plus0', label: 'Plus 0', value: '+0', count: 6, reshuffle: false },
    { id: 'plus1', label: 'Plus 1', value: '+1', count: 5, reshuffle: false },
    { id: 'plus2', label: 'Plus 2', value: '+2', count: 1, reshuffle: false },
    { id: 'crit', label: 'Critical', value: 'x2', count: 1, reshuffle: true },
    { id: 'miss', label: 'Miss', value: 'Null', count: 1, reshuffle: true },
  ]
}

/**
 * The special modifier cards a perk can add, beyond the base 20. Keyed by the
 * card-kind id that `PerkDeckEffect.add` references. These draw as their numeric
 * value in the sim; their added element/effect (Frost, Poison, …) is flavour the
 * sim doesn't resolve (nor does it model rolling modifiers — a pre-existing
 * limitation), so they're treated as ordinary non-reshuffle cards.
 */
const PERK_CARD_KINDS: Record<string, Omit<ModifierCardType, 'count'>> = {
  // The two "Heal 1, Target 1 ally" perk cards differ by their base value: the
  // −1→ replacement is a +0 card, the +0→ replacement is a +1 card (per the mat).
  'heal-target0': { id: 'heal-target0', label: '+0 Heal 1, Target 1 ally', value: '+0', reshuffle: false, fromPerk: true, icons: ['Heal', 'Target'] },
  'heal-target1': { id: 'heal-target1', label: '+1 Heal 1, Target 1 ally', value: '+1', reshuffle: false, fromPerk: true, icons: ['Heal', 'Target'] },
  poison1: { id: 'poison1', label: '+1 Poison', value: '+1', reshuffle: false, fromPerk: true, icons: ['Poison'] },
  curse1: { id: 'curse1', label: '+1 Curse', value: '+1', reshuffle: false, fromPerk: true, icons: ['Curse'] },
  frost1: { id: 'frost1', label: '+1 Frost', value: '+1', reshuffle: false, fromPerk: true, icons: ['Frost'] },
  dark1: { id: 'dark1', label: '+1 Dark', value: '+1', reshuffle: false, fromPerk: true, icons: ['Dark'] },
  plus3: { id: 'plus3', label: 'Plus 3', value: '+3', reshuffle: false, fromPerk: true },
}

function cardMeta(id: string): Omit<ModifierCardType, 'count'> | undefined {
  const base = defaultComposition().find((c) => c.id === id)
  if (base) return base
  return PERK_CARD_KINDS[id]
}

/**
 * Build the deck composition from the base 20 plus the deck effects of every perk
 * pick the character has taken. This is a pure function of the effects, so the
 * deck is fully derived — unpicking a perk automatically reverts its change.
 */
export function deriveDeckComposition(effects: PerkDeckEffect[]): ModifierCardType[] {
  const counts = new Map<string, number>()
  const order: string[] = []
  for (const c of defaultComposition()) {
    counts.set(c.id, c.count)
    order.push(c.id)
  }
  for (const eff of effects) {
    for (const id of eff.remove ?? []) counts.set(id, (counts.get(id) ?? 0) - 1)
    for (const id of eff.add ?? []) {
      if (!counts.has(id)) {
        counts.set(id, 0)
        order.push(id)
      }
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }
  return order
    .map((id) => {
      const meta = cardMeta(id)
      if (!meta) return null
      return { ...meta, count: Math.max(0, counts.get(id) ?? 0) }
    })
    .filter((c): c is ModifierCardType => c !== null && c.count > 0)
}

/** True when two compositions have the same card kinds at the same counts (order-independent). */
export function sameComposition(a: ModifierCardType[], b: ModifierCardType[]): boolean {
  if (a.length !== b.length) return false
  const countsA = new Map(a.map((c) => [c.id, c.count]))
  return b.every((c) => countsA.get(c.id) === c.count)
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function expand(composition: ModifierCardType[]): string[] {
  return composition.flatMap((card) => Array(card.count).fill(card.id) as string[])
}

export function freshDeck(composition: ModifierCardType[]): ModifierDeckState {
  return {
    composition,
    drawPile: shuffle(expand(composition)),
    discardPile: [],
    lastDrawnId: null,
    lastDrawWasReshuffle: false,
  }
}

export function drawCard(state: ModifierDeckState): ModifierDeckState {
  let drawPile = state.drawPile
  let discardPile = state.discardPile

  if (drawPile.length === 0) {
    if (discardPile.length === 0) return state
    drawPile = shuffle(discardPile)
    discardPile = []
  }

  const [drawnId, ...rest] = drawPile
  const drawnType = state.composition.find((c) => c.id === drawnId)
  const reshuffle = drawnType?.reshuffle ?? false
  const nextDiscard = [...discardPile, drawnId]

  if (reshuffle) {
    return {
      ...state,
      drawPile: shuffle([...rest, ...nextDiscard]),
      discardPile: [],
      lastDrawnId: drawnId,
      lastDrawWasReshuffle: true,
    }
  }

  return {
    ...state,
    drawPile: rest,
    discardPile: nextDiscard,
    lastDrawnId: drawnId,
    lastDrawWasReshuffle: false,
  }
}

export function shuffleAll(state: ModifierDeckState): ModifierDeckState {
  return {
    ...state,
    drawPile: shuffle([...state.drawPile, ...state.discardPile]),
    discardPile: [],
    lastDrawnId: null,
    lastDrawWasReshuffle: false,
  }
}
