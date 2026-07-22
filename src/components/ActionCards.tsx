import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import type { ActionCard, CharacterState, ConditionType, ModifierDeckState } from '../types'
import {
  persistentEffectFor,
  VOIDWARDEN_CARD_DETAILS,
  VOIDWARDEN_HAND_SIZE,
  voidwardenActionCardFrom,
} from '../data/voidwarden'
import { CONDITION_RULES, endTurn, startTurn, type ConditionOutcome } from '../lib/conditions'
import { CardText } from './CardText'
import { GAME_ICONS, LOSS_ICON } from '../lib/gameIcons'
import { ModifierDeck } from './ModifierDeck'

interface ActionCardsProps {
  cards: ActionCard[]
  onChange: Dispatch<SetStateAction<ActionCard[]>>
  /** Character state — Confirm round / End Turn here drive the condition-expiry clock. */
  character: CharacterState
  onCharacterChange: Dispatch<SetStateAction<CharacterState>>
  deck: ModifierDeckState
  onDeckChange: Dispatch<SetStateAction<ModifierDeckState>>
}

/**
 * Confirm round doubles as the character's turn start: start-of-turn effects
 * (Regenerate, Wound) fire here. If the previous turn was never explicitly
 * ended, end it first so timed conditions still tick down every round.
 */
function beginTurn(char: CharacterState): ConditionOutcome {
  const events: string[] = []
  let state = char
  if (state.inTurn) {
    const ended = endTurn(state)
    state = ended.character
    for (const e of ended.events) events.push(`Last turn: ${e}`)
  }
  const started = startTurn(state)
  for (const e of started.events) events.push(e)
  return { character: started.character, events }
}

