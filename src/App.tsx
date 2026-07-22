import { useEffect, useState } from 'react'
import './App.css'
import { CharacterSheet } from './components/CharacterSheet'
import { PerkList } from './components/PerkList'
import { MasteryList } from './components/MasteryList'
import { ActionCards } from './components/ActionCards'
import { useLocalStorage } from './hooks/useLocalStorage'
import { freshDeck, defaultComposition, deriveDeckComposition, sameComposition } from './lib/modifierDeck'
import { VOIDWARDEN_HP_BY_LEVEL, buildVoidwardenActionCards, withVoidwardenCardText } from './data/voidwarden'
import { VOIDWARDEN_PERKS, deckEffectsFromPerks, withVoidwardenPerkFixes } from './data/voidwardenPerks'
import { VOIDWARDEN_MASTERIES, withVoidwardenMasteryFixes } from './data/voidwardenMasteries'
import { RESOURCE_TYPES } from './types'
import type { ActionCard, CharacterState, Mastery, ModifierDeckState, Perk, ResourceType } from './types'

// The modifier deck lives on the Action Cards tab (drawn during attacks), so it
// has no tab of its own.
const TABS = ['Character', 'Perks', 'Action Cards'] as const
type Tab = (typeof TABS)[number]

const emptyResources = Object.fromEntries(RESOURCE_TYPES.map((r) => [r, 0])) as Record<ResourceType, number>

const defaultCharacter: CharacterState = {
  name: '',
  className: 'Human Voidwarden',
  level: 1,
  xp: 0,
  gold: 0,
  maxHp: VOIDWARDEN_HP_BY_LEVEL[1],
  currentHp: VOIDWARDEN_HP_BY_LEVEL[1],
  battleGoalCheckmarks: 0,
  resources: emptyResources,
  conditions: {},
  inTurn: false,
}

const seededPerks: Perk[] = VOIDWARDEN_PERKS.map((p) => ({
  id: crypto.randomUUID(),
  label: p.label,
  timesAvailable: p.timesAvailable,
  picks: [],
}))

const seededCards: ActionCard[] = buildVoidwardenActionCards()

const seededMasteries: Mastery[] = VOIDWARDEN_MASTERIES.map((text) => ({
  id: crypto.randomUUID(),
  text,
  achieved: false,
}))

// Sanitizers for localStorage. Data saved by an earlier version of the app may
// lack fields the current UI reads; each returns null to discard incompatible
// data (falling back to the seed) rather than letting the tab that renders it
// crash on the missing field.
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

// Character holds real user progress, so we merge onto defaults (filling fields
// added later, like `resources`) instead of discarding the whole sheet.
const sanitizeCharacter = (v: unknown): CharacterState | null => {
  if (!isObj(v)) return null
  const storedResources = isObj(v.resources) ? v.resources : {}
  const merged = {
    ...defaultCharacter,
    ...(v as Partial<CharacterState>),
    resources: { ...emptyResources, ...(storedResources as Partial<Record<ResourceType, number>>) },
    conditions: isObj(v.conditions) ? (v.conditions as CharacterState['conditions']) : {},
    inTurn: v.inTurn === true,
  }
  // Max HP is not editable — it always follows Level per the mat's table, so
  // reconcile saves from when it could be adjusted by hand.
  const maxHp = VOIDWARDEN_HP_BY_LEVEL[merged.level] ?? merged.maxHp
  return { ...merged, maxHp, currentHp: Math.min(merged.currentHp, maxHp) }
}

const sanitizePerks = (v: unknown): Perk[] | null =>
  Array.isArray(v) && v.every((p) => isObj(p) && Array.isArray(p.picks) && typeof p.timesAvailable === 'number')
    ? (v as Perk[])
    : null

const sanitizeMasteries = (v: unknown): Mastery[] | null =>
  Array.isArray(v) && v.every((m) => isObj(m) && typeof m.text === 'string' && typeof m.achieved === 'boolean')
    ? (v as Mastery[])
    : null

const sanitizeCards = (v: unknown): ActionCard[] | null =>
  Array.isArray(v) && v.every((c) => isObj(c) && typeof c.status === 'string' && Array.isArray(c.tags))
    ? (v as ActionCard[])
    : null

const sanitizeDeck = (v: unknown): ModifierDeckState | null =>
  isObj(v) && Array.isArray(v.composition) && Array.isArray(v.drawPile) && Array.isArray(v.discardPile)
    ? (v as unknown as ModifierDeckState)
    : null

