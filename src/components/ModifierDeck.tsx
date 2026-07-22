import { useState, type Dispatch, type SetStateAction } from 'react'
import type { ModifierDeckState } from '../types'
import { drawCard, shuffleAll, defaultComposition } from '../lib/modifierDeck'
import { modifierIcon, GAME_ICONS } from '../lib/gameIcons'

interface ModifierDeckProps {
  deck: ModifierDeckState
  onChange: Dispatch<SetStateAction<ModifierDeckState>>
}

const baseCounts = new Map(defaultComposition().map((c) => [c.id, c.count]))

export function ModifierDeck({ deck, onChange }: ModifierDeckProps) {
  const [showComposition, setShowComposition] = useState(false)

  const lastCard = deck.composition.find((c) => c.id === deck.lastDrawnId)
  const lastCardIcon = lastCard && modifierIcon(lastCard.value)
  const remaining = deck.drawPile.length
  const inDiscard = deck.discardPile.length
  const totalCards = deck.composition.reduce((sum, c) => sum + c.count, 0)

  const draw = () => onChange((prev) => drawCard(prev))
  const shuffle = () => onChange((prev) => shuffleAll(prev))

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Attack Modifier Deck</h2>
        <button type="button" className="link-btn" onClick={() => setShowComposition((v) => !v)}>
          {showComposition ? 'Hide composition' : 'Show composition'}
        </button>
      </div>

      {!showComposition && (
        <>
          <div className="deck-stage">
            <button type="button" className="draw-card" onClick={draw}>
              {lastCard ? (
                <span className="card-token">
                  {lastCardIcon ? (
                    <img
                      className={`card-face-img ${deck.lastDrawWasReshuffle ? 'special' : ''}`}
                      src={lastCardIcon}
                      alt={lastCard.value}
                    />
                  ) : (
                    <span className={`card-face ${deck.lastDrawWasReshuffle ? 'special' : ''}`}>{lastCard.value}</span>
                  )}
                  {lastCard.icons && lastCard.icons.length > 0 && (
                    <span className="card-token-effects">
                      {lastCard.icons.map((term) => (
                        <img key={term} className="token-effect" src={GAME_ICONS[term]} alt={term} title={term} />
                      ))}
                    </span>
                  )}
                </span>
              ) : (
                <span className="card-face placeholder">Draw</span>
              )}
            </button>
            {lastCard?.fromPerk && <p className="reshuffle-note perk-drawn">{lastCard.label}</p>}
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

      {showComposition && (
        <div className="deck-comp">
          <p className="empty-hint">
            This deck is built from the base 20-card deck plus the perks you've taken. To change it, pick or
            un-pick perks on the <strong>Perks</strong> tab — it rebuilds and reshuffles automatically.
          </p>
          <ul className="deck-comp-list">
            {deck.composition.map((card) => {
              const base = baseCounts.get(card.id) ?? 0
              const delta = card.count - base
              const icon = modifierIcon(card.value)
              return (
                <li key={card.id} className={`deck-comp-row ${card.fromPerk ? 'from-perk' : ''}`}>
                  <span className="deck-comp-face">
                    {icon ? <img className="deck-comp-face-img" src={icon} alt={card.value} /> : card.value}
                    {card.icons?.map((term) => (
                      <img key={term} className="deck-comp-effect" src={GAME_ICONS[term]} alt={term} title={term} />
                    ))}
                  </span>
                  <span className="deck-comp-label">{card.label}</span>
                  {card.fromPerk && <span className="perk-badge">from perk</span>}
                  {!card.fromPerk && delta !== 0 && (
                    <span className="perk-badge muted">
                      {delta > 0 ? '+' : ''}
                      {delta} vs base
                    </span>
                  )}
                  <span className="deck-comp-count">×{card.count}</span>
                </li>
              )
            })}
          </ul>
          <div className="deck-comp-total">{totalCards} cards total</div>
        </div>
      )}
    </div>
  )
}
