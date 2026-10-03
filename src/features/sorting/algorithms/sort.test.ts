import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../../../lib/rng'
import type { SortAlgoId, SortEvent } from '../types'
import { sortEvents } from './sort'

const ALL: SortAlgoId[] = ['bubble', 'selection', 'insertion', 'merge', 'quick']

function replay(input: number[], events: SortEvent[]): number[] {
  const a = [...input]
  for (const e of events) {
    if (e.type === 'SWAP') [a[e.i], a[e.j]] = [a[e.j], a[e.i]]
    else if (e.type === 'SET') a[e.i] = e.value
  }
  return a
}

const count = (ev: SortEvent[], t: SortEvent['type']) => ev.filter((e) => e.type === t).length

describe('sorting correctness', () => {
  for (const algo of ALL) {
    it(`${algo}: output is sorted and is a permutation of the input`, () => {
      const rnd = mulberry32(42)
      const cases: number[][] = [[], [5], [2, 1], [3, 3, 3], [1, 2, 3, 4], [4, 3, 2, 1], [5, 1, 5, 1, 5]]
      for (let t = 0; t < 150; t++) {
        const n = Math.floor(rnd() * 40)
        const range = t % 2 === 0 ? 10 : 1000
        cases.push(Array.from({ length: n }, () => Math.floor(rnd() * range)))
      }
      for (const input of cases) {
        const ev = sortEvents(algo, input)
        expect(replay(input, ev)).toEqual([...input].sort((x, y) => x - y))
        expect(ev[ev.length - 1]).toEqual({ type: 'END' })
        const oks = ev.filter((e) => e.type === 'OK').map((e) => (e as { index: number }).index)
        expect(oks.length).toBe(input.length)
        expect(new Set(oks).size).toBe(input.length)
      }
    })
  }

  it('does not modify its input', () => {
    const input = [3, 1, 2]
    sortEvents('quick', input)
    expect(input).toEqual([3, 1, 2])
  })

  it('has the expected comparison counts on small inputs', () => {
    const sorted = [1, 2, 3, 4, 5, 6]
    expect(count(sortEvents('bubble', sorted), 'CMP')).toBe(15)
    expect(count(sortEvents('selection', sorted), 'CMP')).toBe(15)
    expect(count(sortEvents('insertion', sorted), 'CMP')).toBe(5)
    expect(count(sortEvents('insertion', sorted), 'SWAP')).toBe(0)
    expect(count(sortEvents('insertion', [6, 5, 4, 3, 2, 1]), 'SWAP')).toBe(15)
  })

  it('selection sort never swaps more than n - 1 times', () => {
    const rnd = mulberry32(7)
    for (let t = 0; t < 50; t++) {
      const input = Array.from({ length: 20 }, () => Math.floor(rnd() * 100))
      expect(count(sortEvents('selection', input), 'SWAP')).toBeLessThanOrEqual(19)
    }
  })
})
