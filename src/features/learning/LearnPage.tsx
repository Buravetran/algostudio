import { useState } from 'react'
import { INFO, PSEUDO } from '../pathfinding/content'
import type { AlgoId } from '../pathfinding/types'
import { SORT_INFO, SORT_PSEUDO } from '../sorting/content'
import type { SortAlgoId } from '../sorting/types'
import { LESSONS } from './lessons'
import type { Lesson } from './lessons'

interface Props {
  onOpen: (lesson: Lesson) => void
}

export function LearnPage({ onOpen }: Props) {
  const [id, setId] = useState<Lesson['id']>('dijkstra')
  const lesson = LESSONS.find((l) => l.id === id)!
  const info = lesson.lab === 'pathfinding' ? INFO[lesson.id as AlgoId] : SORT_INFO[lesson.id as SortAlgoId]
  const pseudo = lesson.lab === 'pathfinding' ? PSEUDO[lesson.id as AlgoId] : SORT_PSEUDO[lesson.id as SortAlgoId].lines

  return (
    <main className="learn">
      <nav className="panel lessons" aria-label="Algorithms">
        {(['pathfinding', 'sorting'] as const).map((lab) => (
          <div key={lab}>
            <h2>{lab === 'pathfinding' ? 'Pathfinding' : 'Sorting'}</h2>
            <div className="stack">
              {LESSONS.filter((l) => l.lab === lab).map((l) => (
                <button key={l.id} aria-current={l.id === id ? 'page' : undefined} onClick={() => setId(l.id)}>
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <article className="panel lesson">
        <h1>{lesson.name}</h1>
        <p className="lead">{lesson.intuition}</p>
        <button className="primary" onClick={() => onOpen(lesson)}>Open {lesson.name} in the laboratory</button>

        <h2>What problem does this solve?</h2>
        <p>{lesson.problem}</p>

        <h2>How does it work?</h2>
        <ol>{lesson.how.map((s, i) => <li key={i}>{s}</li>)}</ol>

        <h2>Pseudocode</h2>
        <div className="code mono">
          {pseudo.map((l, i) => <div key={i}>{String(i + 1).padStart(2, '0')} {l}</div>)}
        </div>

        <h2>Complexity</h2>
        <dl className="mono">
          <dt>Time</dt><dd>{info.time}</dd>
          <dt>Space</dt><dd>{info.space}</dd>
        </dl>

        <h2>Data structures used</h2>
        <p>{lesson.structures}</p>

        <h2>Important assumptions</h2>
        <p>{lesson.assumptions}</p>

        <h2>Common mistakes</h2>
        <ul>{lesson.mistakes.map((m, i) => <li key={i}>{m}</li>)}</ul>

        <h2>Test yourself</h2>
        {lesson.questions.map((q, i) => (
          <details key={i}>
            <summary>{q.q}</summary>
            <p>{q.a}</p>
          </details>
        ))}
      </article>
    </main>
  )
}
