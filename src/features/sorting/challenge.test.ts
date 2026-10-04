import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../../lib/rng'
import { sortEvents } from './algorithms/sort'
import { makeQuestion } from './challenge'
import type { SortAlgoId } from './types'

const ALL: SortAlgoId[] = ['bubble', 'selection', 'insertion', 'merge', 'quick']

describe('makeQuestion', () => {
  it('asks about a real upcoming event and marks the right option', () => {
    const rnd = mulberry32(5)
    const input = Array.from({ length: 12 }, () => Math.floor(rnd() * 100))
    for (const algo of ALL) {
      const events = sortEvents(algo, input)
      for (let pos = 0; pos < events.length; pos += 7) {
        const q = makeQuestion(events, pos, input.length, rnd)
        if (!q) continue
        const e = events[q.eventIndex]
        expect(q.eventIndex).toBeGreaterThanOrEqual(pos)
        expect(e.type).toBe(q.kind)
        expect(new Set(q.options).size).toBe(q.options.length)
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        const truth =
          e.type === 'CMP' || e.type === 'SWAP' ? `positions ${e.i} and ${e.j}` : e.type === 'SET' ? `position ${e.i}` : e.type === 'PIVOT' ? `position ${e.index}` : ''
        expect(q.options[q.correct]).toBe(truth)
        for (const o of q.options) for (const m of o.match(/\d+/g)!) expect(Number(m)).toBeLessThan(input.length)
      }
    }
  })

  it('returns null when no questions remain', () => {
    const events = sortEvents('bubble', [3, 1, 2])
    expect(makeQuestion(events, events.length, 3, mulberry32(1))).toBeNull()
  })

  it('is deterministic for a given seed', () => {
    const events = sortEvents('quick', [5, 3, 8, 1, 9, 2])
    const a = makeQuestion(events, 0, 6, mulberry32(11))
    const b = makeQuestion(events, 0, 6, mulberry32(11))
    expect(a).toEqual(b)
  })
})