function App() {
  const [tab, setTab] = useState<Tab>('Character')
  const [character, setCharacter] = useLocalStorage<CharacterState>('fh-character', defaultCharacter, sanitizeCharacter)
  const [perks, setPerks] = useLocalStorage<Perk[]>('fh-perks', seededPerks, sanitizePerks)
  const [masteries, setMasteries] = useLocalStorage<Mastery[]>('fh-masteries', seededMasteries, sanitizeMasteries)
  const [deck, setDeck] = useLocalStorage<ModifierDeckState>('fh-deck', freshDeck(defaultComposition()), sanitizeDeck)
  const [cards, setCards] = useLocalStorage<ActionCard[]>('fh-cards', seededCards, sanitizeCards)
  // Two-step confirm for the scenario reset, and a remount key so per-tab local
  // state (round picks, rest pickers, the condition log) resets along with it.
  const [confirmReset, setConfirmReset] = useState(false)
  const [scenarioEpoch, setScenarioEpoch] = useState(0)

  // Fresh slate for the next scenario: refill HP, clear conditions, return every
  // played/lost/active card to hand (the Reserve split is kept), and reshuffle
  // the full modifier deck. Progression — XP, gold, level, perks, checkmarks,
  // resources, masteries — is exactly what survives between scenarios, so it stays.
  const resetScenario = () => {
    setCharacter((prev) => ({ ...prev, currentHp: prev.maxHp, conditions: {}, inTurn: false }))
    setCards((prev) =>
      prev.map((c) =>
        c.status === 'used' || c.status === 'lost' || c.status === 'active'
          ? { ...c, status: 'hand', activeCharges: undefined, activeHalf: undefined }
          : c,
      ),
    )
    setDeck((prev) => freshDeck(prev.composition))
    setScenarioEpoch((e) => e + 1)
    setConfirmReset(false)
  }

  // One-time data fix-ups for content stored before a correction landed. Each is
  // idempotent (no-op once applied): card text fills only blank fields; the perk
  // and mastery fixes rename only exact stale labels/placeholders, so picks,
  // achieved flags, and any user edits survive. The perk rename also re-drives
  // the modifier deck via the effect below (deck is derived from perk labels).
  useEffect(() => {
    setCards((prev) => withVoidwardenCardText(prev))
    setPerks((prev) => withVoidwardenPerkFixes(prev))
    setMasteries((prev) => withVoidwardenMasteryFixes(prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the modifier deck derived from the perks taken: the base 20 plus every
  // picked perk's deck effect. Whenever that derived composition changes (a perk
  // picked/unpicked), rebuild a fresh shuffled deck — perks change between
  // scenarios, so losing an in-progress draw here is expected, not a data loss.
  // No-op when the composition already matches (draws/reshuffles don't touch it).
  useEffect(() => {
    const desired = deriveDeckComposition(deckEffectsFromPerks(perks))
    setDeck((prev) => (sameComposition(prev.composition, desired) ? prev : freshDeck(desired)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perks])

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>{character.name || 'Frosthaven Companion'}</h1>
        <span className="header-sub">{character.className}</span>
        <div className="header-actions">
          {confirmReset ? (
            <>
              <span className="muted">Refill HP, clear conditions, return all cards, reshuffle deck?</span>
              <button type="button" className="secondary-btn small" onClick={resetScenario}>
                Reset
              </button>
              <button type="button" className="link-btn small" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className="secondary-btn small" onClick={() => setConfirmReset(true)}>
              New Scenario
            </button>
          )}
        </div>
      </header>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button key={t} type="button" className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'Character' && (
          <CharacterSheet
            key={scenarioEpoch}
            character={character}
            onChange={setCharacter}
            onLevelChange={() => setTab('Action Cards')}
          />
        )}
        {tab === 'Perks' && (
          <div className="panel-stack">
            <PerkList perks={perks} onChange={setPerks} character={character} onCharacterChange={setCharacter} />
            <MasteryList masteries={masteries} onChange={setMasteries} />
          </div>
        )}
        {tab === 'Action Cards' && (
          <ActionCards
            key={scenarioEpoch}
            cards={cards}
            onChange={setCards}
            character={character}
            onCharacterChange={setCharacter}
            deck={deck}
            onDeckChange={setDeck}
          />
        )}
      </main>
    </div>
  )
}

export default App
