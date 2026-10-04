import { useState } from 'react'
import { LearnPage } from './features/learning/LearnPage'
import type { Lesson } from './features/learning/lessons'
import { Workspace } from './features/pathfinding/components/Workspace'
import type { AlgoId } from './features/pathfinding/types'
import { SortWorkspace } from './features/sorting/components/SortWorkspace'
import type { SortAlgoId } from './features/sorting/types'

type Tab = 'pathfinding' | 'sorting' | 'learn'
const TABS: { id: Tab; name: string }[] = [
  { id: 'pathfinding', name: 'Pathfinding' },
  { id: 'sorting', name: 'Sorting' },
  { id: 'learn', name: 'Learn' },
]

export function App() {
  const [tab, setTab] = useState<Tab>(() => (location.hash.startsWith('#s=') ? 'sorting' : 'pathfinding'))
  const [pathAlgo, setPathAlgo] = useState<AlgoId | undefined>()
  const [sortAlgo, setSortAlgo] = useState<SortAlgoId | undefined>()

  // A lesson can launch its laboratory with that algorithm already selected.
  const openLesson = (l: Lesson) => {
    if (l.lab === 'pathfinding') setPathAlgo(l.id as AlgoId)
    else setSortAlgo(l.id as SortAlgoId)
    setTab(l.lab)
  }

  return (
    <>
      <nav className="tabs" aria-label="Sections">
        <b>AlgoStudio</b>
        {TABS.map((t) => (
          <button key={t.id} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
            {t.name}
          </button>
        ))}
      </nav>
      {tab === 'pathfinding' && <Workspace key={pathAlgo ?? 'default'} initialAlgo={pathAlgo} />}
      {tab === 'sorting' && <SortWorkspace key={sortAlgo ?? 'default'} initialAlgo={sortAlgo} />}
      {tab === 'learn' && <LearnPage onOpen={openLesson} />}
    </>
  )
}
