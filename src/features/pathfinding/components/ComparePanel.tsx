import { useMemo } from 'react'
import { search, summarize } from '../algorithms/search'
import { ALGOS } from '../content'
import type { Problem } from '../types'

/** Runs every algorithm on the same grid and reports counts from the real events. */
export function ComparePanel({ problem }: { problem: Problem }) {
  const rows = useMemo(
    () =>
      ALGOS.map((a) => {
        const t0 = performance.now()
        const s = summarize(search(a.id, problem))
        return { a, s, ms: performance.now() - t0 }
      }),
    [problem],
  )
  return (
    <section className="panel">
      <h2>Compare on this grid</h2>
      <div className="tw">
        <table className="mono small">
          <thead>
            <tr><th>Algorithm</th><th>Found</th><th>Expanded</th><th>Path cost</th><th>Steps</th><th>Time*</th></tr>
          </thead>
          <tbody>
            {rows.map(({ a, s, ms }) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{s.found ? 'yes' : 'no'}</td>
                <td>{s.expanded}</td>
                <td>{s.cost ?? '–'}</td>
                <td>{s.found ? s.path.length - 1 : '–'}</td>
                <td>{ms.toFixed(2)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        Counts come from the real run on this grid. *Time is one run in this browser and varies by device, so it
        doesn't rank algorithms. BFS and DFS ignore terrain weights while searching; path cost still sums them.
      </p>
    </section>
  )
}
