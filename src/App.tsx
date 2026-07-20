import { useEffect, useState } from 'react'
import './App.css'
import { CharacterSheet } from './components/CharacterSheet'
import { PerkList } from './components/PerkList'
import { MasteryList } from './components/MasteryList'
import { ModifierDeck } from './components/ModifierDeck'
import { ActionCards } from './components/ActionCards'
import { useLocalStorage } from './hooks/useLocalStorage'
import { freshDeck, defaultComposition } from './lib/modifierDeck'
import { VOIDWARDEN_HP_BY_LEVEL, buildVoidwardenActionCards, withVoidwardenCardText } from './data/voidwarden'
import { VOIDWARDEN_PERKS } from './data/voidwardenPerks'
import { VOIDWARDEN_MASTERIES } from './data/voidwardenMasteries'
import { RESOURCE_TYPES } from './types'
import type { ActionCard, CharacterState, Mastery, ModifierDeckState, Perk, ResourceType } from './types'

const TABS = ['Character', 'Perks', 'Modifier Deck', 'Action Cards'] as const
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
  return {
    ...defaultCharacter,
    ...(v as Partial<CharacterState>),
    resources: { ...emptyResources, ...(storedResources as Partial<Record<ResourceType, number>>) },
  }
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

  // One-time fill of canonical card text onto cards stored before the text
  // existed. Only blank fields are touched, so it's a no-op once applied.
  useEffect(() => {
    setCards((prev) => withVoidwardenCardText(prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>{character.name || 'Frosthaven Companion'}</h1>
        <span className="header-sub">{character.className}</span>
      </header>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button key={t} type="button" className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'Character' && <CharacterSheet character={character} onChange={setCharacter} />}
        {tab === 'Perks' && (
          <div className="panel-stack">
            <PerkList perks={perks} onChange={setPerks} character={character} onCharacterChange={setCharacter} />
            <MasteryList masteries={masteries} onChange={setMasteries} />
          </div>
        )}
        {tab === 'Modifier Deck' && <ModifierDeck deck={deck} onChange={setDeck} />}
        {tab === 'Action Cards' && <ActionCards cards={cards} onChange={setCards} />}
      </main>
    </div>
  )
}

export default App
