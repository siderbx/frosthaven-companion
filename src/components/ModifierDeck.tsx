import { useState, type Dispatch, type SetStateAction } from 'react'
import type { ModifierCardType, ModifierDeckState } from '../types'
import { drawCard, freshDeck, shuffleAll } from '../lib/modifierDeck'

interface ModifierDeckProps {
  deck: ModifierDeckState
  onChange: Dispatch<SetStateAction<ModifierDeckState>>
}

export function ModifierDeck({ deck, onChange }: ModifierDeckProps) {
  const [editing, setEditing] = useState(false)

  const lastCard = deck.composition.find((c) => c.id === deck.lastDrawnId)
  const remaining = deck.drawPile.length
  const inDiscard = deck.discardPile.length

  const draw = () => onChange((prev) => drawCard(prev))
  const shuffle = () => onChange((prev) => shuffleAll(prev))

  const updateComposition = (next: ModifierCardType[]) => onChange(freshDeck(next))

  const updateCount = (id: string, count: number) =>
    updateComposition(deck.composition.map((c) => (c.id === id ? { ...c, count: Math.max(0, count) } : c)))

  const removeType = (id: string) => updateComposition(deck.composition.filter((c) => c.id !== id))

  const addType = () => {
    updateComposition([
      ...deck.composition,
      { id: crypto.randomUUID(), label: 'New Card', value: '+1', count: 1, reshuffle: false },
    ])
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Attack Modifier Deck</h2>
        <button type="button" className="link-btn" onClick={() => setEditing((v) => !v)}>
          {editing ? 'Done editing' : 'Customize deck'}
        </button>
      </div>

      {!editing && (
        <>
          <div className="deck-stage">
            <button type="button" className="draw-card" onClick={draw}>
              {lastCard ? (
                <span className={`card-face ${deck.lastDrawWasReshuffle ? 'special' : ''}`}>{lastCard.value}</span>
              ) : (
                <span className="card-face placeholder">Draw</span>
              )}
            </button>
            {deck.lastDrawWasReshuffle && <p className="reshuffle-note">Deck reshuffled</p>}
          </div>

          <div className="deck-meta">
            <span>{remaining} left</span>
            <span>{inDiscard} discarded</span>
            <button type="button" className="link-btn" onClick={shuffle}>
              Shuffle now
            </button>
          </div>
        </>
      )}

      {editing && (
        <div className="deck-editor">
          <p className="empty-hint">
            Adjust counts to match perks you've taken (e.g. remove a −1, add a +1). Editing reshuffles the
            deck.
          </p>
          {deck.composition.map((card) => (
            <div key={card.id} className="deck-editor-row">
              <input
                className="text-input small"
                value={card.label}
                onChange={(e) =>
                  updateComposition(
                    deck.composition.map((c) => (c.id === card.id ? { ...c, label: e.target.value } : c)),
                  )
                }
              />
              <input
                className="text-input tiny"
                value={card.value}
                onChange={(e) =>
                  updateComposition(
                    deck.composition.map((c) => (c.id === card.id ? { ...c, value: e.target.value } : c)),
                  )
                }
              />
              <div className="counter-controls compact">
                <button type="button" className="counter-btn" onClick={() => updateCount(card.id, card.count - 1)}>
                  −
                </button>
                <span className="counter-value static">{card.count}</span>
                <button type="button" className="counter-btn" onClick={() => updateCount(card.id, card.count + 1)}>
                  +
                </button>
              </div>
              <label className="reshuffle-toggle">
                <input
                  type="checkbox"
                  checked={card.reshuffle}
                  onChange={(e) =>
                    updateComposition(
                      deck.composition.map((c) =>
                        c.id === card.id ? { ...c, reshuffle: e.target.checked } : c,
                      ),
                    )
                  }
                />
                reshuffle
              </label>
              <button type="button" className="remove-btn" onClick={() => removeType(card.id)}>
                ×
              </button>
            </div>
          ))}
          <button type="button" className="primary-btn" onClick={addType}>
            Add card type
          </button>
        </div>
      )}
    </div>
  )
}
