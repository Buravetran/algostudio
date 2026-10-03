import { describe, expect, it } from 'vitest'
import { createProblem, neighbors } from '../grid'
import type { AlgoId, Problem } from '../types'
import { search, summarize } from './search'

/** Build a problem from ASCII: S start, T target, # wall, 2-9 terrain cost, . open. */
function parse(rows: string[]): Problem {
  const p = createProblem(rows.length, rows[0].length)
  rows.forEach((line, r) =>
    [...line].forEach((ch, c) => {
      const n = r * p.cols + c
      if (ch === 'S') p.start = n
      else if (ch === 'T') p.target = n
      else if (ch === '#') p.walls[n] = 1
      else if (/[2-9]/.test(ch)) p.cost[n] = Number(ch)
    }),
  )
  return p
}

const ALL: AlgoId[] = ['bfs', 'dfs', 'dijkstra', 'astar']

function assertValidPath(p: Problem, path: number[], cost: number) {
  expect(path[0]).toBe(p.start)
  expect(path[path.length - 1]).toBe(p.target)
  for (let i = 1; i < path.length; i++) expect(neighbors(p, path[i - 1])).toContain(path[i])
  expect(path.slice(1).reduce((s, n) => s + p.cost[n], 0)).toBe(cost)
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomProblem(seed: number): Problem {
  const r = rng(seed)
  const p = createProblem(8, 10)
  for (let n = 0; n < p.walls.length; n++) {
    if (r() < 0.25) p.walls[n] = 1
    p.cost[n] = 1 + Math.floor(r() * 4)
  }
  p.start = 0
  p.target = p.walls.length - 1
  p.walls[p.start] = 0
  p.walls[p.target] = 0
  return p
}

describe('pathfinding correctness', () => {
  it('returns a valid path from start to target for every algorithm', () => {
    const p = parse(['S...', '.##.', '...T'])
    for (const a of ALL) {
      const s = summarize(search(a, p))
      expect(s.found).toBe(true)
      assertValidPath(p, s.path, s.cost!)
    }
  })

  it('reports no path when the target is unreachable', () => {
    const p = parse(['S.#T', '..#.'])
    for (const a of ALL) {
      const ev = search(a, p)
      expect(summarize(ev).found).toBe(false)
      expect(ev[ev.length - 1]).toEqual({ type: 'DONE', found: false })
    }
  })

  it('Dijkstra and A* avoid costly terrain that BFS walks through', () => {
    const p = parse(['S999T', '.....'])
    const bfs = summarize(search('bfs', p)).cost!
    const dij = summarize(search('dijkstra', p)).cost!
    expect(dij).toBeLessThan(bfs)
    expect(summarize(search('astar', p)).cost).toBe(dij)
  })

  it('BFS finds the fewest steps on an unweighted grid', () => {
    const p = parse(['S.#.', '.##.', '...T'])
    expect(summarize(search('bfs', p)).path.length - 1).toBe(5)
  })

  it('A* matches Dijkstra cost on 200 seeded random grids', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const p = randomProblem(seed)
      const d = summarize(search('dijkstra', p))
      const a = summarize(search('astar', p))
      expect(a.found).toBe(d.found)
      expect(a.cost).toBe(d.cost)
      if (d.found) assertValidPath(p, d.path, d.cost!)
    }
  })

  it('is deterministic', () => {
    const p = randomProblem(7)
    expect(JSON.stringify(search('astar', p))).toBe(JSON.stringify(search('astar', p)))
  })
})
