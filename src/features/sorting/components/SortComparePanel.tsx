import { useMemo } from 'react'
import { sortEvents } from '../algorithms/sort'
import { SORT_ALGOS } from '../content'

/** Every algorithm gets its own copy of the same array. Counts come from the real events. */
export function SortComparePanel({ arr }: { arr: number[] }) {
  const rows = useMemo(
    () =>
      SORT_ALGOS.map((a) => {
        const t0 = performance.now()
        const ev = sortEvents(a.id, arr)
        const ms = performance.now() - t0
        const c = (t: string) => ev.filter((e) => e.type === t).length
        return { a, cmp: c('CMP'), swaps: c('SWAP'), writes: c('SET'), events: ev.length, ms }
      }),
    [arr],
  )
  return (
    <section className="panel">
      <h2>Compare on this array</h2>
      <div className="tw">
        <table className="mono small">
          <thead>
            <tr><th>Algorithm</th><th>Comparisons</th><th>Swaps</th><th>Writes</th><th>Events</th><th>Time*</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.a.id}>
                <td>{r.a.name}</td><td>{r.cmp}</td><td>{r.swaps}</td><td>{r.writes}</td><td>{r.events}</td><td>{r.ms.toFixed(2)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        Counts are algorithmic and depend on this input. *Time is one run in this browser and varies by device, so it
        doesn't rank algorithms. Merge sort reports writes, not swaps, because it overwrites positions.
      </p>
    </section>
  )
}
