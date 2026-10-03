import type { SortEvent } from '../types'
import type { SortViz } from './reducer'

/** Explanation from the event and the state after it was applied. */
export function explainSort(e: SortEvent | undefined, s: SortViz): string {
  if (!e) return 'Press Play or Next. Each bar is one array value; every step is one logged operation.'
  switch (e.type) {
    case 'CMP': {
      const x = s.values[e.i]
      const y = s.values[e.j]
      return `Compare position ${e.i} (${x}) with position ${e.j} (${y}): ${x > y ? 'the left value is larger' : 'they are already in order'}.`
    }
    case 'SWAP':
      return `Swap positions ${e.i} and ${e.j}. Position ${e.i} now holds ${s.values[e.i]} and position ${e.j} holds ${s.values[e.j]}.`
    case 'SET':
      return `Write ${e.value} into position ${e.i}.`
    case 'PIVOT':
      return `The pivot is position ${e.index} (value ${s.values[e.index]}). Values less than or equal to it will be moved to its left.`
    case 'OK':
      return `Position ${e.index} holds its final value.`
    case 'END':
      return 'Done: the array is sorted.'
  }
}
