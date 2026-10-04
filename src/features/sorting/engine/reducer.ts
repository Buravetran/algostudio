import type { SortEvent } from '../types'

export interface SortViz {
  values: number[]
  compared: number[]
  changed: number[]
  pivot: number
  sorted: Uint8Array
  comparisons: number
  swaps: number
  writes: number
  done: boolean
}

export const freshSortState = (input: readonly number[]): SortViz => ({
  values: [...input],
  compared: [],
  changed: [],
  pivot: -1,
  sorted: new Uint8Array(input.length),
  comparisons: 0,
  swaps: 0,
  writes: 0,
  done: false,
})

export function applySortEvent(s: SortViz, e: SortEvent): void {
  s.compared = []
  s.changed = []
  switch (e.type) {
    case 'CMP':
      s.compared = [e.i, e.j]
      s.comparisons++
      break
    case 'SWAP':
      ;[s.values[e.i], s.values[e.j]] = [s.values[e.j], s.values[e.i]]
      s.changed = [e.i, e.j]
      s.swaps++
      break
    case 'SET':
      s.values[e.i] = e.value
      s.changed = [e.i]
      s.writes++
      break
    case 'PIVOT':
      s.pivot = e.index
      break
    case 'OK':
      s.sorted[e.index] = 1
      if (s.pivot === e.index) s.pivot = -1
      break
    case 'END':
      s.done = true
      s.pivot = -1
      break
  }
}

/** Copy of the state, used for rewind snapshots. */
export const cloneSortViz = (s: SortViz): SortViz => ({
  ...s,
  values: [...s.values],
  compared: [...s.compared],
  changed: [...s.changed],
  sorted: s.sorted.slice(),
})
