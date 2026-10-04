import { describe, expect, it } from 'vitest'
import { Replayer } from '../../../lib/replayer'
import { search } from '../algorithms/search'
import { generateMaze } from '../maze'
import { applyEvent, cloneViz, freshState } from './reducer'

describe('pathfinding rewind', () => {
  it('seeking in any order gives the same state as replaying from the start', () => {
    const p = generateMaze(14, 24, 4)
    const events = search('astar', p)
    const size = p.rows * p.cols
    const r = new Replayer(events, () => freshState(size), applyEvent, cloneViz, 20)
    for (const t of [events.length, 10, 75, 30, events.length - 1, 0, 120, 119, 61]) {
      const expected = freshState(size)
      for (let i = 0; i < Math.min(t, events.length); i++) applyEvent(expected, events[i])
      expect(r.seek(t)).toEqual(expected)
    }
  })
})
