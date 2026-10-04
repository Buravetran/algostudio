import type { PathEvent } from '../types'

/** Visualization state derived from events. Never stored in CSS classes. */
export interface VizState {
  discovered: Uint8Array
  visited: Uint8Array
  current: number
  path: number[]
  expanded: number
  discoveredCount: number
  updates: number
  cost: number | null
  done: boolean
  found: boolean
}

export const freshState = (size: number): VizState => ({
  discovered: new Uint8Array(size),
  visited: new Uint8Array(size),
  current: -1,
  path: [],
  expanded: 0,
  discoveredCount: 0,
  updates: 0,
  cost: null,
  done: false,
  found: false,
})

/** Mutates for speed. Replaying from freshState always gives the same result. */
export function applyEvent(s: VizState, e: PathEvent): void {
  switch (e.type) {
    case 'PUSH':
    case 'RELAX':
      if (!s.discovered[e.node]) {
        s.discovered[e.node] = 1
        s.discoveredCount++
      }
      if (e.type === 'RELAX' && e.old !== null) s.updates++
      break
    case 'POP':
      s.visited[e.node] = 1
      s.current = e.node
      s.expanded++
      break
    case 'PATH':
      s.path = e.path
      s.cost = e.cost
      break
    case 'DONE':
      s.done = true
      s.found = e.found
      break
  }
}

/** Copy of the state, used for rewind snapshots. */
export const cloneViz = (s: VizState): VizState => ({
  ...s,
  discovered: s.discovered.slice(),
  visited: s.visited.slice(),
  path: [...s.path],
})
