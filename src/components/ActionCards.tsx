import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { CARD_TAGS, type ActionCard, type CardTag } from '../types'

interface ActionCardsProps {
  cards: ActionCard[]
  onChange: Dispatch<SetStateAction<ActionCard[]>>
}

const emptyDraft = {
  name: '',
  level: 1,
  initiative: 30,
  topText: '',
  bottomText: '',
  topLoss: false,
  bottomLoss: false,
  tags: [] as CardTag[],
}

export function ActionCards({ cards, onChange }: ActionCardsProps) {
  const [showAdd, setShowAdd] = useState(cards.length === 0)
  const [draft, setDraft] = useState(emptyDraft)
  const [topCardId, setTopCardId] = useState<string | null>(null)
  const [bottomCardId, setBottomCardId] = useState<string | null>(null)
  const [restPicker, setRestPicker] = useState<'short' | 'long' | null>(null)

  const hand = cards.filter((c) => c.status === 'hand')
  const used = cards.filter((c) => c.status === 'used')
  const lost = cards.filter((c) => c.status === 'lost')

  const topCard = cards.find((c) => c.id === topCardId) ?? null
  const bottomCard = cards.find((c) => c.id === bottomCardId) ?? null
  const roundInitiative =
    topCard && bottomCard ? Math.min(topCard.initiative, bottomCard.initiative) : null

  const addCard = () => {
    if (!draft.name.trim()) return
    onChange((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: draft.name.trim(),
        level: draft.level,
        initiative: draft.initiative,
        topText: draft.topText.trim(),
        bottomText: draft.bottomText.trim(),
        topLoss: draft.topLoss,
        bottomLoss: draft.bottomLoss,
        tags: draft.tags,
        status: 'hand',
      },
    ])
    setDraft(emptyDraft)
    setShowAdd(false)
  }

  const removeCard = (id: string) => onChange((prev) => prev.filter((c) => c.id !== id))

  const toggleTag = (tag: CardTag) =>
    setDraft((d) => ({
      ...d,
      tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag],
    }))

  const confirmRound = () => {
    if (!topCardId || !bottomCardId) return
    onChange((prev) =>
      prev.map((c) => {
        if (c.id === topCardId) return { ...c, status: c.topLoss ? 'lost' : 'used' }
        if (c.id === bottomCardId) return { ...c, status: c.bottomLoss ? 'lost' : 'used' }
        return c
      }),
    )
    setTopCardId(null)
    setBottomCardId(null)
  }

  const shortRest = (loseCardId: string | null) => {
    onChange((prev) =>
      prev.map((c) => {
        if (c.status !== 'used') return c
        return c.id === loseCardId ? { ...c, status: 'lost' } : { ...c, status: 'hand' }
      }),
    )
    setRestPicker(null)
  }

  const longRest = (recoverLostId: string | null) => {
    onChange((prev) =>
      prev.map((c) => {
        if (c.status === 'used') return { ...c, status: 'hand' }
        if (c.status === 'lost' && c.id === recoverLostId) return { ...c, status: 'hand' }
        return c
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
        <button type="button" className="link-btn" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? 'Cancel' : '+ Add card'}
        </button>
      </div>

      {cards.length === 0 && !showAdd && (
        <p className="empty-hint">
          Add your 11 Human Voidwarden cards from your hand — name, initiative, and top/bottom actions —
          to track them and get pairing suggestions.
        </p>
      )}

      {showAdd && (
        <form
          className="card-form"
          onSubmit={(e) => {
            e.preventDefault()
            addCard()
          }}
        >
          <div className="card-form-row">
            <input
              className="text-input"
              placeholder="Card name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
            <input
              className="text-input tiny"
              type="number"
              placeholder="Lvl"
              value={draft.level}
              onChange={(e) => setDraft((d) => ({ ...d, level: Number(e.target.value) }))}
            />
            <input
              className="text-input tiny"
              type="number"
              placeholder="Init."
              value={draft.initiative}
              onChange={(e) => setDraft((d) => ({ ...d, initiative: Number(e.target.value) }))}
            />
          </div>
          <div className="card-form-row">
            <input
              className="text-input"
              placeholder="Top action"
              value={draft.topText}
              onChange={(e) => setDraft((d) => ({ ...d, topText: e.target.value }))}
            />
            <label className="loss-toggle">
              <input
                type="checkbox"
                checked={draft.topLoss}
                onChange={(e) => setDraft((d) => ({ ...d, topLoss: e.target.checked }))}
              />
              loss
            </label>
          </div>
          <div className="card-form-row">
            <input
              className="text-input"
              placeholder="Bottom action"
              value={draft.bottomText}
              onChange={(e) => setDraft((d) => ({ ...d, bottomText: e.target.value }))}
            />
            <label className="loss-toggle">
              <input
                type="checkbox"
                checked={draft.bottomLoss}
                onChange={(e) => setDraft((d) => ({ ...d, bottomLoss: e.target.checked }))}
              />
              loss
            </label>
          </div>
          <div className="tag-picker">
            {CARD_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                className={`tag-chip ${draft.tags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <button type="submit" className="primary-btn">
            Save card
          </button>
        </form>
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
            </div>
          </div>
          <div className="round-actions">
            <button type="button" className="link-btn" onClick={() => { setTopCardId(null); setBottomCardId(null) }}>
              Clear
            </button>
            <button type="button" className="primary-btn" disabled={!topCard || !bottomCard} onClick={confirmRound}>
              Confirm round
            </button>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions">
          <span className="muted">Suggested pairing:</span>
          {suggestions.map(({ card }) => (
            <button type="button" key={card.id} className="suggestion-chip" onClick={() => setBottomCardId(card.id)}>
              {card.name} ({card.initiative})
            </button>
          ))}
        </div>
      )}

      <div className="card-columns">
        <div className="card-column">
          <h3>Hand ({hand.length})</h3>
          {hand
            .slice()
            .sort((a, b) => a.initiative - b.initiative)
            .map((card) => (
              <div key={card.id} className="action-card">
                <div className="action-card-head">
                  <strong>{card.name}</strong>
                  <span className="head-right">
                    <span className="init-badge">{card.initiative}</span>
                    <button type="button" className="remove-btn" onClick={() => removeCard(card.id)} aria-label="Remove card">
                      ×
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
                    onClick={() => setTopCardId(topCardId === card.id ? null : card.id)}
                  >
                    Top{card.topLoss ? ' 🔥' : ''}: {card.topText || '—'}
                  </button>
                  <button
                    type="button"
                    className={`side-btn ${bottomCardId === card.id ? 'active' : ''}`}
                    disabled={topCardId === card.id}
                    onClick={() => setBottomCardId(bottomCardId === card.id ? null : card.id)}
                  >
                    Bottom{card.bottomLoss ? ' 🔥' : ''}: {card.bottomText || '—'}
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
            <button type="button" className="secondary-btn" disabled={used.length === 0} onClick={() => setRestPicker('short')}>
              Short Rest
            </button>
            <button type="button" className="secondary-btn" disabled={used.length === 0} onClick={() => setRestPicker('long')}>
              Long Rest
            </button>
          </div>

          {restPicker === 'short' && (
            <div className="lost-picker">
              <span className="muted">If you drew a −1/−2, pick a card to lose instead of taking damage:</span>
              <div className="tag-picker">
                <button type="button" className="tag-chip" onClick={() => shortRest(null)}>
                  No loss
                </button>
                {used.map((card) => (
                  <button type="button" key={card.id} className="tag-chip" onClick={() => shortRest(card.id)}>
                    {card.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {restPicker === 'long' && (
            <div className="lost-picker">
              <span className="muted">Recover one lost card (optional):</span>
              <div className="tag-picker">
                <button type="button" className="tag-chip" onClick={() => longRest(null)}>
                  None
                </button>
                {lost.map((card) => (
                  <button type="button" key={card.id} className="tag-chip" onClick={() => longRest(card.id)}>
                    {card.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
