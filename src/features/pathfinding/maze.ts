import { mulberry32 } from '../../lib/rng'
import { createProblem, idOf } from './grid'
import type { Problem } from './types'

/**
 * Perfect maze by randomized depth-first carving on even-numbered cells.
 * Every open cell is reachable from every other, so start and target always connect.
 */
export function generateMaze(rows: number, cols: number, seed: number): Problem {
  const p = createProblem(rows, cols)
  p.walls.fill(1)
  const rnd = mulberry32(seed)
  const open = (r: number, c: number) => {
    p.walls[idOf(cols, r, c)] = 0
  }
  open(0, 0)
  const stack: [number, number][] = [[0, 0]]
  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1]
    const options = (
      [
        [r - 2, c],
        [r + 2, c],
        [r, c - 2],
        [r, c + 2],
      ] as [number, number][]
    ).filter(([a, b]) => a >= 0 && b >= 0 && a < rows && b < cols && p.walls[idOf(cols, a, b)] === 1)
    if (options.length === 0) {
      stack.pop()
      continue
    }
    const [nr, nc] = options[Math.floor(rnd() * options.length)]
    open((r + nr) / 2, (c + nc) / 2)
    open(nr, nc)
    stack.push([nr, nc])
  }
  p.start = idOf(cols, 0, 0)
  p.target = idOf(cols, (rows - 1) & ~1, (cols - 1) & ~1)
  return p
}