export function ActionCards({ cards, onChange, character, onCharacterChange, deck, onDeckChange }: ActionCardsProps) {
  const characterLevel = character.level
  const [topCardId, setTopCardId] = useState<string | null>(null)
  const [bottomCardId, setBottomCardId] = useState<string | null>(null)
  /** Selected card ids in the order they were picked — the first is the leading card. */
  const [pickOrder, setPickOrder] = useState<string[]>([])
  const [restPicker, setRestPicker] = useState<'short' | 'long' | null>(null)
  const [shortRestLoss, setShortRestLoss] = useState<{ id: string; rerolled: boolean } | null>(null)
  const [chooserCollapsed, setChooserCollapsed] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const [turnLog, setTurnLog] = useState<string[]>([])

  const reserve = cards.filter((c) => c.status === 'reserve')
  const hand = cards.filter((c) => c.status === 'hand')
  const used = cards.filter((c) => c.status === 'used')
  const lost = cards.filter((c) => c.status === 'lost')
  const active = cards.filter((c) => c.status === 'active')

  // Hand-size cap: at most 11 cards outside Reserve. Counting played piles too
  // means a card lost mid-scenario can't be replaced from Reserve — unchosen
  // cards sit out the whole scenario per the rulebook.
  const inPlay = cards.length - reserve.length
  const handFull = inPlay >= VOIDWARDEN_HAND_SIZE

  // Level-up card picks. Each level from 2 to current grants one card add, so the
  // number owed is (levels gained) minus (leveled cards already owned). Derived,
  // not stored — it self-corrects as cards are added/removed or level changes.
  const ownedNames = useMemo(() => new Set(cards.map((c) => c.name.trim().toLowerCase())), [cards])
  const leveledOwned = cards.filter((c) => c.level >= 2)
  const owedPicks = Math.max(0, characterLevel - 1) - leveledOwned.length
  const availableLevelCards = useMemo(
    () =>
      VOIDWARDEN_CARD_DETAILS.filter(
        (d) => d.level >= 2 && d.level <= characterLevel && !ownedNames.has(d.name.toLowerCase()),
      ).sort((a, b) => a.level - b.level || a.initiative - b.initiative),
    [ownedNames, characterLevel],
  )

  // Instantiate a catalog card into Reserve (swap into hand from there as wanted).
  const addFromCatalog = (name: string) => {
    const detail = VOIDWARDEN_CARD_DETAILS.find((d) => d.name === name)
    if (detail) onChange((prev) => [...prev, voidwardenActionCardFrom(detail, 'reserve')])
  }

  const confirmRemoveLeveled = (id: string) => {
    onChange((prev) => prev.filter((c) => c.id !== id))
    setPendingRemoveId(null)
  }

  const topCard = cards.find((c) => c.id === topCardId) ?? null
  const bottomCard = cards.find((c) => c.id === bottomCardId) ?? null
  // The first card picked is the leading card — its initiative is the round's
  // initiative (rulebook: the player chooses which played card leads, so
  // deliberately going late on a high number is allowed; it's not min()).
  const leadCard = cards.find((c) => c.id === pickOrder[0]) ?? null
  const roundInitiative = topCard && bottomCard && leadCard ? leadCard.initiative : null

  // Select/deselect a card for a round slot, keeping pickOrder in sync so the
  // earliest still-selected pick stays the lead.
  const pickSlot = (slot: 'top' | 'bottom', id: string) => {
    const current = slot === 'top' ? topCardId : bottomCardId
    const setSlot = slot === 'top' ? setTopCardId : setBottomCardId
    if (current === id) {
      setSlot(null)
      setPickOrder((o) => o.filter((x) => x !== id))
    } else {
      setSlot(id)
      setPickOrder((o) => [...o.filter((x) => x !== current), id])
    }
  }

  const swapLead = () => setPickOrder((o) => (o.length === 2 ? [o[1], o[0]] : o))

  const clearRound = () => {
    setTopCardId(null)
    setBottomCardId(null)
    setPickOrder([])
  }

  const moveToHand = (id: string) =>
    onChange((prev) => {
      // Re-check against prev, not the render's snapshot, so rapid taps can't
      // slip past the cap.
      const outOfReserve = prev.filter((c) => c.status !== 'reserve').length
      if (outOfReserve >= VOIDWARDEN_HAND_SIZE) return prev
      return prev.map((c) => (c.id === id ? { ...c, status: 'hand' } : c))
    })

  const moveToReserve = (id: string) =>
    onChange((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'reserve' } : c)))

  // Where a played card goes: persistent halves enter the active area with
  // their use-slot track; everything else discards (or is lost) immediately.
  const playCard = (c: ActionCard, half: 'top' | 'bottom'): ActionCard => {
    const persist = persistentEffectFor(c.name, half)
    if (persist) {
      return { ...c, status: 'active', activeCharges: persist.charges, activeHalf: half }
    }
    const isLoss = half === 'top' ? c.topLoss : c.bottomLoss
    return { ...c, status: isLoss ? 'lost' : 'used' }
  }

  const confirmRound = () => {
    if (!topCardId || !bottomCardId) return
    onChange((prev) =>
      prev.map((c) => {
        if (c.id === topCardId) return playCard(c, 'top')
        if (c.id === bottomCardId) return playCard(c, 'bottom')
        return c
      }),
    )
    // Confirming the round starts the character's turn (see beginTurn). Same
    // functional-update pattern as ConditionTracker: the log is recomputed from
    // the prop snapshot, the state update itself never drops an action.
    setTurnLog(beginTurn(character).events)
    onCharacterChange((prev) => beginTurn(prev).character)
    clearRound()
  }

  // End the turn taken at Confirm round: timed conditions tick down and expire,
  // Bane triggers. Mirrors the Character tab's End Turn button.
  const finishTurn = () => {
    setTurnLog(endTurn(character).events)
    onCharacterChange((prev) => endTurn(prev).character)
  }

  const activeConditions = Object.entries(character.conditions) as [ConditionType, number | null][]

  // Move an active card to the pile its track says it ends in.
  const finishActive = (c: ActionCard): ActionCard => {
    const persist = c.activeHalf ? persistentEffectFor(c.name, c.activeHalf) : undefined
    return { ...c, status: persist?.endsIn ?? 'lost', activeCharges: undefined, activeHalf: undefined }
  }

  // Spend one use slot; the card leaves play when the last one is spent.
  const spendCharge = (id: string) =>
    onChange((prev) =>
      prev.map((c) => {
        if (c.id !== id || c.status !== 'active' || typeof c.activeCharges !== 'number') return c
        const remaining = c.activeCharges - 1
        return remaining <= 0 ? finishActive(c) : { ...c, activeCharges: remaining }
      }),
    )

  // Manual end for whole-scenario effects (or ending a track early).
  const endActiveEffect = (id: string) =>
    onChange((prev) => prev.map((c) => (c.id === id && c.status === 'active' ? finishActive(c) : c)))

  // Short rest: randomly lose one discarded card. Rulebook p.17.
  const beginShortRest = () => {
    if (used.length < 2) return
    const pick = used[Math.floor(Math.random() * used.length)]
    setShortRestLoss({ id: pick.id, rerolled: false })
    setRestPicker('short')
  }

  // Suffer 1 damage to randomly lose a *different* card instead (once per rest).
  const rerollShortRest = () => {
    if (!shortRestLoss || shortRestLoss.rerolled) return
    const others = used.filter((c) => c.id !== shortRestLoss.id)
    if (others.length === 0) return
    const pick = others[Math.floor(Math.random() * others.length)]
    setShortRestLoss({ id: pick.id, rerolled: true })
  }

  const confirmShortRest = () => {
    if (!shortRestLoss) return
    const loseId = shortRestLoss.id
    onChange((prev) =>
      prev.map((c) => {
        if (c.status !== 'used') return c
        return c.id === loseId ? { ...c, status: 'lost' } : { ...c, status: 'hand' }
      }),
    )
    setShortRestLoss(null)
    setRestPicker(null)
  }

  // Long rest: choose one discarded card to lose, recover the rest. Rulebook p.17.
  const longRest = (loseCardId: string) => {
    onChange((prev) =>
      prev.map((c) => {
        if (c.status !== 'used') return c
        return c.id === loseCardId ? { ...c, status: 'lost' } : { ...c, status: 'hand' }
      }),
    )
    setRestPicker(null)
  }

  const suggestions = useMemo(() => {
    if (!topCardId || bottomCardId) return []
    const anchor = cards.find((c) => c.id === topCardId)
    if (!anchor) return []
    return hand
      .filter((c) => c.id !== anchor.id)
      .map((c) => {
        const sharedTags = c.tags.filter((t) => anchor.tags.includes(t)).length
        const newTags = c.tags.filter((t) => !anchor.tags.includes(t)).length
        const bothLoss = anchor.topLoss && c.bottomLoss
        const score = newTags * 2 - sharedTags - (bothLoss ? 3 : 0)
        return { card: c, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [topCardId, bottomCardId, hand, cards])

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Action Cards</h2>
      </div>

      {owedPicks > 0 && (
        <div className="level-pick-panel">
          <div className="level-pick-head">
            <strong>
              Level-up card pick{owedPicks > 1 ? `s — ${owedPicks} to choose` : ''}
            </strong>
            <button type="button" className="link-btn" onClick={() => setChooserCollapsed((v) => !v)}>
              {chooserCollapsed ? 'Choose now' : 'Choose later'}
            </button>
          </div>
          {!chooserCollapsed && (
            <>
              <p className="field-hint">
                Leveling up lets you add one card to your pool — pick from your new level's cards or a
                lower-level card you skipped. Added cards go to Reserve; swap them into your hand of 11 as you like.
              </p>
              {availableLevelCards.length === 0 ? (
                <p className="field-hint">No cards left to add at your current level.</p>
              ) : (
                <div className="level-pick-list">
                  {availableLevelCards.map((d) => (
                    <div key={d.name} className="action-card level-pick-card">
                      <div className="action-card-head">
                        <strong>{d.name}</strong>
                        <span className="head-right">
                          <span className="lvl-badge">L{d.level}</span>
                          <span className="init-badge">{d.initiative}</span>
                          <button
                            type="button"
                            className="secondary-btn small"
                            onClick={() => addFromCatalog(d.name)}
                          >
                            Add
                          </button>
                        </span>
                      </div>
                      <div className="action-card-body">
                        <span className="side-static">
                          Top{d.topLoss ? ' 🔥' : ''}: {d.topText}
                        </span>
                        <span className="side-static">
                          Bottom{d.bottomLoss ? ' 🔥' : ''}: {d.bottomText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {owedPicks < 0 && (
        <div className="level-pick-panel over-cap">
          <div className="level-pick-head">
            <strong>Level down — more cards than your level allows</strong>
          </div>
          <p className="field-hint">
            You have {-owedPicks} leveled card{-owedPicks > 1 ? 's' : ''} beyond what level {characterLevel}{' '}
            grants. Remove one to hand the pick back — or keep it if you're mid-scenario and sorting it out later.
          </p>
          <div className="level-pick-list">
            {leveledOwned.map((card) => (
              <div key={card.id} className="action-card compact reserve-row">
                <span>
                  {card.name} <span className="muted">(L{card.level} · {card.initiative})</span>
                </span>
                {pendingRemoveId === card.id ? (
                  <span className="head-right">
                    <button
                      type="button"
                      className="secondary-btn small"
                      onClick={() => confirmRemoveLeveled(card.id)}
                    >
                      Remove
                    </button>
                    <button type="button" className="link-btn small" onClick={() => setPendingRemoveId(null)}>
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button type="button" className="link-btn small" onClick={() => setPendingRemoveId(card.id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cards.length === 0 && (
        <p className="empty-hint">Your 14 starting Human Voidwarden cards seed automatically.</p>
      )}

      {(character.inTurn || activeConditions.length > 0 || turnLog.length > 0) && (
        <div className="turn-strip">
          <div className="turn-strip-row">
            {activeConditions.length > 0 ? (
              <span className="turn-conditions">
                {activeConditions.map(([type, left]) => (
                  <span key={type} className="condition-chip" title={CONDITION_RULES[type]}>
                    <img className="condition-icon" src={GAME_ICONS[type]} alt="" aria-hidden="true" />
                    {type}
                    {typeof left === 'number' && (
                      <span
                        className="condition-timer"
                        title={`Expires after ${left} more of your turn end${left === 1 ? '' : 's'}`}
                      >
                        {left}
                      </span>
                    )}
                  </span>
                ))}
              </span>
            ) : (
              <span className="muted">No active conditions</span>
            )}
            {character.inTurn && (
              <button type="button" className="secondary-btn small turn-btn in-turn" onClick={finishTurn}>
                End Turn
              </button>
            )}
          </div>
          {turnLog.length > 0 && (
            <ul className="condition-log">
              {turnLog.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
          {character.inTurn && (
            <p className="field-hint">
              Confirm round started your turn (Wound / Regenerate applied). End Turn when you finish acting —
              that's when timed conditions tick down. Toggle conditions on the Character tab as you gain them.
            </p>
          )}
        </div>
      )}

      {(topCard || bottomCard) && (
        <div className="round-picker">
          <h3>This round</h3>
          <div className="round-slots">
            <div className="round-slot">
              <span className="muted">Top from</span>
              <strong>{topCard ? topCard.name : '—'}</strong>
            </div>
            <div className="round-slot">
              <span className="muted">Bottom from</span>
              <strong>{bottomCard ? bottomCard.name : '—'}</strong>
            </div>
            <div className="round-slot">
              <span className="muted">Initiative</span>
              <strong>{roundInitiative ?? '—'}</strong>
              {leadCard && <span className="muted">lead: {leadCard.name}</span>}
            </div>
          </div>
          <div className="round-actions">
            {suggestions.length > 0 && (
              <div className="suggestions">
                <span className="muted">Suggested:</span>
                {suggestions.map(({ card }) => (
                  <button
                    type="button"
                    key={card.id}
                    className="suggestion-chip"
                    onClick={() => pickSlot('bottom', card.id)}
                  >
                    {card.name} ({card.initiative})
                  </button>
                ))}
              </div>
            )}
            <div className="round-buttons">
              {topCard && bottomCard && (
                <button type="button" className="link-btn" onClick={swapLead}>
                  Swap lead
                </button>
              )}
              <button type="button" className="link-btn" onClick={clearRound}>
                Clear
              </button>
              <button type="button" className="primary-btn" disabled={!topCard || !bottomCard} onClick={confirmRound}>
                Confirm round
              </button>
            </div>
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div className="active-effects">
          <h3>Active effects ({active.length})</h3>
          {active.map((card) => {
            const half = card.activeHalf ?? 'top'
            const persist = persistentEffectFor(card.name, half)
            const total = persist?.charges ?? null
            const remaining = typeof card.activeCharges === 'number' ? card.activeCharges : null
            return (
              <div key={card.id} className="action-card active-effect">
                <div className="action-card-head">
                  <strong>{card.name}</strong>
                  <span className="head-right">
                    <span className="muted">{half} action</span>
                    <button type="button" className="link-btn small" onClick={() => endActiveEffect(card.id)}>
                      End effect
                    </button>
                  </span>
                </div>
                <p className="active-effect-text">
                  <CardText text={half === 'top' ? card.topText : card.bottomText} />
                </p>
                {persist?.note && (
                  <p className="field-hint">
                    <CardText text={persist.note} />
                  </p>
                )}
                {total !== null && remaining !== null ? (
                  <div className="charge-row">
                    <span className="charge-pips" aria-label={`${remaining} of ${total} charges left`}>
                      {Array.from({ length: total }, (_, i) => (
                        <span key={i} className={`pip ${i < remaining ? 'full' : 'spent'}`} />
                      ))}
                    </span>
                    <button type="button" className="secondary-btn small" onClick={() => spendCharge(card.id)}>
                      Use charge ({remaining} left)
                    </button>
                  </div>
                ) : (
                  <span className="muted">Lasts all scenario</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="card-columns">
        <div className="card-column">
          <h3>Hand ({hand.length})</h3>
          {hand
            .slice()
            .sort((a, b) => {
              // Cards picked for this round float to the top for quick reference.
              const aSelected = a.id === topCardId || a.id === bottomCardId
              const bSelected = b.id === topCardId || b.id === bottomCardId
              if (aSelected !== bSelected) return aSelected ? -1 : 1
              return a.initiative - b.initiative
            })
            .map((card) => (
              <div key={card.id} className="action-card">
                <div className="action-card-head">
                  <strong>{card.name}</strong>
                  <span className="head-right">
                    <span className="init-badge">{card.initiative}</span>
                    <button type="button" className="link-btn small" onClick={() => moveToReserve(card.id)}>
                      To Reserve
                    </button>
                  </span>
                </div>
                {card.tags.length > 0 && (
                  <div className="card-tags">
                    {card.tags.map((t) => (
                      <span key={t} className="tag-chip small">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="action-card-body">
                  <button
                    type="button"
                    className={`side-btn ${topCardId === card.id ? 'active' : ''}`}
                    disabled={bottomCardId === card.id}
                    onClick={() => pickSlot('top', card.id)}
                  >
                    Top{card.topLoss ? ` ${LOSS_ICON}` : ''}:{' '}
                    {card.topText ? <CardText text={card.topText} /> : '—'}
                  </button>
                  <button
                    type="button"
                    className={`side-btn ${bottomCardId === card.id ? 'active' : ''}`}
                    disabled={topCardId === card.id}
                    onClick={() => pickSlot('bottom', card.id)}
                  >
                    Bottom{card.bottomLoss ? ` ${LOSS_ICON}` : ''}:{' '}
                    {card.bottomText ? <CardText text={card.bottomText} /> : '—'}
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="card-column">
          <h3>Used ({used.length})</h3>
          {used.map((card) => (
            <div key={card.id} className="action-card compact">
              {card.name}
            </div>
          ))}

          <h3>Lost ({lost.length})</h3>
          {lost.map((card) => (
            <div key={card.id} className="action-card compact lost">
              {card.name}
            </div>
          ))}

          <div className="rest-actions">
            <button type="button" className="secondary-btn" disabled={used.length < 2} onClick={beginShortRest}>
              Short Rest
            </button>
            <button type="button" className="secondary-btn" disabled={used.length < 2} onClick={() => setRestPicker('long')}>
              Long Rest
            </button>
          </div>
          {used.length < 2 && used.length > 0 && (
            <span className="muted">A rest needs 2+ cards in the discard pile.</span>
          )}

          {restPicker === 'short' && shortRestLoss && (
            <div className="lost-picker">
              <span className="muted">
                Randomly lost: <strong>{cards.find((c) => c.id === shortRestLoss.id)?.name}</strong>. The rest return to your hand.
              </span>
              <div className="tag-picker">
                <button type="button" className="tag-chip" onClick={confirmShortRest}>
                  Confirm
                </button>
                {!shortRestLoss.rerolled && used.length > 1 && (
                  <button type="button" className="tag-chip" onClick={rerollShortRest}>
                    Suffer 1 damage — lose a different card
                  </button>
                )}
              </div>
            </div>
          )}

          {restPicker === 'long' && (
            <div className="lost-picker">
              <span className="muted">
                Choose one discarded card to lose (the rest return to hand). Then Heal 2 (Self) and refresh spent items.
              </span>
              <div className="tag-picker">
                {used.map((card) => (
                  <button type="button" key={card.id} className="tag-chip" onClick={() => longRest(card.id)}>
                    {card.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ModifierDeck deck={deck} onChange={onDeckChange} />

          {reserve.length > 0 && (
            <>
              <h3>Reserve ({reserve.length})</h3>
              <p className="field-hint">Cards not currently in your hand of {VOIDWARDEN_HAND_SIZE} — your 3 starting "X" cards plus any level-up cards you've added.</p>
              {handFull && (
                <p className="field-hint over-cap-hint">
                  Your {VOIDWARDEN_HAND_SIZE} scenario cards are all in play (hand, discarded, lost, or active) —
                  move one to Reserve first. Swaps happen between scenarios.
                </p>
              )}
              {reserve.map((card) => (
                <div key={card.id} className="action-card compact reserve-row">
                  <span>
                    {card.name} <span className="muted">({card.initiative})</span>
                  </span>
                  <button
                    type="button"
                    className="link-btn small"
                    disabled={handFull}
                    title={handFull ? `Hand of ${VOIDWARDEN_HAND_SIZE} is full` : undefined}
                    onClick={() => moveToHand(card.id)}
                  >
                    To Hand
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
