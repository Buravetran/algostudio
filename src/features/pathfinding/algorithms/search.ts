import { manhattan, neighbors } from '../grid'
import type { AlgoId, PathEvent, Problem } from '../types'
import { MinHeap } from './heap'

/**
 * BFS, DFS, Dijkstra and A* share one loop and differ only in the frontier:
 * FIFO queue, LIFO stack, or a priority queue keyed by g or g + h.
 * Pure: no UI knowledge, same input always gives the same events.
 */
export function search(algo: AlgoId, p: Problem): PathEvent[] {
  const size = p.rows * p.cols
  const g = new Float64Array(size).fill(Infinity)
  const prev = new Int32Array(size).fill(-1)
  const visited = new Uint8Array(size)
  const events: PathEvent[] = []
  const unit = algo === 'bfs' || algo === 'dfs' // these ignore terrain cost
  const h = (n: number) => manhattan(p, n, p.target)
  const priority =
    algo === 'astar' ? (n: number) => g[n] + h(n) : algo === 'dijkstra' ? (n: number) => g[n] : null

  const heap = new MinHeap<number>()
  const list: number[] = []
  let head = 0
  const add = (n: number) => {
    if (priority) heap.push(priority(n), n)
    else list.push(n)
  }
  const count = () => (priority ? heap.size : list.length - head)
  const take = () => (priority ? heap.pop()! : algo === 'bfs' ? list[head++] : list.pop()!)

  g[p.start] = 0
  add(p.start)
  events.push({ type: 'PUSH', node: p.start, from: -1, g: 0, f: priority ? priority(p.start) : null })

  let found = false
  while (count() > 0) {
    const n = take()
    if (visited[n]) continue // stale frontier entry
    visited[n] = 1
    events.push({ type: 'POP', node: n, g: g[n], f: priority ? priority(n) : null })
    if (n === p.target) {
      found = true
      events.push({ type: 'REACH', node: n })
      break
    }
    for (const m of neighbors(p, n)) {
      if (visited[m]) continue
      const cost = g[n] + (unit ? 1 : p.cost[m])
      if (algo === 'bfs' ? g[m] < Infinity : algo !== 'dfs' && cost >= g[m]) continue
      const f = priority ? cost + (algo === 'astar' ? h(m) : 0) : null
      const old = g[m] === Infinity ? null : g[m]
      events.push(
        unit
          ? { type: 'PUSH', node: m, from: n, g: cost, f }
          : { type: 'RELAX', node: m, from: n, old, g: cost, f },
      )
      g[m] = cost
      prev[m] = n
      add(m)
    }
  }

  if (found) {
    const path: number[] = []
    for (let x = p.target; x !== -1; x = prev[x]) path.push(x)
    path.reverse()
    const total = path.slice(1).reduce((sum, x) => sum + p.cost[x], 0)
    events.push({ type: 'PATH', path, cost: total })
  }
  events.push({ type: 'DONE', found })
  return events
}

export interface Summary {
  found: boolean
  expanded: number
  path: number[]
  cost: number | null
  events: number
}

export function summarize(events: PathEvent[]): Summary {
  const pe = events.find((e) => e.type === 'PATH')
  return {
    found: pe !== undefined,
    expanded: events.filter((e) => e.type === 'POP').length,
    path: pe && pe.type === 'PATH' ? pe.path : [],
    cost: pe && pe.type === 'PATH' ? pe.cost : null,
    events: events.length,
  }
}
