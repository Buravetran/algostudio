import type { SortViz } from '../engine/reducer'

export function Bars({ viz }: { viz: SortViz }) {
  const max = Math.max(...viz.values, 1)
  const labels = viz.values.length <= 24
  return (
    <div className="bars" role="img" aria-label={`Array of ${viz.values.length} values: ${viz.values.join(', ')}`}>
      {viz.values.map((v, i) => {
        const cls = [
          'bar',
          viz.sorted[i] ? 'sorted' : '',
          viz.changed.includes(i) ? 'changed' : '',
          viz.compared.includes(i) ? 'compared' : '',
          viz.pivot === i ? 'pivot' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <div key={i} className={cls} style={{ height: `${(v / max) * 100}%` }} title={`position ${i}: ${v}`}>
            {labels ? v : ''}
          </div>
        )
      })}
    </div>
  )
}
