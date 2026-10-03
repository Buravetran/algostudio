import { describe, expect, it } from 'vitest'
import { search, summarize } from './algorithms/search'
import { generateMaze } from './maze'

describe('generateMaze', () => {
  it('always connects start to target', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const p = generateMaze(14, 24, seed)
      expect(p.walls[p.start]).toBe(0)
      expect(p.walls[p.target]).toBe(0)
      expect(summarize(search('bfs', p)).found).toBe(true)
    }
  })

  it('is reproducible for the same seed and differs across seeds', () => {
    const a = generateMaze(14, 24, 9)
    const b = generateMaze(14, 24, 9)
    const c = generateMaze(14, 24, 10)
    expect(Array.from(a.walls)).toEqual(Array.from(b.walls))
    expect(Array.from(a.walls)).not.toEqual(Array.from(c.walls))
  })
})
