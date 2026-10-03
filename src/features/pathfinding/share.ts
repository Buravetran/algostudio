import { createProblem } from './grid'
import type { AlgoId, Problem } from './types'

export interface Experiment {
  algo: AlgoId
  problem: Problem
}

const ALGO_IDS: AlgoId[] = ['bfs', 'dfs', 'dijkstra', 'astar']

/**
 * Saves the configuration, never the animation: "v1,rows,cols,start,target,algo,rle".
 * Cells are run-length encoded as o = open, w = wall, h = heavy terrain.
 * Replaying the algorithm from this reproduces the whole experiment.
 */
export function encode({ algo, problem: p }: Experiment): string {
  let rle = ''
  let run = 0
  let prev = ''
  for (let n = 0; n < p.walls.length; n++) {
    const ch = p.walls[n] ? 'w' : p.cost[n] > 1 ? 'h' : 'o'
    if (ch === prev) run++
    else {
      if (prev) rle += run + prev
      prev = ch
      run = 1
    }
  }
  rle += run + prev
  return ['v1', p.rows, p.cols, p.start, p.target, algo, rle].join(',')
}

/** Returns null for anything malformed instead of throwing. */
export function decode(s: string): Experiment | null {
  const [v, rs, cs, ss, ts, algo, rle, ...extra] = s.split(',')
  if (v !== 'v1' || !rle || extra.length > 0) return null
  const rows = Number(rs)
  const cols = Number(cs)
  const start = Number(ss)
  const target = Number(ts)
  if (![rows, cols, start, target].every(Number.isInteger)) return null
  if (rows < 2 || cols < 2 || rows > 60 || cols > 60) return null
  if (!ALGO_IDS.includes(algo as AlgoId)) return null
  const size = rows * cols
  if (start < 0 || target < 0 || start >= size || target >= size || start === target) return null
  if (!/^(\d+[owh])+$/.test(rle)) return null
  const p = createProblem(rows, cols)
  p.start = start
  p.target = target
  let i = 0
  for (const m of rle.matchAll(/(\d+)([owh])/g)) {
    const k = Number(m[1])
    if (i + k > size) return null
    for (let j = 0; j < k; j++, i++) {
      if (m[2] === 'w') p.walls[i] = 1
      else if (m[2] === 'h') p.cost[i] = 5
    }
  }
  if (i !== size || p.walls[start] || p.walls[target]) return null
  return { algo: algo as AlgoId, problem: p }
}
