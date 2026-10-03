import type { Problem } from './types'

const DIRS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
] as const

export const idOf = (cols: number, r: number, c: number) => r * cols + c
export const label = (p: Problem, n: number) => `(${Math.floor(n / p.cols)},${n % p.cols})`

export function createProblem(rows: number, cols: number): Problem {
  return {
    rows,
    cols,
    walls: new Uint8Array(rows * cols),
    cost: new Uint8Array(rows * cols).fill(1),
    start: idOf(cols, Math.floor(rows / 2), 4),
    target: idOf(cols, Math.floor(rows / 2), cols - 5),
  }
}

/** Walkable 4-direction neighbours. Movement rules live here, not in the algorithms. */
export function neighbors(p: Problem, n: number): number[] {
  const r = Math.floor(n / p.cols)
  const c = n % p.cols
  const out: number[] = []
  for (const [dr, dc] of DIRS) {
    const rr = r + dr
    const cc = c + dc
    if (rr < 0 || cc < 0 || rr >= p.rows || cc >= p.cols) continue
    const m = idOf(p.cols, rr, cc)
    if (!p.walls[m]) out.push(m)
  }
  return out
}

export function manhattan(p: Problem, a: number, b: number): number {
  return (
    Math.abs(Math.floor(a / p.cols) - Math.floor(b / p.cols)) +
    Math.abs((a % p.cols) - (b % p.cols))
  )
}
