import { useState } from 'react'
import { Workspace } from './features/pathfinding/components/Workspace'
import { SortWorkspace } from './features/sorting/components/SortWorkspace'

type Lab = 'pathfinding' | 'sorting'
const LABS: { id: Lab; name: string }[] = [
  { id: 'pathfinding', name: 'Pathfinding' },
  { id: 'sorting', name: 'Sorting' },
]

export function App() {
  const [lab, setLab] = useState<Lab>('pathfinding')
  return (
    <>
      <nav className="tabs" aria-label="Laboratories">
        <b>AlgoStudio</b>
        {LABS.map((l) => (
          <button key={l.id} aria-current={lab === l.id ? 'page' : undefined} onClick={() => setLab(l.id)}>
            {l.name}
          </button>
        ))}
      </nav>
      {lab === 'pathfinding' ? <Workspace /> : <SortWorkspace />}
    </>
  )
}
