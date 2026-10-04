import { describe, expect, it } from 'vitest'
import { Replayer } from '../../../lib/replayer'
import { mulberry32 } from '../../../lib/rng'
import { sortEvents } from '../algorithms/sort'
import { applySortEvent, cloneSortViz, freshSortState } from './reducer'

describe('sorting rewind', () => {
  it('matches a full replay for every algorithm when seeking back and forth', () => {
    const rnd = mulberry32(8)
    const arr = Array.from({ length: 25 }, () => 1 + Math.floor(rnd() * 99))
    for (const algo of ['bubble', 'selection', 'insertion', 'merge', 'quick'] as const) {
      const events = sortEvents(algo, arr)
      const r = new Replayer(events, () => freshSortState(arr), applySortEvent, cloneSortViz, 30)
      for (let k = 0; k < 40; k++) {
        const t = Math.floor(rnd() * (events.length + 1))
        const expected = freshSortState(arr)
        for (let i = 0; i < t; i++) applySortEvent(expected, events[i])
        expect(r.seek(t)).toEqual(expected)
      }
    }
  })
})
