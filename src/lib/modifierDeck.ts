import type { ModifierCardType, ModifierDeckState } from '../types'

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
