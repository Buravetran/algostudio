import { useRef } from 'react'
import type { PointerEvent } from 'react'
import type { VizState } from '../engine/reducer'
import type { Problem } from '../types'

export type DragMode = 'start' | 'target' | 'paint'

interface Props {
  problem: Problem
  viz: VizState
  onPaint: (node: number, mode: DragMode) => void
  /** When set, the grid is in predict mode: a click picks a cell instead of editing. */
  onPick?: (node: number) => void
}

export function Grid({ problem: p, viz, onPaint, onPick }: Props) {
  const drag = useRef<DragMode | null>(null)
  const onPath = new Set(viz.path)

  const nodeAt = (e: PointerEvent): number => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    const v = el?.dataset.i
    return v === undefined ? -1 : Number(v)
  }

  const cls = (n: number) =>
    [
      'cell',
      p.walls[n] ? 'wall' : p.cost[n] > 1 ? 'heavy' : '',
      viz.visited[n] ? 'visited' : '',
      viz.discovered[n] && !viz.visited[n] ? 'frontier' : '',
      onPath.has(n) ? 'path' : '',
      n === p.start ? 'start' : '',
      n === p.target ? 'target' : '',
      n === viz.current && !viz.done ? 'current' : '',
    ]
      .filter(Boolean)
      .join(' ')

  return (
    <div
      className={onPick ? 'grid picking' : 'grid'}
      role="grid"
      aria-label="Pathfinding grid"
      style={{ gridTemplateColumns: `repeat(${p.cols}, 1fr)` }}
      onPointerDown={(e) => {
        const n = nodeAt(e)
        if (n < 0) return
        if (onPick) {
          onPick(n)
          return
        }
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = n === p.start ? 'start' : n === p.target ? 'target' : 'paint'
        onPaint(n, drag.current)
      }}
      onPointerMove={(e) => {
        if (!drag.current) return
        const n = nodeAt(e)
        if (n >= 0) onPaint(n, drag.current)
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      {Array.from({ length: p.rows * p.cols }, (_, n) => (
        <div key={n} data-i={n} role="gridcell" className={cls(n)} />
      ))}
    </div>
  )
}
