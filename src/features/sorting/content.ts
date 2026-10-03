import type { SortAlgoId, SortEvent } from './types'

export const SORT_ALGOS: { id: SortAlgoId; name: string }[] = [
  { id: 'bubble', name: 'Bubble Sort' },
  { id: 'selection', name: 'Selection Sort' },
  { id: 'insertion', name: 'Insertion Sort' },
  { id: 'merge', name: 'Merge Sort' },
  { id: 'quick', name: 'Quick Sort' },
]

export const SORT_INFO: Record<SortAlgoId, { time: string; space: string; note: string }> = {
  bubble: { time: 'O(n²)', space: 'O(1)', note: 'Swaps out-of-order neighbours. The largest remaining value reaches the end each pass.' },
  selection: { time: 'O(n²)', space: 'O(1)', note: 'Finds the minimum of the unsorted part, then swaps it into place. At most n - 1 swaps.' },
  insertion: { time: 'O(n²), O(n) if nearly sorted', space: 'O(1)', note: 'Grows a sorted prefix. Drawn here as repeated adjacent swaps.' },
  merge: { time: 'O(n log n)', space: 'O(n)', note: 'Sorts halves, then merges them. Writes show the merged result. Highlights mark the positions being merged.' },
  quick: { time: 'O(n log n) average, O(n²) worst', space: 'O(log n)', note: 'Last element is the pivot (Lomuto partition). Sorted or reversed input hits the worst case.' },
}

interface Pseudo { lines: string[]; cmp: number; move: number; ok: number; pivot: number }
export const SORT_PSEUDO: Record<SortAlgoId, Pseudo> = {
  bubble: { lines: ['repeat n - 1 passes', '  for each adjacent pair in the unsorted part', '    compare the pair', '    if left > right: swap them', '  the largest value is now in place'], cmp: 3, move: 4, ok: 5, pivot: 0 },
  selection: { lines: ['for each position i from the left', '  assume position i holds the minimum', '  scan the rest, comparing with the minimum', '  swap the minimum into position i', '  position i is final'], cmp: 3, move: 4, ok: 5, pivot: 0 },
  insertion: { lines: ['for each element after the first', '  compare it with its left neighbour', '  while the neighbour is larger: swap leftwards', '  the prefix is sorted'], cmp: 2, move: 3, ok: 4, pivot: 0 },
  merge: { lines: ['split in half; sort each half', 'merge: compare the front value of each half', 'write the smaller one into the result', 'when all merges finish, it is sorted'], cmp: 2, move: 3, ok: 4, pivot: 0 },
  quick: { lines: ['pick the last element as the pivot', 'scan left to right, comparing with the pivot', 'swap values <= pivot to the left part', 'place the pivot between the parts: it is final', 'repeat on the left and right parts'], cmp: 2, move: 3, ok: 4, pivot: 1 },
}

export function sortLine(algo: SortAlgoId, e: SortEvent | undefined): number {
  if (!e) return 0
  const p = SORT_PSEUDO[algo]
  if (e.type === 'CMP') return p.cmp
  if (e.type === 'SWAP' || e.type === 'SET') return p.move
  if (e.type === 'OK') return p.ok
  if (e.type === 'PIVOT') return p.pivot
  return 0
}
