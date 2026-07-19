import { useState } from 'react'
import './App.css'
import { CharacterSheet } from './components/CharacterSheet'
import { PerkList } from './components/PerkList'
import { ModifierDeck } from './components/ModifierDeck'
import { ActionCards } from './components/ActionCards'
import { useLocalStorage } from './hooks/useLocalStorage'
import { freshDeck, defaultComposition } from './lib/modifierDeck'
import { VOIDWARDEN_HP_BY_LEVEL } from './data/voidwarden'
import type { ActionCard, CharacterState, ModifierDeckState, Perk } from './types'

const TABS = ['Character', 'Perks', 'Modifier Deck', 'Action Cards'] as const
type Tab = (typeof TABS)[number]

const defaultCharacter: CharacterState = {
  name: '',
  className: 'Human Voidwarden',
  level: 1,
  xp: 0,
  gold: 0,
  maxHp: VOIDWARDEN_HP_BY_LEVEL[1],
  currentHp: VOIDWARDEN_HP_BY_LEVEL[1],
}

function App() {
  const [tab, setTab] = useState<Tab>('Character')
  const [character, setCharacter] = useLocalStorage<CharacterState>('fh-character', defaultCharacter)
  const [perks, setPerks] = useLocalStorage<Perk[]>('fh-perks', [])
  const [deck, setDeck] = useLocalStorage<ModifierDeckState>('fh-deck', freshDeck(defaultComposition()))
  const [cards, setCards] = useLocalStorage<ActionCard[]>('fh-cards', [])

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
        {tab === 'Perks' && <PerkList perks={perks} onChange={setPerks} />}
        {tab === 'Modifier Deck' && <ModifierDeck deck={deck} onChange={setDeck} />}
        {tab === 'Action Cards' && <ActionCards cards={cards} onChange={setCards} />}
      </main>
    </div>
  )
}

export default App
